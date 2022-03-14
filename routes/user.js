const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '358538325148-spv6orm453thlrf9up5fkemquqbiso6k.apps.googleusercontent.com';
const CLIENT_SECRET = '9uagno4WxRGcH05J5Rk6u18e';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04_jxu5ZQWlJTCgYIARAAGAQSNwF-L9Ir0cQ9TabyzNEQa7XKuTMVPqUOE2TrL-yo2h_NNdNgp6CUQYrZ9eFUZp6pm0ockTPPPE8';

/************ SCHEMAS DEFINED HERE START ****************/
const userSchema = new mongoose.Schema({
    name : String,
	email : String,
	option : String,
	password : String,
	imagePath : String,
	completed : Boolean,
	isActive : Boolean,
	answer1 : String,
	answer2 : String,
	ownPromoCode : String,
	otherPromoCode : String
});

const UserCollection = mongoose.model('UserCollection', userSchema);
/************ SCHEMAS DEFINED HERE END ****************/

const router = express.Router();


/**************************** PROFILE PICTURE UPLOAD **********************************/
router.post('/image/:userID', upload.single("image"), async (req, res) => {
	const result = await cloudinary.uploader.upload(req.file.path);
	let person = await UserCollection.findOne({ _id : req.params.userID });
	if(!person){
		res.status(400).send('User does not exist');
	}else{
		//console.log("User ID here :: ", req.params.userID);
		person = await UserCollection.updateOne(
			{ _id : req.params.userID },
			{ $set : {
						imagePath : result.secure_url
					 }
			}
		).exec();
		res.send(person);
	}
});

/***************** SIGN UP NEW USERS ********************/
router.post('/', async (req, res) => {
  	let user = await UserCollection.findOne({ email : req.body.email });
	if(user){
	      res.status(400).send('User already registered');
	}
	user = new UserCollection({
		name : req.body.name,
		email : req.body.email,
		option : req.body.option,
		password : req.body.password,
		imagePath : null,
		completed : false,
		isActive : true,
		answer1 : req.body.answer1,
		answer2 : req.body.answer2,
		ownPromoCode : req.body.ownPromoCode,
		otherPromoCode : req.body.otherPromoCode
	}); 
	
	const salt = await bcrypt.genSaltSync(10);
	user.password = await bcrypt.hashSync(user.password , salt);

	await user.save();
	
	const token = jwt.sign({ _id : user._id }, config.get('jwtPrivateKey'), { expiresIn : '240m' });
	
	res.header('x-auth-token', token).send({
		_id : user._id,
		name : user.name,
		email : user.email,
		option : user.option,
		completed : user.completed,
		isActive : user.isActive
	});
});

/***************** LOGIN EXISTING USERS ********************/
router.post('/login', async (req, res) => {
  	let user = await UserCollection.findOne({ email : req.body.email });
	if(!user){
	      res.status(400).send('INVALID_ACCOUNT');
		  return;
	}
	
	const validPassword = await bcrypt.compareSync(req.body.password , user.password);
	if(!validPassword){
		res.status(400).send('WRONG_PASSWORD');
		return;
	}
	
	const token = jwt.sign({ _id : user._id }, config.get('jwtPrivateKey'), { expiresIn : '240m' });
	res.header('x-auth-token', token).send({ _id : user.id , name : user.name , completed : user.completed, isActive : user.isActive });
});

/********************* GET USER INFORMATION ***********************/
router.get('/me', auth, async (req, res) => {
	const user = await UserCollection.findById(req.user._id).select('-password');
	res.send(user);
});

/********************** GET BASIC USER INFORMATION *************************/
router.get('/:userID', async (req, res) => {
	const person = await UserCollection.findOne({ _id : req.params.userID });
	res.send({ _id : person._id, name : person.name , email : person.email , imagePath : person.imagePath , option : person.option});
});

/********************** CHECK IF EMAIL EXISTS *************************/
router.post('/forgotEmail', async (req, res) => {
	const person = await UserCollection.findOne({ email : req.body.email });

	if(!person){
		res.status(400).send("NOT_EXISTS");
		return;
	}else if(!person.isActive){
		res.status(400).send("DEACTIVATED");
		return;
	}else{

	}

	res.send({ _id : person._id, name : person.name , email : person.email , isActive : person.isActive});
});

/********************** CHECK IF PROMO CODE EXISTS *************************/
router.post('/checkPromo', async (req, res) => {
	const person = await UserCollection.findOne({ ownPromoCode : req.body.otherPromoCode });

	if(!person){
		res.status(400).send("INVALID_CODE");
		return;
	}

	res.send({ _id : person._id, name : person.name , email : person.email , isActive : person.isActive});
});

/********************** CHECK SECRET ANSWER CORRECT OR NOT *************************/
router.post('/checkAnswer/:userID', async (req, res) => {
	let profile = await UserCollection.find({ _id : req.params.userID});

	if(!profile){
		res.status(400).send("NOT_EXISTS");
	}

	let firstAnswer = await UserCollection.find({ answer1 : { $in : [ req.body.answer1 ] }, _id : { $in : [ req.params.userID ] } });	
	let secondAnswer = await UserCollection.find({ answer2 : { $in : [ req.body.answer2 ] }, _id : { $in : [ req.params.userID ] } });
	
	if(firstAnswer && firstAnswer.length > 0 && secondAnswer && secondAnswer.length > 0){
		res.status(200).send("SECRET_VALIDATED");
	}else{
		res.status(400).send("NOT_VALIDATED");
	}
});

/********************** SUBMIT NEW PASSWORD *************************/
router.put('/confirmPassword/:userID', async (req, res) => {
	let person = await UserCollection.find({ _id : req.params.userID});
	let password = req.body.password;

	if(!person){
		res.status(400).send("NOT_EXISTS");
	}

	const salt = await bcrypt.genSaltSync(10);
	const newPassword = await bcrypt.hashSync(password , salt);

	person = await UserCollection.updateOne(
		{ _id : req.params.userID },
		{ $set : {
					password : newPassword
				 }
		}
	);

	res.status(200).send("PASSWORD_RESET");
});

/********************** UPDATE THE STATUS OF USER TO COMPLETED REGISTRATION *************************/
router.put('/status/:userID', auth, async (req, res) => {
	let person = await UserCollection.findOne({ _id : req.params.userID });

	if(!person){
		res.status(400).send('User does not exist');
	}else{
		person = await UserCollection.updateOne(
			{ _id : req.body.userID },
			{ $set : {
						completed : true
					 }
			}
		);
		res.send(person);
	}
});

/********************** DELETE ACCOUNT OF USER *************************/
router.put('/deleteAccount/:userID', auth, async (req, res) => {
	let person = await UserCollection.findOne({ _id : req.params.userID });
	if(!person){
		res.status(400).send('User does not exist');
	}else{
		person = await UserCollection.updateOne(
			{ _id : req.params.userID },
			{ $set : {
						isActive : false
					 }
			}
		);
		res.send(person);
		//console.log("Person :: ", person);
	}
});


/************************ VERIFY WORK EMAIL ID ******************************************/
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oAuth2Client.setCredentials({
	refresh_token : REFRESH_TOKEN
});

const sendMail = async () => {
	try{
		const accessToken = oAuth2Client.getAccessToken();
		
		const transport = nodemailer.createTransport({
			service : 'gmail',
			auth : {
				type : 'OAuth2',
				user : 'skeepdevmail@gmail.com',
				clientId : CLIENT_ID,
				clientSecret : CLIENT_SECRET,
				refreshToken : REFRESH_TOKEN,
				accessToken : accessToken
			}
		});
	}catch(error){
		return error;
	}
}

module.exports = router;