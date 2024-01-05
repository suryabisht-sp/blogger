const mongoose = require("mongoose")

const connectDb = async (url) => {
   try {
      await mongoose.connect(url);
      console.log("Connected to MongoDB Atlas");
   } catch (err) {
      console.error("Error connecting to MongoDB Atlas:", err);
   }
}

module.exports = connectDb;