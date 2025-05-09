const mongoose = require("mongoose");

const projrctSchema = new mongoose.Schema({
    store_name: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        lowercase: true,
        minlength: [3, 'Store name must be at least 3 characters long']
    },
    accessToken: {
        type: String,
        required: [true, 'Access token is required'],
        trim: true
    },
    themeId: {  
        type: String,
        required: [true, 'Theme ID is required'],
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now       
    }
});

const project = mongoose.model('project', projrctSchema);
module.exports = project;