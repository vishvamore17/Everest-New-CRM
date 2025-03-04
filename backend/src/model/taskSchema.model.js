const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  subject: { type: String },
  name: { type: String },
  relatedTo: { type: String },
  taskDate: {
    type: Date,
  },
  dueDate: { 
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "Resolved", "In Progress"],
    default: "Pending",
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  assigned: { type: String },
  // lastReminderDate: { type: Date },
  // lastReminder: { type: String },
  notes: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Task = mongoose.model("tasks", taskSchema);

module.exports = Task;
