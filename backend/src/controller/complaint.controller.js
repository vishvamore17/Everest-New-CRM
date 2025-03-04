const Complaint = require('../model/complaintSchema.model');
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const multer = require('multer');


const createComplaint = async (req, res) => {
  try {
    const { companyName, complainerName, contactNumber, emailAddress, subject, date, caseStatus, priority, caseOrigin,} = req.body;

    const newComplaint = new Complaint({
      companyName,
      complainerName,
      contactNumber,
      emailAddress,
      subject,
      date,
      caseStatus: caseStatus || 'Pending',
      priority: priority || 'Medium',
      caseOrigin,
    });

    // Save to DB
    const savedComplaint = await newComplaint.save();

    // Return saved complaint as response
    return res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint: savedComplaint, // This is the key to return
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
    });
  }
};


// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find(); // Fetch all complaints from the database
    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
    });
  }
};

// Get a specific complaint by ID
const getComplaintById = async (req, res) => {
  const { id } = req.params; // Extract ID from URL params
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
    });
  }
};

// Update a specific complaint by ID
const updateComplaint = async (req, res) => {
  const { id } = req.params; // Get complaint ID from URL
  const updatedData = req.body; // Get updated complaint data from the request body

  try {
    // Find the complaint by ID and update it
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update the complaint with the new data
    Object.keys(updatedData).forEach((key) => {
      complaint[key] = updatedData[key]; // Update each field in the complaint object
    });

    // Save the updated complaint to the database
    await complaint.save();

    // Return a success message with the updated complaint
    res.status(200).json({ success: true, message: 'Complaint updated successfully!', data: complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
};

// Delete a specific complaint by ID
const deleteComplaint = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(id);
    if (!deletedComplaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",  
  auth: {
      user: "purvagalani@gmail.com",  
      pass: "tefl tsvl dxuo toch",  
  },
});


const sendEmailComplaint = async (req, res) => {
  const { to, subject = "(No Subject)", message = "(No Message)" } = req.body; // Provide default values
  const attachments = req.files; // Get uploaded files

  if (!to) {
      return res.status(400).json({
          success: false,
          message: "The recipient's email (to) is required.",
      });
  }

  try {
      const mailOptions = {
          from: "purvagalani@gmail.com",
          to: to,
          subject: subject || "(No Subject)", // Use default if empty
          html: message || "(No Message)", // Use default if empty
          attachments: attachments
              ? attachments.map(file => ({
                    filename: file.originalname,
                    path: file.path,
                }))
              : [], // Handle case where there are no attachments
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error("Error sending email:", error.message);
              return res.status(500).json({
                  success: false,
                  message: "Error sending email: " + error.message,
              });
          }

          console.log("Email sent successfully: " + info.response);
          res.status(200).json({
              success: true,
              message: `Email sent successfully to ${to}`,
              data: info.response,
          });
      });
  } catch (error) {
      console.error("Error sending email:", error.message);
      res.status(500).json({
          success: false,
          message: "Internal server error: " + error.message,
      });
  }
};


module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  sendEmailComplaint
};
