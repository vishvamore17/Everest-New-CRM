// const mongoose = require("mongoose");

// const calenderSchema = new mongoose.Schema(
//     {
//         date: {
//             type: Date
//         },
//         event: {
//             type: String
//         },
//         status: {
//             type: String,
//             enum: ["Medium", "High", "Low"], // Add your statuses here
//         }
//     },

// );

// const Events = mongoose.model("Events", calenderSchema);

// module.exports = Events;


const mongoose = require("mongoose");

const calenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    calendarId: {
      type: Number,
      required: true,
    },
    event: {
      type: String,
    },
  },
  { timestamps: true }
);

const Events = mongoose.model("Events", calenderSchema);

module.exports = Events;

