const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAdminNewSellerEmail = async (sellerData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // sending to admin email
    subject: "New Seller Approval Request",
    html: `
      <h2>New Seller Application</h2>
      <p>A new seller has applied on QuickMart.</p>
      <ul>
        <li><strong>Seller Name:</strong> ${sellerData.fullName}</li>
        <li><strong>Store Name:</strong> ${sellerData.storeName}</li>
        <li><strong>Email:</strong> ${sellerData.email}</li>
        <li><strong>Mobile Number:</strong> ${sellerData.mobile}</li>
        <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Please log in to the Admin Dashboard to review.</p>
    `
  };
  // Async fire-and-forget background execution
  transporter.sendMail(mailOptions).catch(error => {
    console.error("Failed to send seller email in background", error);
  });
};

const sendSellerApprovedEmail = async (sellerEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: "Seller Application Approved",
    html: `
      <h2>Congratulations!</h2>
      <p>Your seller account has been approved.</p>
      <p>You can now access the seller dashboard and start listing products.</p>
    `
  };
  transporter.sendMail(mailOptions).catch(error => {
    console.error("Failed to send seller approved email in background", error);
  });
};

const sendSellerRejectedEmail = async (sellerEmail, adminRemark) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: "Seller Application Rejected",
    html: `
      <h2>Application Status Update</h2>
      <p>Your seller application was not approved.</p>
      <p><strong>Reason:</strong></p>
      <p>${adminRemark}</p>
    `
  };
  transporter.sendMail(mailOptions).catch(error => {
    console.error("Failed to send seller rejected email in background", error);
  });
};
module.exports = {
  sendAdminNewSellerEmail,
  sendSellerApprovedEmail,
  sendSellerRejectedEmail
};
