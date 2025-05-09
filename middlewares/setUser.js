const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error) {
        req.user = null;
        next();
    }
}

module.exports = auth;