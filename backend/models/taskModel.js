const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    className: { type: String, required: true },
    group: {
        type: Schema.Types.ObjectId,
        ref:"section"
    },
    start: Date,
    end: Date,
},{
    versionKey:false
});

module.exports = Task = mongoose.model("task", taskSchema);