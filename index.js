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
const subscriptionRoutes = require('./routes/subscription.routes');
const sectioOpration = require('./api/section-opration');
const contactRoutes = require('./routes/contact');

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
app.use('/contact', contactRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});