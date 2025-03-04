const express = require('express');
const { contactController } = require('../../../controller');
const router = express.Router();

// Define the routes
router.post('/createContact', contactController.createContact);
router.put('/updateContact/:id', contactController.updateContact);
router.delete('/deleteContact/:id', contactController.deleteContact);
router.get('/getallContacts', contactController.getAllContacts); 
router.get('/findContact/:id', contactController.getContactById);
router.post("/sendEmailReminder/:id", contactController.sendEmailReminder); // Route to send email reminders
router.post('/contacts/sendSMS/:id', contactController.sendSMS); 
// Export the routes
module.exports = router;
