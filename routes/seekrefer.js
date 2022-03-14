const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const receivedReferralSchema = mongoose.Schema({
    userID : String,
	jobID : String,
    name : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const callbackInterviewSchema = mongoose.Schema({
    userID : String,
	jobID : String,
    name : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const clearedInterviewSchema = mongoose.Schema({
    userID : String,
    name : String,
	jobID : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const unsuccessfulInterviewSchema = mongoose.Schema({
    userID : String,
    name : String,
	jobID : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const offerReceivedInterviewSchema = mongoose.Schema({
    userID : String,
    name : String,
	jobID : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const seekReferSchema = new mongoose.Schema({
	userID : String,
    receivedReferral : [receivedReferralSchema],
	callbackInterview : [callbackInterviewSchema],
    clearedInterview : [clearedInterviewSchema],
    unsuccessfulInterview : [unsuccessfulInterviewSchema],
    offerReceivedInterview : [offerReceivedInterviewSchema],
    createdOn : { type : Date, default : Date.now }
});

const SeekReferrerCollection = mongoose.model('SeekReferrerCollection', seekReferSchema);

router.get('/:userID', auth, async (req, res) => {
    const seekRefer = await SeekReferrerCollection.findOne({ userID : req.params.userID });
	res.send({
		seekRefer : seekRefer,
		referralCount : seekRefer._doc.receivedReferral.length,
		callbackInterview : seekRefer._doc.callbackInterview.length,
		clearedInterview : seekRefer._doc.clearedInterview.length,
    	unsuccessfulInterview : seekRefer._doc.unsuccessfulInterview.length,
    	offerReceivedInterview : seekRefer._doc.offerReceivedInterview.length
	});
});

router.post('/', auth, async (req, res) => {
	let seekRefer = await SeekReferrerCollection.findOne({ userID : req.body.userID });
	if(seekRefer){
	      res.status(400).send('User is already registered.');
	}else{
		try{
			seekRefer = new SeekReferrerCollection({
				userID : req.body.userID,
				receivedReferral : [],
				callbackInterview : [],
                clearedInterview : [],
                unsuccessfulInterview : [],
                offerReceivedInterview : []
			});

			seekRefer = await seekRefer.save();
			res.send(seekRefer);
		}catch(error){
			//console.log("Error is :: " ,error);
		}
	}
});

router.put('/:currentID', auth, async (req, res) => {
	let seekRefer = await SeekReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
                        receivedReferral : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(seekRefer);
});

router.put('/recall/:currentID', auth, async (req, res) => {
	let seekRefer = await SeekReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
                        callbackInterview : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(seekRefer);
});

router.put('/successInterview/:currentID', auth, async (req, res) => {
	let seekRefer = await SeekReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
						clearedInterview : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(seekRefer);
});

module.exports = router;