
const express = require("express");
const router = express.Router();

const globalSearchController = require("../../../controller/globalSearch.controller")

router.get("/",globalSearchController.Search)
module.exports = router;