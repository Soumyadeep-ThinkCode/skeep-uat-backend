const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const appliesSchema = new mongoose.Schema({
	userID : String,
    jobID : String,
    refUserID : String,
    refName : String,
    applyCompany : String,
    jobTitle : String,
    jobLocation : String,
    appliedOn : { type : Date, default : Date.now }
});

const AppliesCollections = mongoose.model('AppliesCollections', appliesSchema);

/********** INSERT NEW JOB APPLY DETAILS ***********/
router.post('/', auth, async (req, res) => {
	try{
        jobApply = new AppliesCollections({
            userID : req.body.userID,
            jobID : req.body.jobID,
            refUserID : req.body.refUserID,
            refName : req.body.refName,
            applyCompany : req.body.applyCompany,
            jobTitle : req.body.jobTitle,
            jobLocation : req.body.jobLocation
        });

        jobApply = await jobApply.save();
        res.send(jobApply);
    }catch(error){
        //console.log("Error is :: " ,error);
    }
});

/********** GET ALL JOB APPLIES BY USER ID ***********/
router.get('/:userID', auth, async (req, res) => {
    const jobApply = await AppliesCollections.find({ userID : req.params.userID });
	res.send(jobApply);
});

/**************** CHECK IF ALREADY APPLIED OR NOT ************************/
router.post('/check', auth, async (req, res) => {
    let appliedJobCount = await AppliesCollections.find({ userID : req.body.userID, jobID : req.body.jobID });

    if(appliedJobCount.length > 0){
        res.status(400).send("ALREADY_APPLIED");
    }else{
        res.status(200).send("NOT_APPLIED");
    }
});

module.exports = router;