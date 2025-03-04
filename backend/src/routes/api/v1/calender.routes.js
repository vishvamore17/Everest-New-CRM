const express = require("express");

const { getAllData, updateData, createData, deleteData } = require("../../../controller/calender.controller");

const router = express.Router();

router.post("/createData", createData);
router.get("/getAllData", getAllData);
router.put("/updateData/:id", updateData);  // Add this route for updating data
router.delete("/deleteData", deleteData);  // Add this route for deleting data

module.exports = router;
