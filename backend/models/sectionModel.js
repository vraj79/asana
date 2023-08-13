const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    groupNum:{type:Number,required:true}
}, {
    versionKey: false
});

module.exports = Section = mongoose.model("section", sectionSchema);