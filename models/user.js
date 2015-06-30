/**
 * Created by Vikas on 6/23/15.
 * Contains models for the User
 */
var Mongoose = require('mongoose');
var userSchema = new Mongoose.Schema({
    username : {type: String, unique : true,required:true},
    email : {type:String,unique : true,required:true},
    password : {type: String, required : true},
    firstName : {type: String, required : true},
    lastName : {type: String, required : true},
    isVerified : {type: Boolean, default : false},
    scope : {type:String, default :'user'},
    isBlocked : {type:Boolean,default: false},
    hasVoted : {type:[String],required : false}
});
var user = Mongoose.model('User',userSchema);
module.exports = user;