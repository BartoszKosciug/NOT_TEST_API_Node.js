const express = require('express');
const routerReview = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/review.model');

routerReview.get('/get', (req, res)=>{
    Review.find()
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

routerReview.post('/post', (req, res, next) => {

    const review = new Review({
        _id: new mongoose.Types.ObjectId(),
        place_id: req.body.restaurant_name,
        review: req.body.review,
        review_author: req.body.review_author,
    });
    review.save().then(result => {
        console.log(result);
    }).catch(err => console.log(err));
    res.status(201).json({
        message: "Handling POST requests to /review",
        createdReview: review
    });
});


module.exports = routerReview; 