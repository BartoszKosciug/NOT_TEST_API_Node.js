const express = require('express');
const usersettingsRouter = express.Router();
const mongoose = require('mongoose');
const Usersettings = require('../models/usersettings.model');

usersettingsRouter.post('/post', (req, res) => {

    const settings = new Usersettings({
        _id: new mongoose.Types.ObjectId(),
        userid: req.body.userid,
        min_price: 0,
        max_price: 4,
        is_open: false,
        radius: 1500

    });
    settings.save().then(result => {
        console.log(result);
    }).catch(err => console.log(err));
    res.status(201).json({
        message: "Handling POST requests to /usersettings",
        createdSettings: settings
    });
});

usersettingsRouter.post('/byuserid', (req, res) => {
    const id = req.body.userid;
    Usersettings.find({ userid: { $eq: id } })
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json(doc);
            }
            else {
                res.status(404).json({ message: "No valud entry found for provided User Id" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

usersettingsRouter.put("/change", (req, res) => {
    const id = req.body.uid;
    var updateOps = []; 
    updateOps.push({'radius' : req.body.radius});
   
    Usersettings.update( {userid: { $eq: id }}, { radius:req.body.radius })
        .exec()
        .then(result => {
                res.status(200).json(result);
            }
            
        )
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

usersettingsRouter.delete('/byuserid', (req, res) => {
    const id = req.body.userid;
    Usersettings.remove({ userid: { $eq: id } }).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

usersettingsRouter.get('/get', (req, res) => {
    Usersettings.find()
        .exec()
        .then(docs => {
            console.log(docs);
            //   if (docs.length >= 0) {
            res.status(200).json(docs);
            //   } else {
            //       res.status(404).json({
            //           message: 'No entries found'
            //       });
            //   }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});



module.exports = usersettingsRouter; 