const express = require('express');
const {complaintcontroller} = require('../../../controller');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/createComplaint', complaintcontroller.createComplaint); 
router.get('/getAllComplaints', complaintcontroller.getAllComplaints); 
router.get('/getComplaintById/:id', complaintcontroller.getComplaintById); 
router.put('/updateComplaint/:id', complaintcontroller.updateComplaint); 
router.delete('/deleteComplaint/:id', complaintcontroller.deleteComplaint); 
router.post("/sendEmailComplaint", upload.array('attachments[]'), complaintcontroller.sendEmailComplaint);
module.exports = router;