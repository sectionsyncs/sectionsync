const express = require("express");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const indexRouter = require("./routes/index.routes");
const connectToDB = require("./config/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const categoryRoutes = require('./api/categories');
const sectionRoutes = require('./api/sections');
const cancelUnusedSubscriptions = require('./api/cancel-unused-subscriptions');
const subscriptionRoutes = require('./routes/subscription.routes');
const sectioOpration = require('./api/section-opration');
const contactRoutes = require('./routes/contact');
const webhookRoutes = require('./routes/webhook');
const cron = require('node-cron');
const axios = require('axios');


connectToDB();
dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/", indexRouter);
app.use("/subscription", subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sections', sectionRoutes);    
app.use('/api/section-opration/', sectioOpration); 
app.use('/api/cancel-unused-subscriptions', cancelUnusedSubscriptions);
app.use('/contact', contactRoutes);
app.use('/webhook', webhookRoutes);

cron.schedule('*/10 * * * *', async () => {
  try {
    const res = await axios.post('https://www.sectionsync.com/api/cancel-unused-subscriptions');
    // const res = await axios.post('http://localhost:3000/api/cancel-unused-subscriptions');
    console.log('Cancelled stale subscriptions:', res.data);
  } catch (err) {
    console.error('Cron job failed:', err.message);
  }
});

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});