const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const ContentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    src_img: {
        type: String,
    },
    creator: {
        type: String,
        required: true,
    },
    jenis: {
        type: String,
        required: true
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = Content = model('content', ContentSchema);
