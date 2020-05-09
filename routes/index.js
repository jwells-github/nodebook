var express = require('express');
var router = express.Router();

var signup_controller = require('../controllers/signupController');
var login_controller =  require('../controllers/loginController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', signup_controller.user_create_get);

router.post('/signup', signup_controller.user_create_post);

router.get('/signup/confirmation/:token', signup_controller.email_confirmation);

router.post('/signup/resend', signup_controller.email_confirmation_resend);

router.get('/login',login_controller.user_login_get );

router.post('/login', login_controller.user_login_post);


module.exports = router;
