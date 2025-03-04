const mongoose = require("mongoose");

const calenderSchema = new mongoose.Schema(
    {
        date: {
            type: Date
        },
        event: {
            type: String
        }
    },

);

const Events = mongoose.model("Events", calenderSchema);

module.exports = Events;
