const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  companyName: { type: String },
  customerName: { type: String },
  contactNumber: { type: String },
  emailAddress: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  description: { type: String },
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
