// this handel the database connection
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Success! connected to the mongoDB database');
    } catch (err) {
        console.log('Error Conneting to Mongodb',err);
        process.exit(1);
    }
};

module.exports = connectDB;
