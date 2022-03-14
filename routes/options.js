const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const optionsSchema = new mongoose.Schema({
    name : String,
    value : String
});

const OptionsCollections = mongoose.model('OptionsCollections', optionsSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL INDUSTRIES ***********/
router.get('/', async (req, res) => {
    const options = await OptionsCollections.find();
    res.send(options);
});


module.exports = router;