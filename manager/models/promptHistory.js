const mongoose = require('mongoose');
const { Schema } = mongoose;

const promptHistory = new Schema({
    prompt: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "STARTED"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('PromptHistory', promptHistory);