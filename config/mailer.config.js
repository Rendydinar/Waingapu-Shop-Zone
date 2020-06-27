const nodemailer = require('nodemailer');

 
module.exports = function() {
    let mailTransport = nodemailer.createTransport({
        service: 'gmail', // Email Service
        auth: {
            user: 'umburambu45@gmail.com', // YOUR EMAIL
            pass: 'Umburambu45@merdeka' // YOUR PASSWORD EMAIL
        }
    });

    const from = '"Waingapu Shop Zone Admin" <umburambu45@gmail.com>';
    const errorRecipient = 'umburambu45@gmail.com';
    
    return { 
        // fungsi untuk melakukan pengirimankan email
        send: (msg) => (new Promise((resolve, reject) => {
                console.log(mailTransport.auth);
                console.log(mailTransport);
                mailTransport.sendMail({
                    from: from,
                    to: msg.to,
                    subject: msg.subj,
                    text: msg.text,
                    html: msg.html,
                    generateTextHtml: true
                },(err, info) => {
                    if(err) reject(err);
                    else resolve(info);
                });
            })),            
        emailError: function(message, filename, exception) {
            const body = '<h1> Waingapu Shop Zone Error' + 'message:<br><pre>' + message + '</pre><br>';
            if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
            if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';

            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: 'Waingapu Shop Zone Error',
                html: body,
                generateTextHtml: true
            }, function(err) {
                if(err) return err; // console.error('Unable to send email: ' + err);
                 
            });           
        }
    }
}


 /**
 * USAGE: 
 * 
 *  const mailService = require('email)({userMail: 'yourmail@gmail.com', userPasswordMail: 'youpasswordmail'});
 * 
 * // send a message
 * // send(to, subj)
 * Format: mailService.send(to,subj,body)
 * mailService.send('client@gmail.com', 'hay client this your server email service');
 */