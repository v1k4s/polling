/**
 * Created by Vikas on 6/23/15.
 */
var user = require('../controllers/user');
var poll = require('../controllers/poll');
var cookie = require('hapi-auth-cookie');
module.exports = [
    //{method:'GET',path:'/',handler: function(req,reply){reply.view('index');}}
    {
        method:['POST'],
        path:'/register',
        config:user.register
    },
    {
        method:['GET'],
        path:'/register',
        handler:{
            view : 'register'
        }
    },
    {   method:['POST'],
        path:'/login',
        config:user.login
    },
    {
        method:'POST',
        path: '/user/forgot',
        config : user.forgot
    },
    {
        method: 'POST',
        path: '/poll/new',
        config: poll.create
    },
    {
        method:'POST',
        path:'/reset',
        config: user.resetPassword
    },
    {
        method: 'POST',
        path:'/poll/vote',
        config: poll.vote
    },
    {
        method:'GET',
        path:'/reset',
        config: user.reset
    },
    {
        method: 'GET',
        path:'/poll/view',
        config: poll.view
    },
    {
        method: 'GET',
        path:'/poll/all',
        config: poll.all
    },
    {
        method: 'GET',
        path:'/poll/new',
        config:{
            handler:function(req,reply){

                reply.view('newPoll',{firstName:req.auth.credentials.firstName});
            },
                auth: 'session'
        }
    },
    {
        method: 'GET',
        path: '/verify',
        config: user.verify
    },
    {
        method : 'GET',
        path:'/',
        config:  {
            handler: function(req,reply){
                reply.redirect('/user/dashboard');
            }
        }
    },
    {
        method: 'GET',
        path: '/user/dashboard',
        config: user.dashboard
    },
    {
        method: 'GET',
        path: '/user/profile',
        config: user.profile
    },
    {
        method: 'GET',
        path: '/logout',
        config: user.logout
    },
    {
        method:'GET',
        path:'/login',
        handler:{
            view : 'login'
        }
    },

    {
        method:['GET','POST'],
        path:'/{any*}',
        handler:{
            view: '400'
        }
    }
]