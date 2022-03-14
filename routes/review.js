const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const seekerDetails = mongoose.Schema({
    userID : String,
    name : String,
    comment : String,
	isActive : Boolean,
	rating : Number,
    createdOn : { type : Date, default : Date.now }
});

const reviewSchema = mongoose.Schema({
    userID : String,
    seekerReview : [ seekerDetails ]
});

const ReviewsCollection = mongoose.model('ReviewsCollection', reviewSchema);
/************ SCHEMAS DEFINED HERE END ****************/

/********** GET REVIEWS BY REFERRER ID ***********/
router.get('/:userID', async (req, res) => {
    const reviews = await ReviewsCollection.find({ userID : req.params.userID});
    res.send(reviews);
});

/********** CREATE A REFERRER REVIEWS ACCOUNT ***********/
router.post('/', auth, async (req, res) => {
    let reviewAccount = new ReviewsCollection({
		userID : req.body.userID,
        seekerReview : []
    });

    reviewAccount = await reviewAccount.save();
    res.send(reviewAccount);
});

/********** UPDATE THE REVIEW ACCOUNT BY REVIEWS ***********/
router.put('/:userID', auth, async (req, res) => {
    let review = await ReviewsCollection.find({ userID : req.params.userID});

	if(!review){
			res.status(400).send('This profile was not found');
	}

    review = await ReviewsCollection.updateOne(
        { userID : req.params.userID },
        { $addToSet : {
                        seekerReview : [{
                            userID : req.body.seekerReview.userID,
                            name : req.body.seekerReview.name,
                            comment : req.body.seekerReview.comment,
							isActive : req.body.seekerReview.isActive,
							rating : req.body.seekerReview.rating
                        }]
                 }
        });
    res.send(review);
});

module.exports = router;