var mongoose = require("mongoose");

//SCHEMA SETUP
var hotelSchema = new mongoose.Schema({
    name: String,
    price: String,
    contact_number: String,
    image: String,
    imageId: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});



module.exports = mongoose.model("Hotel", hotelSchema);//compiling schema into a model