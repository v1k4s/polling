/**
 * Created by Vikas on 6/23/15.
 * Contains model for the Poll
 */
var Mongoose = require('mongoose');
var pollSchema = new Mongoose.Schema({
    // pollId
    title : {type: String, required: true},                 // Title of Poll
    desc : {type: String, required : true},                 // Description of the Poll
    options :[
        {
            name: {type: String, required: true},              // Options to vote for
            votes: {type: Number, required: true}              // Number of votes for each option
        }
             ]
});
var poll = Mongoose.model('Poll',pollSchema);
module.exports = poll;