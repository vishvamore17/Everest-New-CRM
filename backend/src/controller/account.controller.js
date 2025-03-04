const Account = require("../model/accountSchema.model");
const nodemailer = require("nodemailer");
const { storeNotification } = require('./notification.controller');
const cron = require('node-cron');

// const remindEvent = async () => {
//     const io = require('../index'); // Get the initialized socket.io instance
//     const now = new Date();
//     const nowIST = new Date(now.getTime() + (5 * 60 + 30) * 60000); // Convert UTC to IST
//     const todayIST = nowIST.toISOString().split('T')[0]; // Today's date in IST (YYYY-MM-DD)
//     console.log('Cron job running at (IST):', nowIST.toISOString());

//     try {
//         // Fetch all unpaid invoices
//         const invoices = await Invoice.find({
//             date: { $gte: todayIST }, // Fetch events happening today or later
//             status: "Unpaid", // Only unpaid invoices
//         });

//         if (!invoices.length) {
//             console.log('No unpaid invoices to remind');
//             return;
//         }

//         for (const invoice of invoices) {
//             const dueDate = new Date(invoice.date);
//             if (isNaN(dueDate.getTime())) {
//                 console.error(`Invalid due date for invoice: ${invoice._id}`);
//                 continue; // Skip invalid invoices
//             }

//             // Calculate reminder dates
//             const threeDaysBefore = new Date(dueDate);
//             threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

//             const oneDayBefore = new Date(dueDate);
//             oneDayBefore.setDate(oneDayBefore.getDate() - 1);

//             const reminderDateType = todayIST === threeDaysBefore.toISOString().split('T')[0]
//                 ? "3 Days Before"
//                 : todayIST === oneDayBefore.toISOString().split('T')[0]
//                 ? "1 Day Before"
//                 : todayIST === dueDate.toISOString().split('T')[0]
//                 ? "On Due Date"
//                 : null;

//             if (reminderDateType) {
//                 console.log(`Reminder (${reminderDateType}): ${invoice.customerName} has an unpaid invoice`);

//                 // Emit reminder via socket.io
//                 io.emit('reminder', {
//                     id: invoice._id,
//                     customerName: invoice.customerName,
//                     companyName: invoice.companyName,
//                     amount: invoice.remainingAmount,
//                     dueDate: dueDate.toISOString().split('T')[0], // Only date
//                     reminderType: reminderDateType,
//                 });
//                 console.log(`Reminder (${reminderDateType}) emitted for:`, invoice.customerName);
             
//                 // Example of emitting a notification event from backend
//                 io.emit('notification', {
//                     _id: "invoice._id",
//                     title: `Reminder (${reminderDateType}): Unpaid Invoice for ${invoice.companyName}`,
//                     message: `Customer ${invoice.customerName} has an unpaid invoice of ₹${invoice.remainingAmount} for the product "${invoice.productName}". The due date is ${dueDate.toISOString().split('T')[0]}.`,
//                     type: 'reminder',
//                     createdAt: new Date().toISOString(),

//                 });
//                 // Store notification in MongoDB
//                 const notificationData = {
//                     title: `Invoice Reminder (${reminderDateType}): Unpaid Invoice for ${invoice.companyName}`,
//                     message: `Customer ${invoice.customerName} has an unpaid invoice of ₹${invoice.remainingAmount} for the product "${invoice.productName}". The due date is ${dueDate.toISOString().split('T')[0]}.`,
//                     type: 'reminder',
//                 };

//                 await storeNotification(notificationData);

//                 // Send email reminder
//                 const emailMessage = `Dear ${invoice.customerName},\n\nThis is a reminder (${reminderDateType}) to pay your outstanding invoice of ₹${invoice.remainingAmount}. Please make the payment at your earliest convenience.`;

//                 await sendEmailReminder({
//                     params: { id: invoice._id },
//                     body: { message: emailMessage },
//                 });
//                 console.log(`Email sent (${reminderDateType}) for invoice #${invoice._id}`);
//             } else {
//                 console.log(`No reminder needed for invoice #${invoice._id}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error executing remindEvent API:', error);
//     }
// };

// // Schedule the cron job to run daily at midnight (IST)
// cron.schedule('0 * * * *', remindEvent); // Runs at midnight IST (18:30 UTC)




const accountAdd = async (req, res) => {
    try {
        const { accountName, contactName, contactNumber, emailAddress, accountType1, industry, status, accountManager,startDate, endDate, address, description, companyName, bankDetails   } = req.body;

        const newAccount = new Account({
            accountName,
            contactName,
            contactNumber,
            emailAddress,
            accountType1,
            industry,
            status,
            accountManager,
            startDate,
            endDate,
            address,
            description,
            companyName,
            bankDetails
        });

        const savedAccount = await newAccount.save();
        res.status(201).json({ message: "Account added successfully", data: savedAccount });

    } catch (error) {
        console.error("Error adding account:", error);
        res.status(500).json({ message: "Failed to add account", error: error.message });
    }
};

const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        console.log("Updating invoice with ID:", id, "and data:", updates);

        const updatedInvoice = await Invoice.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: updatedInvoice
        });
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const deleteInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully",
            data: deletedInvoice
        });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({});
        res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getInvoiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getUnpaidInvoices = async (req, res) => {

    try {
        const unpaidInvoices = await Invoice.find({ status: "Unpaid" });
        res.status(200).json({
            success: true,
            data: unpaidInvoices,
        });
    } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getPaidInvoices = async (req, res) => {

    try {
        const paidInvoices = await Invoice.find({ status: 'Paid' });

        // Map to extract only the desired fields
        // const response = unpaidInvoices.map(invoice => ({
        //     companyName: invoice.companyName,
        //     withGstAmount:invoice.withGstAmount,
        //     mobile:invoice.mobile,
        //     productName: invoice.productName,
        //     endDate: invoice.date // Assuming 'date' is your end date
        // }));

        // res.status(200).json({
        //     success: true,
        //     data: response
        // });
        res.status(200).json({
            success: true,
            data: paidInvoices
        });
    } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",  // Or another service like SendGrid
    auth: {
        user: "purvagalani@gmail.com",  // Replace with your Gmail ID
        pass: "tefl tsvl dxuo toch",  // Replace with your Gmail App Password
    },
});

const sendEmailReminder = async (req, res) => {
    const { id } = req.params; // Extract the contact ID from the request parameters
    const { message } = req.body; // Extract the message from the request body

    // Validate the message field
    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Message content is required",
        });
    }

    try {
        // Find the invoice by ID
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        // Validate the email address
        if (!invoice.emailAddress) {
            return res.status(400).json({
                success: false,
                message: "Email address not available for this invoice",
            });
        }

        // Define the email options
        const mailOptions = {
            from: "your-email@gmail.com", // Your email address
            to: invoice.emailAddress, // Recipient's email address from the database
            subject: `Payment Reminder for Invoice #${invoice.id}`, // Subject of the email
            text: message, // The message the user wrote
        };

        // Send the email using Nodemailer
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
                message: `Email sent successfully to ${invoice.emailAddress}`,
                data: info.response, // Return the email info (optional)
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


const sendWhatsAppReminder = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the invoice by ID
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        // Construct the recipient's WhatsApp number
        const countryCode = '+91';
        const customerNumber = invoice.contactNumber;
        if (!customerNumber) {
            return res.status(400).json({ success: false, message: "Customer contact number not found" });
        }
        const formattedNumber = `${countryCode}${customerNumber}`;

        // Construct the reminder message
        const message = `Hello ${invoice.customerName},\n\nThis is a reminder to pay your outstanding invoice of ₹${invoice.remainingAmount}. Please make the payment at your earliest convenience.`;

        // Simulate sending a WhatsApp message
        console.log(`Sending WhatsApp message to: ${formattedNumber}`);
        console.log(`Message: ${message}`);

        // Respond with success
        res.status(200).json({
            success: true,
            message: "WhatsApp reminder sent successfully",
        });
    } catch (error) {
        // Handle errors
        console.error("Error sending WhatsApp reminder:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const updateCustomMessage = async(req,res)=>{
    try {
        const { customMessage } = req.body;
        const invoiceId = req.params.invoiceId;
    
        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, { customMessage }, { new: true });
    
        if (!updatedInvoice) {
          return res.status(404).json({ message: 'Invoice not found' });
        }
    
        return res.json({ data: updatedInvoice });
      } catch (error) {
        console.error('Error saving custom message:', error);
        res.status(500).json({ message: 'Failed to save custom message' });
      }
}

module.exports = {
    accountAdd,

    updateInvoice,
    deleteInvoice,
    getAllInvoices,
    getInvoiceById,
    getUnpaidInvoices,
    getPaidInvoices,
    sendEmailReminder,
    sendWhatsAppReminder,
    updateCustomMessage,
};