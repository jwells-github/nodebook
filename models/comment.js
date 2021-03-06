var mongoose = require ('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var CommentSchema = new Schema(
    {
        content: {type: String, required: true,},
        posted_date: { type: Date, default: Date.now },
        author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    }
);


CommentSchema
.virtual('date_formatted')
.get(function(){
    return moment(this.posted_date).format('LLL').toString();
});

module.exports = mongoose.model('Comment', CommentSchema);