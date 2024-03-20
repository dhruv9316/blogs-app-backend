const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: {
        type:String,
        trim:true,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts'
    }
}, { timestamps: true });

module.exports = mongoose.model("Tags", tagSchema);