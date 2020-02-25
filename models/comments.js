const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commented_by: {
                    email: {
                         type: String,
                          required: true
                    },
                    userID: {
                         type: Schema.Types.ObjectId,
                         required: true
                    }
    },
    post_id: {
         type: Schema.Types.ObjectId,
         ref: 'Blog',
         required: true
    },
    comments: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
         type: Date
    }
})



module.exports = mongoose.model('Comment', commentSchema);