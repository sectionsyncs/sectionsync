const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const setUser = require("../middlewares/setUser");
const authAdmin = require("../middlewares/authAdmin");
const projectModel = require("../models/project.model");
const category = require("../models/category.model");
const section = require("../models/section.model");
const dotenv = require("dotenv");
dotenv.config();

router.get("/", authAdmin, async(req,res) => {
    try {
        const totalUsers = await userModel.countDocuments({ isAdmin: false });
        const monthlyActive = await userModel.countDocuments({ isAdmin: false, plan: "monthly", plan_status: "active" });
        const yearlyActive = await userModel.countDocuments({ isAdmin: false, plan: "yearly", plan_status: "active" });
        const monthlyInactive = await userModel.countDocuments({ isAdmin: false, plan: "monthly", plan_status: "inactive" });

        res.render('dashboard', {
            user: req.user,
            totalUsers,
            monthlyActive,
            yearlyActive,
            monthlyInactive
        });
    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
// GET /user/logout
