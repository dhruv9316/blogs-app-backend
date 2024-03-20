const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type:String,
        trim:true,
        required: true
    },
    description: {
        type:String,
        trim:true,
        default: null
    },
    image: {
        type:String,
    },
}, { timestamps: true });

module.exports = mongoose.model("Posts", postSchema);