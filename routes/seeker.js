const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const seekerSchema = new mongoose.Schema({
	userID : String,
    name : String,
    experience : Number,
    interestedSector : String,
	department : String,
    skillSet : [ String ],
    totalCallsReceived : Number,
    totalOffersReceived : Number,
    conversionRate : Number,
    isActive : Boolean
});

const SeekerCollection = mongoose.model('SeekerCollection', seekerSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL SEEKERS ***********/
router.get('/', async (req, res) => {
    const seekers = await SeekerCollection.find();
    res.send(seekers);
});

/********** GET SINGLE SEEKER BY ID ***********/
router.get('/:userID', async (req, res) => {
    //const seeker = await SeekerCollection.findById(req.params.userID);
    const seeker = await SeekerCollection.findOne({ userID : req.params.userID });
	res.send(seeker);
});

/********** CREATE A SEEKER ***********/
router.post('/', auth, async (req, res) => {
	let seeker = await SeekerCollection.findOne({ userID : req.body.userID });
	if(seeker){
	      res.status(400).send('User already registered as seeker');
	}
	else{
			try{
				seeker = new SeekerCollection({
					userID : req.body.userID,
					name : req.body.name,
					experience : req.body.experience,
					interestedSector : req.body.interestedSector,
					department : req.body.department,
					skillSet : req.body.skillSet,
					totalCallsReceived : req.body.totalCallsReceived,
					totalOffersReceived : req.body.totalOffersReceived,
					conversionRate : req.body.conversionRate,
					isActive : req.body.isActive
				});

				seeker = await seeker.save();
				res.send(seeker);
			}catch(error){
				//console.log("Error is :: ", error);
			}
	}
	
});

/**************** UPDATE SEEKER DETAILS *****************/
router.put('/:userID' , auth, async (req, res) => {
	let seeker = await SeekerCollection.updateOne(
		{ userID : req.params.userID },
		{ $set : {
					experience : req.body.experience,
					interestedSector : req.body.interestedSector,
					department : req.body.department,
					skillSet : req.body.skillSet
				 }
		});
	res.send(seeker);
});

/**************** REMOVE SEEKER ACCOUNT *****************/
router.put('/deleteSeeker/:userID' , auth, async (req, res) => {
	let seeker = await SeekerCollection.updateOne(
		{ userID : req.params.userID },
		{ $set : {
					isActive : false
				 }
		});
	res.send(seeker);
});

/********** UPDATING SEEKER CALLBACK COUNT ***********/
router.put('/seekCallback/:currentID', auth, async (req, res) => {
	let seeker = await SeekerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					totalCallsReceived : req.body.totalCallsReceived
				 }
		});
	res.send(seeker);
});

/********** UPDATING SEEKER OFFER RECEIVED COUNT ***********/
router.put('/seekOffer/:currentID', auth, async (req, res) => {
	let seeker = await SeekerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					totalOffersReceived : req.body.totalOffersReceived
				 }
		});
	res.send(seeker);
});

/********** UPDATING CONVERSION RATE COUNT ***********/
router.put('/seekConversion/:currentID', auth, async (req, res) => {
	let seeker = await SeekerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $set : {
					conversionRate : req.body.conversionRate
				 }
		});
	res.send(seeker);
});


module.exports = router;