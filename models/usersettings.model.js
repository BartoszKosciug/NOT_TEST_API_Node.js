const mongoose = require('mongoose');
const Schema = mongoose.Schema;

Schema.Types.Int8Array

let UsersettingSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userid: {type: String, required: true},
    min_price: {type: Number, required: false},
    max_price: {type: Number, required: false},
    is_open: {type: Boolean, required: false},
    radius: {type: Number, required: false}
});

//Export the model
module.exports = mongoose.model('Usersettings', UsersettingSchema);