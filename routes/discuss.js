const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const userCommentSchema = mongoose.Schema({
    userID : String,
	companyName : String,
    comment : String,
	isVerified : String,
    isActive : Boolean,
    createdOn : { type : Date, default : Date.now }
});

const discussCompanySchema = new mongoose.Schema({
	userID : String,
    companyName : String,
    comment : String,
	isVerified : String,
    isActive : Boolean,
    userComments : [userCommentSchema],
    createdOn : { type : Date, default : Date.now }
});

const DiscussCompanyCollection = mongoose.model('DiscussCompanyCollection', discussCompanySchema);
/************ SCHEMAS DEFINED HERE END ****************/


/********** GET ALL DISCUSSIONS ***********/
router.get('/', async (req, res) => {
    const comments = await DiscussCompanyCollection.find();
    res.send(comments);
});


/********** CREATE A NEW DISCUSSION COMMENT ***********/
router.post('/', auth, async (req, res) => {
	comments = new DiscussCompanyCollection({
        userID : req.body.userID,
        companyName : req.body.companyName,
        comment : req.body.comment,
		isVerified : req.body.isVerified,
        isActive : req.body.isActive,
        userComments : []
    });

    comments = await comments.save();
    res.send(comments);
});

/********** UPDATING USER COMMENTS TO EXISTING POSTS ***********/
router.put('/:postID', auth, async (req, res) => {
	let comments = await DiscussCompanyCollection.updateOne(
		{ _id : req.params.postID },
		{ $addToSet : {
                        userComments : [{
                            userID : req.body.userID,
                            companyName : req.body.companyName,
                            comment : req.body.comment,
							isVerified : req.body.isVerified,
                            isActive : req.body.isActive
                        }]
				 }
		});
	res.send(comments);
});

module.exports = router;