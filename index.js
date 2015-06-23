/**
 * Created by Vikas on 6/23/15.
 */
var Hapi = require('hapi');
var Mongoose = require('mongoose');
var db = Mongoose.connection;
db.on('error',console.log('Error occurred connecting to database'));
db.once('open',console.log("Database Connection successful"));
var Config = require('./config');
var server = new Hapi.Server();
mongoose.connect('mongodb://'+Config.db.host+':'+Config.db.port+'/pollDb');
server.connection({host:Config.server.host, port:Config.server.port});
server.start(function(err){
    console.log('Server started successfully at ', server.info.uri);
});