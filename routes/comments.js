var express = require("express");
var router  = express.Router({mergeParams: true});
var Hotel = require("../models/hotel");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//========================================
//comments routes 
//COMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    //find hotel by id
    Hotel.findById(req.params.id, function(err, hotel){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{hotel: hotel});
        }
    });
    
});

//COMMENTS CFREATE
router.post("/",middleware.isLoggedIn,function(req,res){
    //look for hotel using id
    Hotel.findById(req.params.id, function(err, hotel){
        if(err){
            console.log(err);
            res.redirect("/hotels");
        }
        else{
            
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "SOMETHING WENT WRONG !!!");
                    console.log(err);
                }
                else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    hotel.comments.push(comment);
                    hotel.save();
                    req.flash("success", "Successfully Created Comment!!!");
                    res.redirect("/hotels/" + hotel._id);
                }
            });
        }
    });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("comments/edit", {hotel_id: req.params.id, comment: foundComment});
        }
    });
    
});

//UPDATE COMMENT ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership, function(req,res){
    //find and update the correct hotel
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/hotels/" + req.params.id);
        }
    });
    //redirect to show page
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment Deleted!!!");
            res.redirect("/hotels/" + req.params.id);
        }
    });
});





module.exports = router;