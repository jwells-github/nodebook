var mongoose = require ('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        first_name: {type: String, required: true,},
        surname: {type: String, required: true,},
        email: {type: String, required: true},
        password: {type: String, required: true, min:4,},
        joined_date: { type: Date, default: Date.now },
        birthday: {type: Date},
        friends: {type: Schema.Types.ObjectId, ref:'User'},
        friend_requests: {type: Schema.Types.ObjectId, ref:'User'},
        is_verified: {type: Boolean, default: false}
    }
);

UserSchema
.virtual('url')
.get(function(){
    return '/users/' + this._id;
});

UserSchema
.virtual('full_name')
.get(function(){
    return this.first_name + " " + this.surname;
});

module.exports = mongoose.model('User', UserSchema);