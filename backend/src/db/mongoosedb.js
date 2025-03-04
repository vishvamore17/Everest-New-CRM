const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://morevishva1793:vishva2003@cluster0.6atfg.mongodb.net/crm");
        console.log("Connected to DB");
    } catch (error) {
        console.log("Not connected to DB", error);
    }
}

module.exports = connectDB;
