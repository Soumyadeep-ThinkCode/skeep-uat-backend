const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const referrerSchema = new mongoose.Schema({
	userID : String,
    name : String,
    companyName : String,
	country : String,
    workEmail : String,
	isEmailVerified : Boolean,
	emailVerfiedDate : { type : Date, default : Date.now },
    designation : String,
    totalRefMade : Number,
    totalCallback : Number,
    conversionRatio : Number,
	rating : Number,
    createdOn : { type : Date, default : Date.now },
    isActive : Boolean
});

const ReferralCollection = mongoose.model('ReferralCollection', referrerSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL REFERRERS ***********/
router.get('/', async (req, res) => {
    const referrers = await ReferralCollection.find();
    res.send(referrers);
});

/********** GET SINGLE REFERRER BY ID ***********/
router.get('/:userID', async (req, res) => {
    //const referrer = await ReferralCollection.findById(req.params.userID);
    const referrer = await ReferralCollection.findOne({ userID : req.params.userID });
	res.send(referrer);
});

/********** CREATE A REFERRER ***********/
router.post('/', auth, async (req, res) => {
	let referrer = await ReferralCollection.findOne({ userID : req.body.userID });
	if(referrer){
	      res.status(400).send('User already registered as referrer');
	}else{
		try{
			referrer = new ReferralCollection({
				userID : req.body.userID,
				name : req.body.name,
				companyName : req.body.companyName,
				country : req.body.country,
				workEmail : req.body.workEmail,
				isEmailVerified : req.body.isEmailVerified,
				designation : req.body.designation,
				totalRefMade : req.body.totalRefMade,
				totalCallback : req.body.totalCallback,
				conversionRatio : req.body.conversionRatio,
				rating : 0,
				isActive : req.body.isActive
			});

			referrer = await referrer.save();
			res.send(referrer);
		}catch(error){
			//console.log("Error is :: " ,error);
		}
	}
});

/**************** UPDATE REFERRER DETAILS *****************/
router.put('/:userID' , auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.userID },
		{ $set : {
					companyName : req.body.companyName,
					workEmail : req.body.workEmail,
					designation : req.body.designation,
					country : req.body.country
				 }
		});
	res.send(referrer);
});

/**************** REMOVE REFERRER ACCOUNT *****************/
router.put('/deleteRef/:userID' , auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.userID },
		{ $set : {
					isActive : false
				 }
		});
	res.send(referrer);
});

/********** UPDATING SENT REFERRAL COUNT ***********/
router.put('/refMade/:currentID', auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					totalRefMade : req.body.totalRefMade
				 }
		});
	res.send(referrer);
});

/********** UPDATING RECEIVED CALLBACK COUNT ***********/
router.put('/callRef/:currentID', auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					totalCallback : req.body.totalCallback
				 }
		});
	res.send(referrer);
});

/********** UPDATING CONVERSION RATE COUNT ***********/
router.put('/conversion/:currentID', auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					conversionRatio : req.body.conversionRatio
				 }
		});
	res.send(referrer);
});

/********** UPDATING AVERAGE RATING ***********/
router.put('/rating/:currentID', auth, async (req, res) => {
	let referrer = await ReferralCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					rating : req.body.rating
				 }
		});
	res.send(referrer);
});

module.exports = router;