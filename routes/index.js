var express = require('express');
var router = express.Router();

var signup_controller = require('../controllers/signupController');
var login_controller =  require('../controllers/loginController');
var dashboard_controller = require('../controllers/dashboardController')

/* GET home page. */
router.get('/', dashboard_controller.dashboard_get );

router.post('/', dashboard_controller.dashboard_post);

router.post('/comment', dashboard_controller.comment_post);

router.post('/like', dashboard_controller.like);

router.get('/signup', signup_controller.user_create_get);

router.post('/signup', signup_controller.user_create_post);

router.get('/signup/confirmation/resend', signup_controller.email_confirmation_resend_get);

router.post('/signup/confirmation/resend', signup_controller.email_confirmation_resend_post);

router.get('/signup/confirmation/:token', signup_controller.email_confirmation);

router.get('/login',login_controller.user_login_get );

router.post('/login', login_controller.user_login_post);


module.exports = router;
