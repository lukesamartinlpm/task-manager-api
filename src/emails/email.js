const nodeMailer = require('nodemailer')

//SETTING EMAIL HANDDLER
function transporter(){
    return nodeMailer.createTransport(
        {service:'hotmail',
        auth:{
            user:process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
        })
}

//SEND EMAIL AFTER SIGINUP
const sendWelcomeEmail = async (name,email)=>{
    const transporterObject = transporter()
    await transporterObject.sendMail({
to:email,
from:process.env.EMAIL,
subject:'Thanks for joining',
text:`Welcome to the app ${name}! Let me know how you get along with the app.`
    })
}

//SEND EMAIL AFTER DELETING ACCOUNT
const sendLeavingEmail = async (name,email)=>{
const transporterObject = transporter()
await transporterObject.sendMail({
    to:email,
    from:process.env.EMAIL,
    subject:'Why you leaving!',
    text:`Hi! ${name} let us know why you leaving!?`
})
}
module.exports = {sendWelcomeEmail,sendLeavingEmail}