const mongoose = require('mongoose');
const {Schema, model} = mongoose;


const AdminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    active: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = Admin = model('Admin', AdminSchema);