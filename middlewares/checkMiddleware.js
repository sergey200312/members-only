const checkMembership = (req, res, next) => {
    if(req.user && req.user.isMember) {
        next();
    }else{
        res.redirect('/')
    }
}