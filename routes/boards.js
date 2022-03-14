const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const appliedSchema = mongoose.Schema({
    userID : String,
    name : String,
    imageLink : String,
    appliedOn : { type : Date, default : Date.now }
});

const boardSchema = new mongoose.Schema({
	userID : String,
    name : String,
    companyName : String,
    imagePath : String,
    isVerified : Boolean,
    jobTitle : String,
    jobDescription : String,
    jobLocation : String,
    jobSkills : [ String ],
    jobPay : String,
    jobQualifications : String,
    isOpen : Boolean,
    isActive : Boolean,
    applies : [appliedSchema],
    createdOn : { type : Date, default : Date.now }
});

const JobBoardCollections = mongoose.model('JobBoardCollections', boardSchema);

/********** GET ALL JOB POSTINGS ***********/
router.get('/', async (req, res) => {
    const jobList = await JobBoardCollections.find();
    res.send(jobList);
});

/********** GET JOB POSTINGS BY USER ID ***********/
router.get('/:userID', async (req, res) => {
    const specificJobs = await JobBoardCollections.find({ userID : req.params.userID });
	res.send(specificJobs);
});

/********** CREATE A JOB POSTING ***********/
router.post('/', auth, async (req, res) => {
	try{
        jobPosting = new JobBoardCollections({
            userID : req.body.userID,
            name : req.body.name,
            imagePath : req.body.imagePath,
            companyName : req.body.companyName,
            isVerified : req.body.isVerified,
            jobTitle : req.body.jobTitle,
            jobDescription : req.body.jobDescription,
            jobLocation : req.body.jobLocation,
            jobSkills : req.body.jobSkills,
            jobPay : req.body.jobPay,
            jobQualifications : req.body.jobQualifications,
            isOpen : true,
            isActive : true,
            applies : []
        });

        jobPosting = await jobPosting.save();
        res.send(jobPosting);
    }catch(error){
        //console.log("Error is :: " ,error);
    }
});

/********** UPDATING DETAILS OF WHO APPLIED TO THE JOB POST ***********/
router.put('/apply/:id', auth, async (req, res) => {
	let jobPost = await JobBoardCollections.updateOne(
		{ _id : req.params.id },
		{ $addToSet : {
                        applies : [{
                            userID : req.body.userID,
                            name : req.body.name,
                            imageLink : req.body.imageLink
                        }]
				 }
		});
	res.send(jobPost);
});

/**************** CLOSE THE JOB POSTING *****************/
router.put('/closeJob/:id' , auth, async (req, res) => {
	let jobPost = await JobBoardCollections.updateOne(
		{ _id : req.params.id },
		{ $set : {
                    isOpen : false
				 }
		});
	res.send(jobPost);
});

/**************** DELETE THE JOB POSTING *****************/
router.put('/deleteJob/:id' , auth, async (req, res) => {
	let jobPost = await JobBoardCollections.updateOne(
		{ _id : req.params.id },
		{ $set : {
					isActive : false
				 }
		});
	res.send(jobPost);
});


module.exports = router;