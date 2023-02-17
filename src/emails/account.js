const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to:'ahmedelewa79@gmail.com',
//     from:'ahmedelewa79@gmail.com',
//     subject:'My first Email',
//     text:'I Hope to understand how it can send'
// })
const sendWelcomingMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ahmedelewa79@gmail.com',
        subject:'Welcoming Email',
        text:`Welcome to the Task App which created by Ahmed Eliwa,${name} Let us know how you get long with 
                this Application,
                and I hope from you to keep on your goal on Data Analasys`
    })
};

const cancelingEmail= (email)=>{
    sgMail.send({
        to:email,
        from:'ahmedelewa79@gmail.com',
        subject:'Canceling Email',
        text:`we are to sorry for canceling your email, and we need to know if are there,
                any issue distrubted you `
    })
}

module.exports={
    sendWelcomingMail,
    cancelingEmail
}