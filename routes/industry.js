const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const industrySchema = new mongoose.Schema({
    name : String
});

const IndustryCollections = mongoose.model('IndustryCollections', industrySchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL INDUSTRIES ***********/
router.get('/', async (req, res) => {
    const industies = await IndustryCollections.find();
    res.send(industies);
});


module.exports = router;