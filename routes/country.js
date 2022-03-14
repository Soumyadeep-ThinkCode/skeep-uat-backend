const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const countryNameSchema = new mongoose.Schema({
    name : String,
    code : String
});

const CountryCollections = mongoose.model('CountryCollections', countryNameSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL COUNTRIES ***********/
router.get('/', async (req, res) => {
    const countries = await CountryCollections.find();
    res.send(countries);
});


module.exports = router;