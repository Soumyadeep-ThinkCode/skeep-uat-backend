const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const sentReferralSchema = mongoose.Schema({
    userID : String,
	jobID : String,
    name : String,
	companyName : String,
    createdOn : { type : Date, default : Date.now }
});

const receivedCallBackSchema = mongoose.Schema({
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

const jobreferSchema = new mongoose.Schema({
	userID : String,
    sentReferral : [sentReferralSchema],
    receivedCallBack : [receivedCallBackSchema],
    offerReceivedInterview : [offerReceivedInterviewSchema],
    createdOn : { type : Date, default : Date.now }
});

const JobReferrerCollection = mongoose.model('JobReferrerCollection', jobreferSchema);
/************ SCHEMAS DEFINED HERE END ****************/

/********** GET SINGLE JOB REFERRER BY ID ***********/
router.get('/:userID', auth, async (req, res) => {
    const jobrefer = await JobReferrerCollection.findOne({ userID : req.params.userID });
	res.send({
		jobrefer : jobrefer,
		sentCount : jobrefer._doc.sentReferral.length,
		receivedCallBack : jobrefer._doc.receivedCallBack.length,
    	offerReceivedInterview : jobrefer._doc.offerReceivedInterview.length
	});
});

/********** CREATE A JOB REFERRER ACCOUNT ***********/
router.post('/', auth, async (req, res) => {
	let jobrefer = await JobReferrerCollection.findOne({ userID : req.body.userID });
	if(jobrefer){
	      res.status(400).send('User is already registered.');
	}else{
		try{
			jobrefer = new JobReferrerCollection({
				userID : req.body.userID,
				sentReferral : [],
                receivedCallBack : [],
                offerReceivedInterview : []
			});

			jobrefer = await jobrefer.save();
			res.send(jobrefer);
		}catch(error){
			//console.log("Error is :: " ,error);
		}
	}
});

/********** UPDATING DETAILS OF WHOM YOU SENT REFERRAL ***********/
router.put('/:currentID', auth, async (req, res) => {
	let jobrefer = await JobReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
						sentReferral : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(jobrefer);
});

/********** UPDATING THAT YOUR REFERRAL RECEIVED A CALLBACK ***********/
router.put('/callback/:currentID', auth, async (req, res) => {
	let jobrefer = await JobReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
						receivedCallBack : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(jobrefer);
});

/********** UPDATING THAT YOUR REFERRAL RECEIVED AN OFFER LETTER ***********/
router.put('/offerReceived/:currentID', auth, async (req, res) => {
	let jobrefer = await JobReferrerCollection.updateOne(
		{ userID : req.params.currentID },
		{ $addToSet : {
						offerReceivedInterview : [{
                            userID : req.body.userID,
							jobID : req.body.jobID,
                            name : req.body.name,
                            companyName : req.body.companyName
                        }]
				 }
		});
	res.send(jobrefer);
});



module.exports = router;
