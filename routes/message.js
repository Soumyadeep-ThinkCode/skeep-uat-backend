const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/************ SCHEMAS DEFINED HERE START ****************/
const messageSchema = mongoose.Schema({
	message : String,
    senderName : String,
    sentOn : { type : Date, default : Date.now }
});

const messageCollectionSchema = new mongoose.Schema({
    userID : String,
    connectionID : String,				
    messages : [messageSchema]
});

const MessageCollection = mongoose.model('MessageCollection', messageCollectionSchema);
/************ SCHEMAS DEFINED HERE END ****************/

/********** CREATE MESSAGING ACCOUNT (WHEN CONNECTION REQUEST ACCEPTED) ***********/
router.post('/', auth, async (req, res) => {
    const messages1 = await MessageCollection.find({ userID : req.body.userID , connectionID : req.body.connectionID });
    const messages2 = await MessageCollection.find({ userID : req.body.connectionID , connectionID : req.body.userID });

    if(messages1.length > 0 || messages2.length > 0){
        res.status(400).send("ACCOUNT_ALREADY_EXISTS");
    }else{
        let message = new MessageCollection({
            userID : req.body.userID,
            connectionID : req.body.connectionID,				
            messages : []
        });
    
        message = await message.save();
        res.send(message);
    }
});

/********** SEND A MESSAGE TO SOMEONE ELSE ***********/
router.put('/sendMsg/:userID/:connectionID', auth, async (req, res) => {
    const messages1 = await MessageCollection.find({ userID : req.params.userID , connectionID : req.params.connectionID });
    const messages2 = await MessageCollection.find({ userID : req.params.connectionID , connectionID : req.params.userID });

    if(messages1 && messages1.length > 0){
        let messages = await MessageCollection.updateOne(
            { userID : req.params.userID , connectionID : req.params.connectionID },
            { $addToSet : {
                            messages : [{
                                message : req.body.message,
                                senderName : req.body.senderName
                            }]
                     }
            });
        res.status(200).send(messages);
    }else if(messages2 && messages2.length > 0){
        let messages = await MessageCollection.updateOne(
            { userID : req.params.connectionID , connectionID : req.params.userID },
            { $addToSet : {
                            messages : [{
                                message : req.body.message,
                                senderName : req.body.senderName
                            }]
                     }
            });
        res.status(200).send(messages);
    }else{
        res.status(400).send("NOT_CONNECTED_TO_SEND_MSG");
    }	
});

/********** GET ALL MESSAGES BY PERSON ID ***********/
router.get('/getByID/:userID/:connectionID', auth, async (req, res) => {
    const messages1 = await MessageCollection.find({ userID : req.params.userID , connectionID : req.params.connectionID });
    const messages2 = await MessageCollection.find({ userID : req.params.connectionID , connectionID : req.params.userID });
    
    if(messages1 && messages1.length > 0){
        res.status(200).send(messages1);
    }else if(messages2 && messages2.length > 0){
        res.status(200).send(messages2);
    }else{
        res.status(400).send("NO_ACCOUNT_CREATED");
    }
    
});

module.exports = router;