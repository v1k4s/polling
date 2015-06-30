/**
 *
 * Created by Vikas on 6/24/15.
 */
var Joi = require('joi');
var Models = require('../models');
var Poll = Models.Poll;
var User = Models.User;
var async = require('async');
exports.create = {
    validate: {
        payload: {
            title : Joi.string().required(),
            desc : Joi.string().required(),
            options : Joi.array()
        }
    },
    auth : 'session',
    handler : function(req,reply){
        console.log(req.auth.credentials.scope);
        if(req.auth.credentials.scope != "admin"){
            reply.view('message',{message:"Ahhhaaaannnn!! You don't belong here. You are not authorized. Contact site administrator"})   ;
            return;
        }
        Poll.findOne({title: req.payload.title}, function(err,poll){
          if(poll) {
              reply.view('message',{title:"Create new Poll", message: "Poll already exists. Please choose another title "});
          } else {
                      console.log(req.payload);
                      var length = req.payload.options.length;
                      var options = new Array;
                      for(var i=0;i<length;i++) {
                          options.push({
                              name : req.payload.options[i],
                              votes : 0
                          })
                      }
                      var newPoll = {
                          title: req.payload.title,                 // Title of Poll
                          desc: req.payload.desc,                 // Description of the Poll
                          options: options
                      }
                      Poll.create(newPoll,function(err,poll){
                      console.log(poll);
                      reply.view('message',{message :"Congratulations, poll created successfully"});
                      console.log('Poll created by admin with title ',poll.title);
              })
          }
        })
   }

}




exports.view = {
    auth: 'session',
    handler: function (req, reply) {
        var id = req.query.id;
            Poll.findById(id, function (err, poll) {
                if (err || (!poll)) {
                    reply.view('message', {
                        title: 'Poll not found',
                        message: 'Sorry the poll specified by you was not found'
                    })
                }  else {
                    console.log(poll);
                    if(req.auth.credentials.scope=="admin") return reply.view('poll', {firstName:req.auth.credentials.firstName,title:poll.title,desc:poll.desc,options:poll.options,id:poll._id,viewVotes:1});
                    else reply.view('poll', {firstName:req.auth.credentials.firstName,id:poll._id,title:poll.title,desc:poll.desc,options:poll.options});

                        }
                  })

    }
}




exports.vote = {
    auth: 'session',
    handler: function (req, reply) {
        console.log(req.payload);
        var message;
        var findUser = function(callback)  {
            User.findOne({username: req.auth.credentials.username}, function (err, user) {
                console.log(req.auth.credentials.username);
                if (err) {
                    console.log(err);
                   return callback(new Error);
                }
                if (user.hasVoted.indexOf(req.payload.id)!= (-1)) {
                    console.log('User has voted already');
                    message = "You have already voted";
                    callback();
                }else {
                    user.hasVoted.push(req.payload.id);
                    user.save();
                    callback();
                }
            })
        }
        var updateVotes = function (callback) {

            Poll.findOne({_id: req.payload.id}, function (err, poll) {
                //var newVotes = poll.options.votes[i] + 1;
                if(!message) {
                    var i = 0;
                    while (i < 100) {
                        if (poll.options[i].name == req.payload.option) break;
                        i++;
                    }
                    poll.options[i].votes++    // = Number(newVotes);
                    console.log(poll);
                    poll.save();
                    message = "Your vote has been registered successfully";
                }
                reply.view('poll',{firstName:req.auth.credentials.firstName,title:poll.title,id:poll._id,desc:poll.desc,options:poll.options,viewVotes:'1',message:message});
                callback();
            })
        }
        async.series([findUser, updateVotes],function(err){
          if(err) return reply.view('message',{message:message});
        });
    }
}




exports.all = {
    auth:'session',
handler : function(req,reply){
    Poll.find({},function(err,polls){
        var pollMap = new Array;
        polls.forEach(function(poll){
            pollMap.push({
                title: poll.title,
                id : poll._id,
                options : poll.options
            })
        })
     reply.view('all',{firstName:req.auth.credentials.firstName,pollMap:pollMap});
    })
}
}