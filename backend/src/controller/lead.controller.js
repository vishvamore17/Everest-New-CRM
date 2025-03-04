const mongoose = require('mongoose')
const Lead = require("../model/leadSchema.model");


// Create a new lead
const createLead = async (req, res) => {
    try {
        // Ensure that the required fields are present in the request body
        const { companyName, customerName, amount, productName, emailAddress, address, date, status } = req.body;
        
        // Create the lead in the database
        const leadData = new Lead({
            companyName,
            customerName,
            contactNumber: req.body.contactNumber,  // Contact number is optional
            emailAddress,
            address,
            productName,
            amount,
            gstNumber: req.body.gstNumber,  // GST number is optional
            status: status || 'New',  // Default status is 'New' if not provided
            date,
            endDate: req.body.endDate,  // EndDate is optional
            notes: req.body.notes || '',  // Notes are optional
            isActive: req.body.isActive ?? true,  // Default isActive to true if not provided
        });

        await leadData.save();  // Save to the database

        // Respond with a success message
        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            data: leadData
        });
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};


// Get all leads
const getAllLeads = async (req, res) => {
    try {
        // Fetch all leads from the database
        const leads = await Lead.find({});

        // Check if leads were found
        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No leads found"
            });
        }

        // Successfully return all leads
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching leads:", error);  // Log the error for debugging
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Get a lead by ID
const getLeadById = async (req, res) => {
    const { id } = req.params;

    try {
        const lead = await Lead.findById(id);
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error("Error fetching lead:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const updateLead = async (req, res) => {
    const { id } = req.params;  // Extract leadId from the request params
    const updates = req.body;   // Get the updated data from the request body

    try {
        // Check if the leadId is a valid MongoDB ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leadId"
            });
        }

        // Check if any updates are provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update",
            });
        }

        // Update the lead with the new data
        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,  // Return the updated lead after the update
                runValidators: true  // Ensure validators are triggered
            }
        );

        // Check if the lead was found and updated
        if (!updatedLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        // Return the updated lead
        res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            data: updatedLead
        });
    } catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};


// Delete a lead by ID
const deleteLead = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedLead = await Lead.findByIdAndDelete(id);

        if (!deletedLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lead deleted successfully",
            data: deletedLead
        });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Function to get New leads
const getNewLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'New' }, 'Name email amount');
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching New leads:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Function to get Discussion leads
const getDiscussionLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'Discussion' }, 'Name email amount');
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching Discussion leads:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Function to get Demo leads
const getDemoLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'Demo' }, ' email amount');
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching Demo leads:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Function to get Proposal leads
const getProposalLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'Proposal' }, 'Name email amount');
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching Proposal leads:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Function to get Decided leads
const getDecidedLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ status: 'Decided' });
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching Decided leads:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Search leads by month
const searchByMonth = async (req, res) => {
    const { month, year } = req.query;

    try {
        const leads = await Lead.find({
            date: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search leads by year
const searchByYear = async (req, res) => {
    const { year } = req.query;

    try {
        const leads = await Lead.find({
            date: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search leads by date
const searchByDate = async (req, res) => {
    const { date } = req.query;

    try {
        const leads = await Lead.find({
            date: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            }
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update lead status
const updateStatus = async (req, res) => {
    const { leadId, status } = req.body;

    try {
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        lead.status = status;
        await lead.save();

        res.json({ success: true, message: 'Lead status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getLeadsByStatus = async (req, res) => {
    const { status } = req.query;
  
    try {
      const leads = await Lead.find({ status }, 'Name email amount');
      res.status(200).json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error(`Error fetching ${status} leads:`, error);
      res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
  };
  

module.exports = {
    createLead,
    getAllLeads,
    getLeadById,
    updateLead,
    deleteLead,
    getNewLeads,
    getDiscussionLeads,
    getDemoLeads,
    getProposalLeads,
    getDecidedLeads,
    updateStatus,
    searchByMonth,
    searchByYear,
    searchByDate,
    getLeadsByStatus
};
