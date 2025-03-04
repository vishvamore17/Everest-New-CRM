const mongoose = require("mongoose");
const Task = require("../model/taskSchema.model");

// Utility function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new task
const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const newTask = await Task.create(taskData);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Get a task by ID
const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate the ObjectId
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID format.",
    });
  }

  try {
    // Attempt to find the task by ID first
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Proceed to update the task
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation is applied on the update
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  const { id } = req.params;

  // Validate the ObjectId
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID format.",
    });
  }

  try {
    // Attempt to delete the task by its ID
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      data: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Get all resolved tasks
const getResolvedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: "Resolved" });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No resolved tasks found.",
      });
    }

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching resolved tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getResolvedTasks,
};
