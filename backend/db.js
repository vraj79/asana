const mongoose = require("mongoose");

const connectDB = () => {
    mongoose
        .connect("mongodb://localhost:27017/asana")
        .then(() => console.log("💻 Mondodb Connected"))
        .catch(err => console.error(err));
}

module.exports=connectDB