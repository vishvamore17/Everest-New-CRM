const express = require('express');
const multer = require('multer');
const { scheduledEventController } = require('../../../controller');
const router = express.Router();

// Set up multer storage for file uploads (store files in memory as Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// Route to create scheduled event (with file upload handling)
router.post("/createScheduledEvent", upload.array('attachments', 5), scheduledEventController.createScheduledEvent); // Accepts up to 5 files

// Routes for other scheduled event CRUD operations
router.get("/getAllScheduledEvents", scheduledEventController.getAllScheduledEvents);
router.get("/getScheduledEventById/:id", scheduledEventController.getScheduledEventById);
router.put("/updateScheduledEvent/:id", scheduledEventController.updateScheduledEvent);
router.delete("/deleteScheduledEvent/:id", scheduledEventController.deleteScheduledEvent);

module.exports = router;
