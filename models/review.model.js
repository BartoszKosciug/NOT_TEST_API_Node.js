const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ReviewSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    place_id: { type: String, required: true, max: 100 },
    review: { type: String, required: true },
    review_author: { type: String, required: true, max: 20 },
});

//Export the model
module.exports = mongoose.model('Review', ReviewSchema);