const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const bycript = require("bcrypt");
const jwt = require("jsonwebtoken");
const setUser = require("../middlewares/setUser");
const auth = require("../middlewares/auth");
const projectModel = require("../models/project.model");
const category = require("../models/category.model");
const section = require("../models/section.model");
const razorpay = require("../config/razorpay");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

router.get("/", async(req,res) => {
    res.render('index');
});

router.get("/register", setUser,async(req, res) => {
    if(req.user) {
        res.redirect('/user/account');
    }else {
        res.render('register', {user: req.user });
    }
});

/*
a@a.com
*/ 

router.post("/register", 
    body('email').trim().isEmail().isLength({ min: 13}), 
    body('password').trim().isStrongPassword().isLength({ min: 5 }),
    body('username').trim().isLength({ min : 3}) 
    ,async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array(),
            message: "Invaild Data"
        });
    }

    const { username, email, password } = req.body;



    try {
        const hashPassword = await bycript.hash(password, 10);
        const newUser = await userModel.create({
            username,
            email,
            password: hashPassword
        });

        const token = jwt.sign({ 
                userID: newUser._id,
                email: newUser.email,
                username: newUser.username,
                subscriptionId: newUser.subscriptionId,
                plan: newUser.plan,
                plan_status: newUser.plan_status,
                startDate: newUser.startDate,
                endDate: newUser.endDate,
                email_verified: newUser.email_verified,
                isAdmin: newUser.isAdmin
            },
            process.env.JWT_SECRET
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.status(200).redirect("/");
    }catch(error){
        if(error.code === 11000){
            res.status(409).json({
                "message": "User already exist"
            });
        }
    }
});

router.get("/login", setUser,
    async (req, res) => {
        if(req.user) {
            res.redirect('/user/account');
        }else {
            res.render('login', {user: req.user });
        }
    });

router.get("/error", async(req, res) => {
    res.render("user-error");
})

router.post("/login", 
    body("username").trim().isLength({ min: 3 }),
    body("password").trim().isStrongPassword().isLength({ min: 5 }),
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Invaild data"
            });        
        }


        const { username, password } = req.body;
        const user = await userModel.findOne({
            username: username
        })

        if(!user) {
            return res.redirect('/user/error');
        }

        const isMatch = await bycript.compare(password, user.password);

        if(!isMatch) {
            return res.redirect('/user/error');
        }

        const token = jwt.sign({ 
                userID: user._id,
                email: user.email,
                username: user.username,
                subscriptionId: user.subscriptionId,
                plan: user.plan,
                plan_status: user.plan_status,
                startDate: user.startDate,
                endDate: user.endDate,
                email_verified: user.email_verified,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).redirect("/");
    }
)

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/user/login");
});


// GET /user/check-username?username=somevalue
router.get('/check-username', async (req, res) => {
const { username } = req.query;

  if (!username || username.length < 3) {
    return res.status(400).json({ available: false, message: 'Invalid username' });
  }

  try {
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.json({ available: false, message: 'Username is taken' });
    } else {
      return res.json({ available: true, message: 'Username is available' });
    }
  } catch (err) {
    console.error('Error checking username:', err);
    return res.status(500).json({ available: false, message: 'Server error' });
  }
});

router.get("/account", setUser, async (req, res) => {
    //console.log(req.user);
    res.render('account', {
        user: req.user
    });
});

router.get("/projects", auth, async (req, res) => {
    //console.log(req.user);
    const projects = await projectModel.find({
        user: req.user.userID
    });

    //console.log(projects);

    res.render('projects', {
        user: req.user,
        projects: projects
    });
});

router.get("/projects/new", auth, async (req, res) => {
    res.render('newProject', {
        user: req.user
    });
});

router.post("/projects/new", auth, async (req, res) => {
    const {storename, accessToken,themeId} = req.body;
    console.log(storename, accessToken, themeId);
    
    try {
        const data = await projectModel.create({
            store_name: storename,
            accessToken: accessToken,
            themeId: themeId,
            user: req.user.userID
        });
        res.redirect('/user/projects');
    }catch(error) {
        res.status(400).json({
            message: "Error creating project"
        });
    }
});

router.get("/projects/:id", auth, async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await projectModel.findOne({
            _id: projectId,
            user: req.user.userID
        });

        const categories = await category.find();
        const sections = await section.find();

        if (!project) {
            return res.status(404).render('404', { message: "Project not found", user: req.user });
        }

        const user = await userModel.findById(req.user.userID);

        // if(Date.now() > new Date(user.endDate).getTime()) {
        //     return res.redirect('/subscription/select-plan');
        // } 

        //Refirect in Subscription


        res.render('singleProject', {
            user: req.user,
            project: project,
            categories: categories,
            sections: sections
        });
    } catch (error) {
        res.status(500).render('500', { message: "Server error", user: req.user });
    }
});

router.delete("/projects/:id", auth, async (req, res) => {
    const projectId = req.params.id;

    try {
        const deleted = await projectModel.findOneAndDelete({
            _id: projectId,
            user: req.user.userID
        });

        if (!deleted) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/projects/:id/:sectionId", auth, async (req, res) => {
    const projectId = req.params.id;
    const sectionId = req.params.sectionId;
    const data = await section.findById(sectionId);

    res.render('singleSection',{
        user: req.user,
        projectId: projectId,
        sectionId: sectionId,
        section: data
    }); 
    
    // try {
    //     const deleted = await projectModel.findOneAndDelete({
    //         _id: projectId,
    //         user: req.user.userID
    //     });

    //     if (!deleted) {
    //         return res.status(404).json({ message: "Project not found" });
    //     }

    //     res.status(200).json({ message: "Project deleted successfully" });
    // } catch (error) {
    //     res.status(500).json({ message: "Server error" });
    // }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token'); // Assuming you are using a cookie named 'token'
    res.redirect('/user/login'); // Redirect to login page after logout
});

router.post('/deactivate-plan',auth , async (req, res) => {
    
    try {
      const user = await userModel.findById(req.user.userID);
      //console.log(user);
      if (!user || user.plan_status !== 'active') {
        return res.status(400).send('No active plan found.');
      }

      // Cancel Razorpay subscription if exists
      if (user.subscriptionId && user.plan !== 'yearly') {
        await razorpay.subscriptions.cancel(user.subscriptionId);
      }
  
      // Set plan status to 'inactive' and update the expiration date to past
      user.plan_status = 'inactive';
      const updateUser = await user.save();

      // Redirect user back to account page

      // Create new token with updated user info
        const token = jwt.sign({
          userID: updateUser._id,
          username: updateUser.username,
          email: updateUser.email,
          plan: updateUser.plan,
          plan_status: updateUser.plan_status,
          startDate: updateUser.startDate,
          endDate: updateUser.endDate,
          email_verified: updateUser.email_verified,
          isAdmin: updateUser.isAdmin
        },
        process.env.JWT_SECRET
      );
  
      // Send new cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.redirect('/user/account');
    } catch (error) {
      console.error('Error deactivating plan:', error);
      res.status(500).send('Internal Server Error');
    }
});

//email varification routes
router.post('/send-verification-email', auth, async (req, res) => {
    try {

      const user = await userModel.findById(req.user.userID);
  
      const token = crypto.randomBytes(32).toString('hex');
      user.email_verification_token = token;
      await user.save();
  
      const verifyUrl = `https://sectionsync.com/user/verify-email?email_token=${token}`;
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Or use Mailtrap/SMTP
        auth: {
            user: process.env.EMAIL_ID,   // Your Gmail
            pass: process.env.EMAIL_APP_PASSWORD,     // App Password (Not your Gmail password)
        }
      });
  
      await transporter.sendMail({
        from: `"Section Sync Support" <${process.env.EMAIL_ID}>`,
        to: user.email,
        subject: 'Please Verify Your Email',
        text: 'Please verify your email: ' + verifyUrl, // plain text
        html: `
          <p>Hello ${user.username},</p>
          <p>Click below to verify your email:</p>
          <a href="${verifyUrl}" target="_blank">Verify Email</a>
        `
      });
  
      res.redirect('/user/account');
    } catch (error) {
      console.error('Email send error:', error);
      res.status(500).send('Failed to send verification email.');
    }
});

router.get('/verify-email', async (req, res) => {
    const { email_token } = req.query;
  
    try {
      const user = await userModel.findOne({ email_verification_token: email_token });
  
      if (!user) return res.status(400).send('Invalid token');
  
      user.email_verified = true;
      user.email_verification_token = '';
      await user.save();

      const token = jwt.sign({
        userID: user._id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        plan_status: user.plan_status,
        startDate: user.startDate,
        endDate: user.endDate,
        email_verified: user.email_verified,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET
    );

    // Send new cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });  
  
    res.redirect('/user/post-verify');

    } catch (error) {
      res.status(500).send('Verification failed', error);
    }
});

router.get('/post-verify', setUser, (req, res) => {
    if (!req.user) {
        return res.redirect('/user/login');
    }
    res.redirect('/user/account');
});


module.exports = router;
// GET /user/logout


