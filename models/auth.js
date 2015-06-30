/**
 * Created by Vikas on 6/23/15.
 */
var Mongoose = require('mongoose');
var authSchema = new Mongoose.Schema({
    // username of the user
    username : {type: String, unique : true,required:true},
    // token of the user
    token :{
        data : {type:"String"},
        isValid : {type:Boolean}
    },
    // Incorrect attempts in past 1 hour
    incorrectAttempts : {
        count: {type: Number},
        lastAttempt : {type: Number}
    },
    // Stores if user is blocked for 15 mins
    userBlocked : {type: Boolean},
    // Last login parameters
    lastLogin : {
        time: {type: Date},
        os: {type: String},
        ip: {type: String},
        browser: {type: String}
    }
});
var auth = Mongoose.model('auth',authSchema);
module.exports = auth;