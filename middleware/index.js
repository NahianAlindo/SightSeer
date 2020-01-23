//all the middlewares
var Hotel = require("../models/hotel");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkHotelOwnership = function (req,res,next){
    if(req.isAuthenticated()){
        Hotel.findById(req.params.id,function(err,foundHotel){
            if(err){
                req.flash("error", "Accommodation Not Found!!!");
                res.redirect("back");
            }
            else{
                //does user own the hotel?
                if(foundHotel.author.id==req.user._id || req.user.isAdmin){
                    next();
                }
                else{
                    req.flash("error", "You Don't Have Permission To Do That!!!");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error", "You Need To Be Logged In To Do That!!!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                res.redirect("back");
            }
            else{
                //does user own the comment?
                if(foundComment.author.id==req.user._id || req.user.isAdmin){
                    next();
                }
                else{
                    req.flash("error", "You Don't Have Permission To Do That!!!");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error", "You Need To Be Logged In To Do That!!!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    //middleware
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You Need To be Logged In to Do That!!!");
    res.redirect("/login");
}

module.exports =  middlewareObj;