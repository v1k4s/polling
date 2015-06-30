/**
 * Created by Vikas on 6/23/15.
 */
var nodeMailer = require('nodemailer');
var Config = require('../config');
var smtpTransport = nodeMailer.createTransport({
    service : 'Gmail',
    auth :{
        user: Config.email.email,
        pass: Config.email.pass
    }
})
exports.sendMail = function(from,to,subject,body){
    var mailOptions = {
        from : from,
        to : to,
        subject : subject,
        html : body
    }
    smtpTransport.sendMail(mailOptions, function(err,response){
        console.log(err,response);
    })
}