const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//   to: 'katbeloy@gmail.com',
//   from: 'mikelPuge@mikel.com',
//   subject: 'Hei beautipul',
//   text: "kiss muah"
// })

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'me@me.com',
    subject: 'Welcome to Jumanji',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`
  })
}

const sendByeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'me@me.com',
    subject: 'Bye to Jumanji',
    text: `Hi, ${name}. What went wrong?`
  })
}

module.exports = {
  sendWelcomeEmail, sendByeEmail
}