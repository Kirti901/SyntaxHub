var express = require('express');
var router = express.Router();
var { signUp } = require('../controllers/userController');
var { login } = require('../controllers/userController');
var { createProj } = require('../controllers/userController');
var { saveProject } = require('../controllers/userController');
var { getProjects } = require('../controllers/userController');
var { getProject } = require('../controllers/userController');
var { editProject } = require('../controllers/userController');
var { deleteProject } = require('../controllers/userController');
var { forgotPassword } = require('../controllers/userController');
var { requestPasswordReset, resetPassword } = require('../controllers/userController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup',signUp);
router.post('/login',login);
router.post('/createProj',createProj);
router.post('/saveProject',saveProject);
router.post('/getProjects',getProjects);
router.post('/getProject',getProject);
router.post('/deleteProject',deleteProject);
router.post('/editProject',editProject);
router.post('/forgotPassword', forgotPassword);

router.post('/requestPasswordReset', requestPasswordReset);
router.post('/resetPassword', resetPassword);





module.exports = router;
