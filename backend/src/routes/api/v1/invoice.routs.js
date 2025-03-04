const express = require("express");
const InvoiceController = require("../../../controller/invoice.controller");

const router = express.Router();

router.post("/invoiceAdd", InvoiceController.invoiceAdd);
router.put("/updateInvoice/:id", InvoiceController.updateInvoice);
router.delete("/deleteInvoice/:id", InvoiceController.deleteInvoice);
router.get("/getAllInvoices", InvoiceController.getAllInvoices); // New route to get all invoices
router.get("/getInvoice/:id", InvoiceController.getInvoiceById); // New route to get an invoice by ID
router.get("/getUnpaidInvoices", InvoiceController.getUnpaidInvoices);
router.get("/getPaidInvoices", InvoiceController.getPaidInvoices);
router.post("/sendEmailReminder/:id", InvoiceController.sendEmailReminder); // Route to send email reminders
router.put("/updateCustomMessage/:id",InvoiceController.updateCustomMessage);
router.get("/getInvoicesByStatus", InvoiceController.getInvoicesByStatus);
router.post('/updateStatus',InvoiceController.updateStatus)
module.exports = router;
