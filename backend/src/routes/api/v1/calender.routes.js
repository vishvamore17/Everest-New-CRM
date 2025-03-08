
// const express = require("express");

// const { getAllData, updateData, createData, deleteData } = require("../../../controller/calender.controller");

// const router = express.Router();

// router.post("/createData", createData);
// router.get("/getAllData", getAllData);
// router.put("/updateData/:id", updateData);  // Add this route for updating data
// router.delete("/deleteData", deleteData);  // Add this route for deleting data

// module.exports = router;
const express = require("express");
const {
  getAllData,
  createData,
  updateData,
  deleteData,
  getDataById,
} = require("../../../controller/calender.controller");

const router = express.Router();

router.post("/createEvent", createData);
router.get("/getEvent", getAllData);
router.put("/updateEvent/:id", updateData);
router.delete("/deleteEvent/:id", deleteData);
router.get("/getEventById/:id", getDataById);

module.exports = router;
