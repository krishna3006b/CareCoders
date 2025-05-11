const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connection Successfull!");
    } catch (error) {
        console.log("Database connection Issue: ", error.message);
    }
}

module.exports = dbConnect;