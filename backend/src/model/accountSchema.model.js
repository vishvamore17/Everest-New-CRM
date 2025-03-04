const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  bankName: { type: String, required: true, minlength: 2 },
  accountNumber: { type: String, required: true, minlength: 2 },
  sortCode: { type: String, required: true, minlength: 2 },
  accountType2: { type: String, required: true, enum: ["Checking", "Savings"] },
  bankAddress: { type: String, required: true, minlength: 2 },
  swiftCode: { type: String, required: true, minlength: 2 },
});

const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, minlength: 2 },
  contactName: { type: String, required: true, minlength: 2 },
  contactNumber: { type: String },
  emailAddress: { type: String, required: true, match: /.+\@.+\..+/ },
  accountType1: { type: String, required: true, enum: ["Prospect", "Customer", "Partner"] },
  industry: { type: String, required: true, minlength: 2 },
  status: { type: String, required: true, enum: ["Active", "Inactive"] },
  accountManager: { type: String, required: true, minlength: 2 },
  startDate: { type: Date },
  endDate: { type: Date },
  address: { type: String, required: true, minlength: 2 },
  description: { type: String },
  companyName: { type: String, required: true, minlength: 2 },
  bankDetails: bankDetailsSchema,
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;