const mongoose = require('mongoose');
require('dotenv').config(); // Add this line at the top

//const mongoURI = "mongodb+srv://sivaklu860:sivaklu860@cluster0.nazwa.mongodb.net/stickyBits?retryWrites=true&w=majority&appName=Cluster0";


const connectToMongoDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};
// Export the function to be used in your main file
module.exports = connectToMongoDB;
