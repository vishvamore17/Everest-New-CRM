const express = require("express");
const OwnerController = require("../../../controller/Owner.controller");
const router = express.Router();

router.post("/addOwner", OwnerController.addOwner);
router.get("/getAllOwners", OwnerController.getOwners);
router.put("/updateOwner/:id",  OwnerController.updateOwner); // Use the upload middleware
router.delete("/deleteOwner/:id", OwnerController.deleteOwner);
router.get("/count", OwnerController.getOwnerCount);
router.get("/getOwnerForInvoice", OwnerController.getOwnerForInvoice);

module.exports = router;