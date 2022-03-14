const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const departmentSchema = new mongoose.Schema({
    name : String
});

const DepartmentCollections = mongoose.model('DepartmentCollections', departmentSchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL COUNTRIES ***********/
router.get('/', async (req, res) => {
    const departments = await DepartmentCollections.find();
    res.send(departments);
});


module.exports = router;