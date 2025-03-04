const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  complainerName: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  emailAddress: {
    type: String,
  },
  subject: {
    type: String,
  },
  date: {
    type: Date,
  },
  caseStatus: {
    type: String,
    enum: ['Pending', 'Resolved', 'In Progress'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  caseOrigin: {
    type: String,
  },
}, { timestamps: true });

const Complaint = mongoose.model('complaints', complaintSchema);

module.exports = Complaint;
