/**
 * Created by Vikas on 6/23/15.
 * Entry point to the application
 */
var Hapi = require('hapi');
var Mongoose = require('mongoose');
var db = Mongoose.connection;
var Config = require('./config');
var Routes = require('./routes');

db.on('error',function(){console.log('Error occurred connecting to database')});
db.once('open',function(){console.log("Database Connection successful")});


var server = new Hapi.Server();
Mongoose.connect('mongodb://'+Config.db.host+':'+Config.db.port+'/pollDb');
server.connection({host:Config.server.host, port:Config.server.port});
server.views({
    engines:{
        html:require('handlebars')
    },
    relativeTo: __dirname,
    path: './views',
    layoutPath: './views/layouts',
    layout: true,
    partialsPath: './views/partials'
});
server.register(require('hapi-auth-cookie'), function (err) {

    server.auth.strategy('session', 'cookie', {
        password: Config.key.secret,
        cookie: 'polling-app-cookie',
        redirectTo: '/login',
        isSecure: false,
    });
});

server.route(Routes);
server.start(function () {console.info('Server started at ' + server.info.uri);});