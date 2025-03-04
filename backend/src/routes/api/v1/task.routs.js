const express = require("express");
const taskController = require("../../../controller/task.controller");
const router = express.Router();

router.post("/createTask", taskController.createTask);

router.get("/getAllTasks", taskController.getAllTasks);

router.get("/getTask/:id", taskController.getTaskById);

router.put("/updateTask/:id", taskController.updateTask);

router.delete("/deleteTask/:id", taskController.deleteTask);

router.get("/getResolvedTasks/:id", taskController.getResolvedTasks);

module.exports = router;
