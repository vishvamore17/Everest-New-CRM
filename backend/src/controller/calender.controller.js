const mongoose = require('mongoose');
const Events = require("../model/calenderSchema.model");
const cron = require('node-cron');
const { storeNotification } = require('./notification.controller');

const remindEvent = async () => {
  const io = require('../index');
  const now = new Date();
  const nowIST = new Date(now.getTime() + (5 * 60 + 30) * 60000);
  console.log('Cron job running at (IST): ', nowIST.toISOString());

  try {
      // Log when the cron job runs
      const events = await Events.find({
          date: { $gte: nowIST.toISOString().split('T')[0] }, // Fetch events happening today or later
      });

      if (!events.length) {
          console.log('No events to remind');
          return;
      }

      for (const event of events) {
          const followUpDate = new Date(event.date);
          if (isNaN(followUpDate.getTime())) {
              console.error(`Invalid follow-up date for event: ${event.event}`);
              continue; // Skip invalid events
          }

          // Check if the current date matches the event date
          if (
              nowIST.toISOString().split('T')[0] ===
              followUpDate.toISOString().split('T')[0]
          ) {
              console.log(`Reminder: ${event.event} is scheduled for today!`);

              // Emit reminder to the client (admins/internal users)
              io.emit('calenderreminder', {
                  id: event._id,
                  event: event.event,
                  followUpDate: followUpDate.toISOString().split('T')[0], // Extract only the date
              });
              console.log('Reminder emitted for:', event.event);

              // Example of emitting a notification event from backend
              io.emit('notification', {
                  _id: "event._id",
                  title: `Calender Reminder: ${event.event}`,
                  createdAt: new Date().toISOString(),
                  message: `Your ${event.event} is scheduled for today (${followUpDate.toISOString().split('T')[0]}).`,
                  type: 'calendar',
              });

              // Store notification in MongoDB with an internal-focused message
              const notificationData = {
                  title: `Calender Reminder: ${event.event}`,
                  message: `Your ${event.event} is scheduled for today (${followUpDate.toISOString().split('T')[0]}).`,
                  type: 'calendar',
              };

              await storeNotification(notificationData);
          } else {
              console.log('No reminder needed for:', event.event);
          }
      }
  } catch (error) {
      console.error('Error executing remindEvent API:', error);
  }
};


// Schedule the cron job to run every hour
cron.schedule('0 * * * *', remindEvent);


const getAllData = async (req, res) => {
  try {
    const data = await Events.find({}); // Fetch all documents from the Events collection
    if (!data || data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching Data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

const createData = async (req, res) => {
  const { date, event } = req.body;
  console.log("Received Data:", { date, event });

  try {
    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    // Create and save the new event
    const newEvent = new Events({
      date: parsedDate,
      event,
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: savedEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

const updateData = async (req, res) => {
  const { id } = req.params; // Get event ID from URL parameter
  const updatedData = req.body; // Get updated event data from the request body

  try {
    // Find the event by ID
    const calender = await Events.findById(id);

    // Check if the event exists
    if (!calender) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update the event with the new data
    Object.keys(updatedData).forEach((key) => {
      calender[key] = updatedData[key]; // Update each field in the event object
    });

    // Save the updated event to the database
    await calender.save();

    // Return a success message with the updated event
    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: calender,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

const deleteData = async (req, res) => {
  const { id } = req.body;

  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided.",
      });
    }

    // Delete the event
    const deletedEvent = await Events.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Get event data by ID for editing
const getDataById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Events.findById(id); // Fetch the event by ID
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllData,
  createData,
  updateData,
  deleteData,
  getDataById, // Exposed function to fetch event by ID
};
