// models/Invoice.js

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    companyName: { type: String},
    customerName: { type: String},
    contactNumber: { type: String},
    emailAddress: { type: String},
    address: { type: String},
    gstNumber: { type: String},
    productName: { type: String},
    amount: { type: Number},  
    discount: { type: Number},
    gstRate: { type: Number},
    status: { type: String },
    date: { type: Date},
    endDate:{type:Date},
    totalWithoutGst: { type: Number},
    totalWithGst: { type: Number},
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number},
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
