const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const nodemailer = require('nodemailer');
const Users = require("../model/usersSchema.model"); // Import your Users model

// Register Controller
const registerController = async (req, res) => {
    const {
       ownername,
       emailAddress,
       password
    } = req.body;

    try {
        // Check if email exists
        const existingUser = await Users.findOne({ emailAddress: req.body.emailAddress });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new Users({
            ownername: req.body.ownername,  // Owner's name from the body
            emailAddress: req.body.emailAddress,  // Email from the body
            password: hashedPassword,
            isVerified: false,  // Initially not verified
        });

        // Save user to the database
        await newUser.save();

        // Send verification code to user's email or a custom email service.
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();  // Generate a 6-digit code
        newUser.verificationCode = verificationCode;
        newUser.verificationCodeExpires = Date.now() + 3600000;  // 1 hour expiry
        await newUser.save();

        // Send the verification code via email (pseudo-code, replace with actual email sending logic)
        // sendEmail(newUser.emailAddress, "Verify your email", `Your verification code is: ${verificationCode}`);

        return res.status(201).json({ message: "Registration successful, verification code sent to email!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error registering user" });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "purvagalani@gmail.com",
        pass: "tefl tsvl dxuo toch",
    },
});

const sendVerificationCode = async (emailAddress, verificationCode) => {
    try {
        const user = await Users.findOne({ emailAddress });

        const response = await transporter.sendMail({
            from: '"Verification Team" <your_email@example.com>', // Replace with your sender email
            to: emailAddress, // Receiver's email
            subject: "Email Verification Code", // Email subject
            text: `Your verification code is ${verificationCode}`, // Plain text body
            html: `              
            <h4>Hi ${user.ownername},</h4>
            <p>Welcome to CRM! Thank you for signing up. To complete your registration, please verify your email address by entering the verification code below:</p>
            <p style="font-size: 18px; font-weight: bold; color: #007bff;">${verificationCode}</p>
            <p>This code is valid for the next 15 minutes. If you did not sign up for a CRM account, you can safely ignore this email.</p>
            <p>If you need any assistance, feel free to reach out to our support team.</p>
            <p>Thanks,<br>The CRM Team</p>
            `, // HTML body
        });

        console.log('Verification email sent successfully:', response);
    } catch (error) {
        console.error('Failed to send verification email:', error.message);
    }
};
// Verify Email Controller
const verifyEmailController = async (req, res) => {
    const { verificationCode } = req.body;

    try {
        const user = await Users.findOne({ verificationCode });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        // Check if the verification code has expired
        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.verificationCode = null; // Clear the code
        user.verificationCodeExpires = null; // Clear the expiration time
        await user.save();

        return res.status(200).json({ success: true, message: 'Email successfully verified' });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add User Controller
const addUserController = async (req, res) => {
    const {
        logo,
        companyName,
        
        contactNumber,
       
        website,
        BussinessRegestration,
        companyType,
        EmployeeSize,
        panNumber,
        documentType,
        gstNumber,
        udhayamAadhar,
        stateCertificate,
        incorporationCertificate,
    } = req.body;

    try {
        // Ensure email and ownername are already set by register controller
        // const emailAddress = req.body.emailAddress;
        // const ownername = req.body.ownername;

        // Check if the email already exists
        // const existingUser = await Users.findOne({ emailAddress });
        // if (existingUser) {
        //     return res.status(400).json({ message: "Email already exists, use a different one." });
        // }

        // // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with additional details
        const newUser = new Users({
            logo,
            companyName,
            
            contactNumber,
            website,
            BussinessRegestration,
            companyType,
            EmployeeSize,
            panNumber,
            documentType,
            gstNumber,
            udhayamAadhar,
            stateCertificate,
            incorporationCertificate,
        });

        // Save the new user to the database
        await newUser.save();

        return res.status(201).json({ message: "User added successfully!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding user" });
    }
};

module.exports = {
    registerController,
    verifyEmailController,
    sendVerificationCode,
    addUserController
};
