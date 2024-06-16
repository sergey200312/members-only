const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    content: {type: String, required: true},
    user: { type: Schema.Types.ObjectId, ref: "User"},
    date: {type: Date}
})

MessageSchema.virtual('formattedDate').get(function () {
    return DateTime.fromJSDate(this.date).toFormat('dd-MM-yyyy HH:mm:ss');
  });

module.exports = mongoose.model("Message", MessageSchema);