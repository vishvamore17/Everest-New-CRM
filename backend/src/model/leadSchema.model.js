const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
      required: true,

      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // Email validation
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    address: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    gstNumber: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      enum: ["New", "Discussion", "Demo", "Proposal", "Decided"], // Add your statuses here
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }, { timestamps: true });


const Lead = mongoose.model("leads", leadSchema);

module.exports = Lead;
