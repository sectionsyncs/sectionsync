const express = require("express");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();
const setUser = require("../middlewares/setUser");

router.get("/", setUser,async(req,res) => {
    res.render('home',{
        user: req.user
    });
});

router.get("/terms-and-condition", setUser,async(req,res) => {
    res.render('terms-and-condition',{
        user: req.user
    });
});

router.get("/privacy-policy", setUser,async(req,res) => {
    res.render('privacy-policy',{
        user: req.user
    });
});


router.get("/about", setUser,async(req,res) => {
    res.render('about',{
        user: req.user
    });
});


router.get("/contact", setUser,async(req,res) => {
    res.render('contact',{
        user: req.user
    });
});

module.exports = router;