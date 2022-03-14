const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const companyNameSchema = new mongoose.Schema({
    companyName : String,
    country : String
});

const CompanyNameCollection = mongoose.model('CompanyNameCollection', companyNameSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL COMPANIES ***********/
router.get('/', async (req, res) => {
    const companies = await CompanyNameCollection.find();
    res.send(companies);
});

/********** CHECK IF COMPANY NAME EXISTS IN COMPANIES LIST ***********/
router.post('/check', async (req, res) => {
    const companies = await CompanyNameCollection.findOne({ companyName : req.body.companyName });
	
	if(companies){
		res.status(200).send(companies);
	}else{
		res.status(400).send("OUT_OF_LIST");
	}
});


module.exports = router;