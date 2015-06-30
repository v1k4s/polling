/**
 * Created by Vikas on 6/24/15.
 */
var Joi = require('joi');
var Crypto = require('crypto');
var Mailer = require('./mail');
var Models = require('../models/index');
var moment = require('moment');
var Jwt = require('jsonwebtoken');
var config= require('../config');
var User = Models.User;
var Auth = Models.Auth;



exports.login = {
    /*validate: {
        payload: {
            username: Joi.string().required(),
            password: Joi.string().required()
        }
    },*/
    handler: function (req, reply) {

            if (req.auth.isAuthenticated) {
                reply.redirect('/user/dashboard');
                return;
            }
            var password = Crypto.createHash('sha256').update(req.payload.password).digest('base64');
            User.findOne({username: req.payload.username}, function (err, user) {
                var foundUser = user;
                console.log(foundUser);
                if (!foundUser) {
                    reply.view('login', {message: 'Sorry, username you specified was not found'});        // User not found
                } else {
                    if (foundUser.isVerified == false) {
                        return reply.view('login', {message: 'Username is registered but not verified'}); // username not verified
                    }
                    if (foundUser.password == password) {
                        req.auth.session.set({firstName:foundUser.firstName,lastName:foundUser.lastName,username:foundUser.username,scope:foundUser.scope});// password is true set session
                        if(req.payload.remember == "true") req.auth.session.ttl(1000*3600*24);
                        reply.redirect('/user/dashboard');// redirect user to dashboard
                    }
                    else {
                        reply.view('login', {message: "OOPs, Passwords didn't match"}); // password does not match
                    }
                }
            });
        }
    }


exports.register = {
   /*validate: {
     payload: {
     email : Joi.string().email().required(),
     username: Joi.string().required(),
     password: Joi.required(),
         confirmpassword: Joi.required(),
     firstName: Joi.string().required(),
     lastName: Joi.string().required()
     }
     },*/
    handler: function (req, reply) {

        User.findOne({username:req.payload.username},function(err,user){
            if(user) return reply.view('register',{message:'Username is already registered'});
        })
        var password = Crypto.createHash('sha256').update(req.payload.password).digest('base64');
        req.payload.password = password;
        req.payload.isAdmin = false;
        req.payload.isVerified = false;
        User.create(req.payload, function (err, user) {
            if (!err) {
                tokenData = {
                    username: user.username,
                    id: user._id
                }
                var token = Jwt.sign(tokenData, config.key.secret,{expiresInMinutes: 60*24});
                var link = "http://127.0.0.1:8080/verify?token="+token;
                var mailBody = "<p>Your account has been created. But you need to verify your account by clicking on link below.<br><br><a href='"+link+"'>Click Here</a></p>";
                Mailer.sendMail(config.email.userName, req.payload.email, 'Account Verification', mailBody);
                reply.view('message',{message:'You have been registered but you need to verify your email first Follow the link sent to your e-mail'});
            }
        })
    }
}



exports.verify = {
    handler : function(req,reply){
           var token = req.query.token;
        console.log(token);
        var decoded = Jwt.verify(token,config.key.secret);
            if(!decoded) {
                return reply.view('message',{message:"Link provided by you is invalid. You need to register"});
            }
            User.findOne({username:decoded.username},function(err,user){
                if(user.isVerified == true){
                    reply.view('message',{title:"Verification Page",message:"You are already verified"});
                    return;
                }
                user.isVerified = true;
                console.log(user);
                user.save();
                reply.view('message',{title:"Verification Page",message:"Congratulations, you are verified user, you can login now"});
            })

    }
}


exports.forgot = {
    handler: function(req,reply){
        console.log(req.payload);
        User.findOne({username:req.payload.username}, function(err,user){
            if(err||(!user)) {
                reply.view('login',{message:"Username not found in the database"});
            }else {
                var token = Jwt.sign(req.payload.username, config.key.secret, {expiresInMinutes: 60});
                var link = "http://127.0.0.1:8080/reset?token=" + token;
                var mailBody = "<p>You asked to reset your password recently. Click on the link below to proceed <br><br><a href='" + link + "'>Click Here</a></p>"
                Mailer.sendMail(config.email.userName, user.email, 'Forgot Password', mailBody);
                console.log('password sent');
                reply.view('message',{message:"A Password verification link has been sent to your email"});
            }
            });
    }

}


exports.reset = {
    handler: function (req, reply) {


            token = req.query.token;
            console.log(token);
            var decoded = Jwt.verify(token, config.key.secret);
            if (!decoded) {
                return reply.view('message', {message: "You have provided an invalid verification link"});
            }
            console.log(decoded);

            User.findOne({username: decoded}, function (err, user) {
                if (err || (!user)) {
                    console.log('xyz');
                    reply.view('message', {message: "You have provided an invalid verification link"});
                    return;
                }
                reply.view('reset', {token: token});
                return;
            })
        }
    }


exports.resetPassword = {
    handler : function(req,reply){
        token = req.payload.token;
        console.log(token);
        var decoded = Jwt.verify(token, config.key.secret);
        if (!decoded) {
            return reply.view('message', {message: "You have provided an invalid verification link"});
        }
        User.findOne({username: decoded}, function (err, user) {
            foundUser = user;
            if (err || (!user)) {
                console.log('xyz');
                reply.view('message', {message: "You have provided an invalid verification link"});
                return;

            }
            var password = Crypto.createHash('sha256').update(req.payload.password).digest('base64');
            user.password = password;
            user.save();
            reply.view('message',{message:"Your password has been successfully changed. Proceed to login"});
        });
    }
}


exports.logout = {
    auth:'session',
    handler : function(req,reply){
        req.auth.session.clear();
        return reply.redirect('/login');
    }
}


exports.dashboard = {
    auth: 'session',
    handler : function(req,reply){
        console.log(req.auth.credentials);
        if(req.auth.credentials.scope=="admin"){
            return reply.view('dashboard',{admin : true, firstName : req.auth.credentials.firstName});
        }
        return reply.view('dashboard',{firstName:req.auth.credentials.firstName});
    }
}

exports.profile = {
    auth:'session',
    handler : function(req,reply){
      User.findOne({username:req.auth.credentials.username},function(err,user){
          if(err) return reply.view('message',{message:'Unknown Error occurred'});
          reply.view('profile',user);
      })
    }
}
