const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });  // Store files in memory
const Scheduled = require("../model/scheduledSchema.model");

// Create a new scheduled event
const createScheduledEvent = async (req, res) => {
    try {
        const eventData = req.body;

        // Handle file attachments if they are included
        if (req.files && req.files.length > 0) {
            eventData.attachments = req.files.map(file => file.buffer);  // Store files as Buffer in DB
        }

        // Validate the recurrence value explicitly (optional)
        const validRecurrences = ['one-time', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
        if (eventData.recurrence && !validRecurrences.includes(eventData.recurrence)) {
            return res.status(400).json({
                success: false,
                message: `Invalid recurrence value. Allowed values are: ${validRecurrences.join(', ')}`,
            });
        }


        // Create a new event
        const newEvent = await Scheduled.create(eventData);

        res.status(201).json({
            success: true,
            message: "Scheduled event created successfully",
            data: newEvent,
        });
    } catch (error) {
        console.error("Error creating scheduled event:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Get all scheduled events
const getAllScheduledEvents = async (req, res) => {
    try {
        const events = await Scheduled.find({});
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error("Error fetching scheduled events:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Get a scheduled event by ID
const getScheduledEventById = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Scheduled.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Scheduled event not found"
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error("Error fetching scheduled event:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Update a scheduled event by ID
const updateScheduledEvent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedEvent = await Scheduled.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true, // This ensures the enum values and other constraints are validated
        });

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: "Scheduled event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Scheduled event updated successfully",
            data: updatedEvent
        });
    } catch (error) {
        console.error("Error updating scheduled event:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Delete a scheduled event by ID
const deleteScheduledEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Scheduled.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: "Scheduled event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Scheduled event deleted successfully",
            data: deletedEvent
        });
    } catch (error) {
        console.error("Error deleting scheduled event:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Search scheduled events by month
// Search scheduled events by month
const searchByMonth = async (req, res) => {
    const { month, year } = req.query;

    // Validate month and year
    if (!month || !year) {
        return res.status(400).json({
            success: false,
            message: "Both month and year are required"
        });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    // Validate month and year ranges
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
            success: false,
            message: "Invalid month. It must be between 1 and 12."
        });
    }
    if (isNaN(parsedYear)) {
        return res.status(400).json({
            success: false,
            message: "Invalid year."
        });
    }

    try {
        // Start of the month
        const startDate = new Date(parsedYear, parsedMonth - 1, 1);
        // End of the month (start of the next month)
        const endDate = new Date(parsedYear, parsedMonth, 1);

        // Find events that are within the month range
        const events = await Scheduled.find({
            followUp: {
                $gte: startDate,
                $lt: endDate
            }
        });

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error("Error searching by month:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Search scheduled events by year
const searchByYear = async (req, res) => {
    const { year } = req.query;

    // Validate year
    if (!year) {
        return res.status(400).json({
            success: false,
            message: "Year is required"
        });
    }

    const parsedYear = parseInt(year, 10);

    // Validate year
    if (isNaN(parsedYear)) {
        return res.status(400).json({
            success: false,
            message: "Invalid year."
        });
    }

    try {
        // Start of the year (January 1st)
        const startDate = new Date(parsedYear, 0, 1);
        // End of the year (January 1st of the next year)
        const endDate = new Date(parsedYear + 1, 0, 1);

        // Find events that are within the year range
        const events = await Scheduled.find({
            followUp: {
                $gte: startDate,
                $lt: endDate
            }
        });

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error("Error searching by year:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

module.exports = {
    createScheduledEvent,
    getAllScheduledEvents,
    getScheduledEventById,
    updateScheduledEvent,
    deleteScheduledEvent,
    searchByMonth,
    searchByYear,
};
