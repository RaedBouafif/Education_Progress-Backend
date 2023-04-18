const nodemailer = require("nodemailer");

const nodeMailer = async (reciever) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "raed.bouaafif@gmail.com", // generated ethereal user
        pass: "brtqsreyidkdtkjj", // generated ethereal password

      },
      connectionTimeout: 60000 // set the timeout value to 60 seconds (or any other value that works for your setup)
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'raed.bouaafif@gmail.com', // sender address
      to: reciever, // list of receivers
      subject: "Report from the Private School ✔", // Subject line
      text: "Report!!!", // plain text body
    });
    console.log("hello")

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
  
module.exports = nodeMailer
