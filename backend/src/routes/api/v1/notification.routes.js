const express = require('express');
const {notificationcontroller} = require('../../../controller');
const router = express.Router();

router.post('/storeNotification', notificationcontroller.storeNotification); // Delete a notification by ID
router.get('/getAllNotifications', notificationcontroller.getAllNotifications); // Delete a notification by ID
router.delete('/deleteNotification/:id', notificationcontroller.deleteNotification); // Delete a notification by ID
router.delete('/deleteAllNotifications', notificationcontroller.deleteAllNotifications); // Delete a notification by ID

module.exports = router;
