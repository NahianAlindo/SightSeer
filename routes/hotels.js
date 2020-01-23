var express = require("express");
var router  = express.Router();
var Hotel   = require("../models/hotel");
var middleware = require("../middleware");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'upload-nahian-alindo', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX- show all hotel accommodations
router.get("/", function (req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //Get all accommodations from db
        Hotel.find({name: regex}, function (err, allHotels) {
            if (err) {
                console.log(err);
            }
            else {
                
                if(allHotels.length < 1){
                    noMatch = "No accommodations found, please try again";
                }
                res.render("hotels/index", {/*name of the data to be passed*/hotels: allHotels/*data being passed*/, noMatch:noMatch, page: 'hotels' });
            }
        });
    }
    else{
    //Get all accommodations from db
    Hotel.find({}, function(err, allHotels){
        if(err){
            console.log(err);
        }
        else{
            res.render("hotels/index", {/*name of the data to be passed*/hotels: allHotels/*data being passed*/, noMatch:noMatch, page: 'hotels'});
        }
    });
}
    // res.render("hotels", {/*name of the data to be passed*/hotels: hotels/*data being passed*/ });
});

//NEW - show form to create new accommodation
router.get("/new",middleware.isLoggedIn, function (req, res) {
    res.render("hotels/new");
});

//CREATE- add new hotel accommodations to DB
router.post("/",middleware.isLoggedIn, upload.single('image'), function (req, res) {
    //get data from form and add to hotels
    
    cloudinary.uploader.upload(req.file.path, function (result) {
        
    var price = req.body.price;
    var contact_number = req.body.contact_number;
    var desc = req.body.description;
    
    //req.body.hotel.name= req.body.name;
    req.body.hotel.price= price;
    req.body.hotel.contact_number= contact_number;
    req.body.hotel.desc= desc;
        // add cloudinary url for the image to the hotel object under image property
        req.body.hotel.image = result.secure_url;
        req.body.hotel.imageId = result.public_id;
        // add author to hotel
        req.body.hotel.author = {
            id: req.user._id,
            username: req.user.username
        }
        Hotel.create(req.body.hotel, function (err, hotel) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/hotels/' + hotel.id);
        });
    });
});

//SHOW- show all info of hotel accommodation
router.get("/:id", function(req,res){
    //find the hotel with provided ID 
    Hotel.findById(req.params.id).populate("comments").exec(function(err, foundHotel){
        if(err){
            console.log(err);
        }
        else{
            //render show template with that hotel accommodation
            res.render("hotels/show", {hotel: foundHotel});
        }
    });
   // req.params.id
    
});

//EDIT HOTEL ROUTE
router.get("/:id/edit",middleware.checkHotelOwnership, function(req,res){
    //is user logged in
    Hotel.findById(req.params.id,function(err,foundHotel){
                res.render("hotels/edit", {hotel: foundHotel});
    });
});
//UPDATE HOTEL ROUTE
router.put("/:id",middleware.checkHotelOwnership, upload.single('image'), function(req,res){
 
    Hotel.findByIdAndUpdate(req.params.id, req.body.hotel, function(err, updatedHotel){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            req.flash("success", "Successfully Updated!");
            res.redirect("/hotels/" + req.params.id);
        }
    });
    //redirect to show page
});

//DESTROY HOTEL ROUTE
router.delete("/:id",middleware.checkHotelOwnership, function(req,res){
    Hotel.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/hotels");
        }
        else{
            res.redirect("/hotels");
        }

    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

