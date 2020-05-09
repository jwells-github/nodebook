const passport = require("passport");


exports.user_login_get = function (req,res,next){
    res.render('login_form', {title: 'Login'});
};

exports.user_login_post =
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    });
      