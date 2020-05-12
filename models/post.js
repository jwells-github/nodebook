var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema(
    {
        content: {type: String, required: true,},
        posted_date: { type: Date, default: Date.now },
        author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    }
);

module.exports = mongoose.model('Post', PostSchema);