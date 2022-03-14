const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const utilitiesSchema = new mongoose.Schema({
    buttonId : String,
    isClicked : Boolean,
    clickedOn : { type : Date, default : Date.now }
});

const UtilityCollection = mongoose.model('UtilityCollection', utilitiesSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET BUTTON CLICK IDENTITY ***********/
router.get('/:buttonId', async (req, res) => {
    const utilities = await UtilityCollection.findOne({ buttonId : req.params.buttonId });;
    res.send(utilities);
});

/************ BUTTON IS CLICKED INSERTION *************/
router.post('/', async (req, res) => {
    try{
        utilities = new UtilityCollection({
            buttonId : req.body.buttonId,
            isClicked : req.body.isClicked
        });
        utilities = await utilities.save();
		res.send(utilities);
	}catch(error){
		//console.log("Error is :: " ,error);
	}
});

module.exports = router;