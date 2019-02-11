const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const PostSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        text: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        avatar: {
            type: String,
        },
        likes: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'users',
                },
            },
        ],
        comments: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'users',
                },
                text: {
                    type: String,
                },
                name: {
                    type: String,
                },
                avatar: {
                    type: String,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = Profile = mongoose.model('posts', PostSchema);
