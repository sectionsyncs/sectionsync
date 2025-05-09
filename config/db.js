const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => { console.log("Connected to data base")}).catch(error => console.log('error', error));
}


module.exports = connectToDB; 