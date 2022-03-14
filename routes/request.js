const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const profileRequestSchema = new mongoose.Schema({
    userID : String,					//USER'S OWN USER ID
    sentRequestID : [ String ],			//REQUESTS YOU HAVE SENT TO OTHERS
	totalReceivedRequests : [ String ],	//TOTAL REQUESTS RECEIVED BY YOU FROM OTHERS
	approvedRequestID : [ String ],		//REQUESTS RECEIVED FROM OTHERS THAT YOU HAVE ACCEPTED
	blockedID : [ String ]				//USERS WHOM YOU HAVE BLOCKED
});

const ProfileRequestCollection = mongoose.model('ProfileRequestCollection', profileRequestSchema);
/************ SCHEMAS DEFINED HERE END ****************/

/********** GET PROFILE INFO BY PERSON ID ***********/
router.get('/:userID', auth, async (req, res) => {
    const profile = await ProfileRequestCollection.find({ userID : req.params.userID});
    res.send(profile);
});

/********** GET ONLY THE APPROVED CONNECTION DETAILS BY PERSON ID ***********/
router.get('/connections/:userID', auth, async (req, res) => {
    const profile = await ProfileRequestCollection.find({ userID : req.params.userID});
    res.send({
		approvedRequestID : profile[0]._doc.approvedRequestID
	});
});

/********** GET INFO ON CONNECTION/BLOCKING LIST ***********/
router.post('/check/:userID', auth, async (req, res) => {
	let sentRequests = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.body.sentRequestID ] } , userID : { $in : [ req.params.userID ] } });
	let totalReceivedRequests = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.body.totalReceivedRequests ] } , userID : { $in : [ req.params.userID ] } });
	let approvedRequestID = await ProfileRequestCollection.find({ approvedRequestID : { $in : [ req.body.approvedRequestID ] } , userID : { $in : [ req.params.userID ] } });
	let blockedID = await ProfileRequestCollection.find({ blockedID : { $in : [ req.body.blockedID ] } , userID : { $in : [ req.params.userID ] } });
	
	if(sentRequests.length > 0){
		res.send("SENT_REQUEST_PRESENT");
	}else if(totalReceivedRequests.length > 0){
		res.send("RECEIVED_REQUEST_PRESENT");
	}else if(approvedRequestID.length > 0){
		res.send("APPROVED_CONNECTION");
	}else if(blockedID.length > 0){
		res.send("BLOCKED_CONNECTION");
	}else{
		res.send("NO_REQUEST_PRESENT");
	}
});

/********** CREATE A REFERRER REVIEWS ACCOUNT ***********/
router.post('/', auth, async (req, res) => {
    let profileInfo = new ProfileRequestCollection({
		userID : req.body.userID,
		sentRequestID : req.body.sentRequestID,
		totalReceivedRequests : req.body.totalReceivedRequests,
		approvedRequestID : req.body.approvedRequestID,
		blockedID : req.body.blockedID
    });

    profileInfo = await profileInfo.save();
    res.send(profileInfo);
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ REQUEST SENDING SEGMENT START $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

/******************* (UPDATE CALL) SENDING REQUESTS TO OTHERS [FOR THE PERSON WHO IS SENDING THE REQUEST] **********************/
router.put('/sra/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}
	
	let sentRequests = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.body.sentRequestID ] }, userID : { $in : [ req.params.currentID ] } });
	
	if(sentRequests.length < 1){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $addToSet : {
						sentRequestID : req.body.sentRequestID
				     }
			});
		res.send(profile);
	}else{
		res.send('This request has been already sent');
	}
});

/******************* (UPDATE CALL) RECEIVING REQUESTS FROM OTHERS [FOR THE PERSON RECEIVING THE REQUEST] *******************/
router.put('/receive/:currentID/:userID', async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}
	
	let totalReceivedRequests = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.body.totalReceivedRequests ] }, userID : { $in : [ req.params.currentID ] } });
	//console.log("Existing Requests UPDATE :: ", totalReceivedRequests);

	if(totalReceivedRequests.length < 1){
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.userID },
				{ $addToSet : {
							totalReceivedRequests : req.body.totalReceivedRequests
						 }
				});
			res.send(profile);
	}else{
		res.send('This request has been already sent');
	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ REQUEST SENDING SEGMENT END $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$





//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ APPROVING CONNECTION REQUEST SEGMENT START $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

/******************* (REMOVE AND UPDATE CALL) APPROVING CONNECTION REQUESTS FROM OTHERS [FOR THE PERSON WHO RECEIVED THE REQUEST] ********************************/
router.put('/approve/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}
	
	let totalReceivedRequests = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.body.totalReceivedRequests ] }, userID : { $in : [ req.params.currentID ] } });
	
	if(totalReceivedRequests.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $addToSet : {
								approvedRequestID : req.body.approvedRequestID
				     	  }
		});

		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
							totalReceivedRequests : req.body.totalReceivedRequests
				      }
		});
		res.send(profile);
	}else{
		res.send('This request has been already been approved');
	}
});

/******************* (REMOVE AND UPDATE CALL) OTHERS APPROVING YOUR SENT CONNECTION REQUEST [FOR THE PERSON WHO SENT THE REQUEST] ********************************/
router.put('/oacc/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.currentID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}
	
	let sentRequests = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.body.sentRequestID ] }, userID : { $in : [ req.params.currentID ] } });
	
	if(sentRequests.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
						sentRequestID : req.body.sentRequestID
					  }
			});

		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $addToSet : {
							approvedRequestID : req.body.approvedRequestID
						}
		});

		res.send(profile);
	}else{
		res.send('This request has been already been approved');
	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ REJECT RECEIVED CONNECTION REQUEST START $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.put('/rejectRequest/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let sentRequestFromOther = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });
	let receivedRequestUser = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.params.userID ] }, userID : { $in : [ req.params.currentID ] } });

	if((sentRequestFromOther && receivedRequestUser) && (sentRequestFromOther.length > 0 && receivedRequestUser.length > 0)){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
						   sentRequestID : req.params.currentID
					  }
			});

		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
							totalReceivedRequests : req.params.userID
						}
		});
		res.send(profile);
	}else{

	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CANCEL SENT CONNECTION REQUEST START $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.put('/cancelSentRequest/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let cancelFromSender = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.params.userID ] }, userID : { $in : [ req.params.currentID ] } });
	let cancelFromReceiver = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });

	if((cancelFromSender && cancelFromReceiver) && (cancelFromSender.length > 0 && cancelFromReceiver.length > 0)){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
						   sentRequestID : req.params.userID
					  }
			});

		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
							totalReceivedRequests : req.params.currentID
						}
		});
		res.send(profile);
	}else{

	}
});


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BLOCK USER TO THE BLOCKER'S DATA ENTRY $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.put('/block/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let blockedRequest = await ProfileRequestCollection.find({ blockedID : { $in : [ req.body.blockedID ] }, userID : { $in : [ req.params.currentID ] } });
	let sentRequest = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.body.blockedID ] }, userID : { $in : [ req.params.currentID ] } });
	let approvedRequest = await ProfileRequestCollection.find({ approvedRequestID : { $in : [ req.body.blockedID ] }, userID : { $in : [ req.params.currentID ] } });
	let totalReceivedRequests = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.body.blockedID ] }, userID : { $in : [ req.params.currentID ] } });

	if(blockedRequest.length < 1){
		if(sentRequest.length > 0){
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $pull : {
							sentRequestID : req.body.blockedID
						  }
				});
	
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $addToSet : {
								blockedID : req.body.blockedID
							}
			});
			res.send(profile);
		}else if(approvedRequest.length > 0){
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $pull : {
								approvedRequestID : req.body.blockedID
						  }
				});
	
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $addToSet : {
								blockedID : req.body.blockedID
							}
			});
			res.send(profile);
		}else if(totalReceivedRequests.length > 0){
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $pull : {
								totalReceivedRequests : req.body.blockedID
						  }
				});
	
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $addToSet : {
									blockedID : req.body.blockedID
							}
			});
			res.send(profile);
		}else{
			profile = await ProfileRequestCollection.updateOne(
				{ userID : req.params.currentID },
				{ $addToSet : {
									blockedID : req.body.blockedID
							}
			});
			res.send(profile);
		}
	}
});

router.put('/blockSelf/:currentID/:userID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let sentRequestReceiver = await ProfileRequestCollection.find({ sentRequestID : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });
	let approvedRequestReceiver = await ProfileRequestCollection.find({ approvedRequestID : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });
	let totalReceivedRequestsReceiver = await ProfileRequestCollection.find({ totalReceivedRequests : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });

	if(sentRequestReceiver && sentRequestReceiver.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
							sentRequestID : req.params.currentID
					  }
			});
		res.send(profile);
	}else if(approvedRequestReceiver && approvedRequestReceiver.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
							approvedRequestID : req.params.currentID
					  }
			});
		res.send(profile);
	}else if(totalReceivedRequestsReceiver && totalReceivedRequestsReceiver.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
							totalReceivedRequests : req.params.currentID
					  }
			});
		res.send(profile);
	}else{
		res.status(200).send("NOT_APPLICABLE");
	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CHECK IF THAT USER IS BLOCKED OR NOT $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.get('/checkBlock/:userID/:currentID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let blockedToMe = await ProfileRequestCollection.find({ blockedID : { $in : [ req.params.userID ] }, userID : { $in : [ req.params.currentID ] } });
	let myselfBlocked = await ProfileRequestCollection.find({ blockedID : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });

	if((blockedToMe || myselfBlocked) && (blockedToMe.length > 0 || myselfBlocked.length > 0)){
		res.status(400).send('ERR_BLOCKED');
	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UNFRIEND EXISTING CONNECTION $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.put('/unfriend/:userID/:currentID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let existingConnection1 = await ProfileRequestCollection.find({ approvedRequestID : { $in : [ req.params.currentID ] }, userID : { $in : [ req.params.userID ] } });	
	let existingConnection2 = await ProfileRequestCollection.find({ approvedRequestID : { $in : [ req.params.userID ] }, userID : { $in : [ req.params.currentID ] } });
	
	if((existingConnection1 && existingConnection2) && (existingConnection1.length > 0 && existingConnection2.length > 0)){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.userID },
			{ $pull : {
						   approvedRequestID : req.params.currentID
					  }
			});

		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
							approvedRequestID : req.params.userID
						}
		});
		res.send(profile);
	}else{

	}
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UNBLOCK BLOCKED CONNECTION $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.put('/unblockUser/:userID/:currentID', auth, async (req, res) => {
	let profile = await ProfileRequestCollection.find({ userID : req.params.userID});
	if(!profile){
			res.status(400).send('This profile was not found');
	}

	let blockedUserDetails = await ProfileRequestCollection.find({ blockedID : { $in : [ req.params.userID ] }, userID : { $in : [ req.params.currentID ] } });	
	
	if(blockedUserDetails && blockedUserDetails.length > 0){
		profile = await ProfileRequestCollection.updateOne(
			{ userID : req.params.currentID },
			{ $pull : {
							blockedID : req.params.userID
						}
		});
		res.send(profile);
	}else{

	}
});

module.exports = router;