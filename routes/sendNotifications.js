const { pool } = require("../conf.js");
const nodemailer = require("nodemailer");

const fromMail = "";
const password = "";

const transporter = nodemailer.createTransport({
  // service: "gmail",
  host: "smtp-mail.outlook.com",
  secure: false,
  auth: {
    user: fromMail,
    pass: password,
  },

  // testing
  tls: {
    ciphers: "SSLv3",
  },
  // testing
});

// Function to send email
function sendEmail(to, text, subject = "Subscriotion Expired") {
  const mailOptions = {
    from: fromMail,
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Function to check for ended subscriptions
async function checkForEndedSubscriptions() {
  try {
    let selectQry = `select s.name as student_name, s.rent as student_rent, s.email as student_email,  
    payments.subscription_end_date ,payments.payment,
    hostels.name as hostel_name, hostels.email as hostel_email
    from students s
    inner join payments on payments.student_id = s.id
    inner join hostels on payments.hostel_id = hostels.id
    WHERE DATE(payments.subscription_end_date) = CURDATE()
  `;
    let [results] = await pool.execute(selectQry);

    results.forEach(async function (subscription) {
      let due = subscription.student_rent - subscription.payment;
      const studentmessage = `dear ${subscription.student_name} Your subscription of has been ended today. your current month due is ${due}`;

      await sendEmail(subscription.student_email, studentmessage);
      await sendEmail(subscription.hostel_email, studentmessage);
    });
  } catch (err) {
    console.log("error in cron --------------------");
    console.log(err);
    console.log("error end in cron --------------------");
  }
}

// Run the check for ended subscriptions

module.exports = checkForEndedSubscriptions;
