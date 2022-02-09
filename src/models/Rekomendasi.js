const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const rekomendasiSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    src_img: {
        type: String,
    }
});

module.exports = Rekomendasi = model('rekomendasi', rekomendasiSchema);
