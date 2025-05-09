const jwt = require("jsonwebtoken");

function authAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render("unauthorized");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if(!req.user.isAdmin) {
            return res.status(401).render("unauthorized-admin");
        }
        next();
    }catch(error) {
        return res.status(401).render("unauthorized"); 
    }
}

module.exports = authAdmin;