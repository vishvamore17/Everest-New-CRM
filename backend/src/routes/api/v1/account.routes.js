const express = require("express");
const accountController = require("../../../controller/account.controller");

const router = express.Router();

router.post("/accountAdd", accountController.accountAdd);

router.put("/updateInvoice/:id", accountController.updateInvoice);
router.delete("/deleteInvoice/:id", accountController.deleteInvoice);
router.get("/getAllInvoices", accountController.getAllInvoices); // New route to get all invoices
router.get("/getInvoice/:id", accountController.getInvoiceById); // New route to get an invoice by ID
router.get("/getUnpaidInvoices", accountController.getUnpaidInvoices);
router.get("/getPaidInvoices", accountController.getPaidInvoices);
router.post("/sendEmailReminder/:id", accountController.sendEmailReminder); // Route to send email reminders
router.put("/updateCustomMessage/:id",accountController.updateCustomMessage)
module.exports = router;
