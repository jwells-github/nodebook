var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
        content: {type: String, required: true,},
        posted_date: { type: Date, default: Date.now },
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        likes: {type: Schema.Types.ObjectId, ref: 'User'},
    }
);

module.exports = mongoose.model('Post', CommentSchema);