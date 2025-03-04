const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    logo: {
      type: String, // Store the file path or URL of the logo
    },
    companyName: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
    },
    website: {
      type: String,
    },
    documentType: {
      type: String,
      enum: ["GST Number", "UdhyamAadhar Number", "State Certificate", "Certificate of Incorporation"],
    },
    documentNumber: {
      type: String,
    },
    panNumber: {
      type: String,
    },
    companyType: {
      type: String,
    },
    employeeSize: {
      type: String,
      enum: ["1-10", "11-50", "51-100", ">100"],
    },
    businessRegistration: {
      type: String,
      enum: ["Sole proprietorship", "One person Company", "Partnership", "Private Limited"],
    },
    dataFilled: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;