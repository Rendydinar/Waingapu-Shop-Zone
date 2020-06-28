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
        }))           
        
    }
}

