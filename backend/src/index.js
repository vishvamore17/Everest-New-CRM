require('dotenv').config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer'); // Import multer for file uploads
const path = require('path'); // Import path for file path handling
const routes = require("./routes/api/v1/index");
const connectDB = require("./db/mongoosedb");
const cors = require('cors');
const { storeNotification } = require('./controller/notification.controller');

// Connect to the database
connectDB();

const app = express();
app.use('/uploads', express.static(path.join(__dirname)));

// Middleware setup
app.use(cors());
app.use(express.json());

// Session and Passport setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session expires in 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Directory where files will be saved
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique file names with timestamp
//   }
// });

// // Multer file filter to allow only images
// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const mimeType = allowedTypes.test(file.mimetype);
//     const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
//     if (mimeType && extName) {
//       return cb(null, true);
//     }
//     cb(new Error('Only images are allowed!'));
//   }
// });

// // Route for file upload
// app.post('/upload', upload.single('image'), (req, res) => {
//   res.send('File uploaded successfully!');
// });

// API routes
app.use("/api/v1", routes);

// Define your routes here
app.get("/", (req, res) => res.send("Home Page"));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User object:", req.user); // Log the user object
    const { isFirstLogin, token, email } = req.user;

    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Redirect based on first login
    const redirectTo = isFirstLogin
      ? `http://localhost:3000/GoogleProfile`
      : `http://localhost:3000/Dashboard`;

    res.redirect(redirectTo);
  }
);


app.get("/auth/google/session", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Authenticated User:", req.user); // Logs user details in the backend
    return res.json({ user: req.user });
  }
  console.log("User not authenticated");
  res.status(401).json({ message: "Not authenticated" });
});


// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("token"); // Clear the token cookie
    res.redirect("/");
  });
});



// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO event handling
io.on('connection', (socket) => {
  socket.on('notify', async (notificationData) => {
    try {
      await storeNotification(notificationData);
      socket.emit('notification-saved', { success: true });
      io.emit('notification', notificationData);
    } catch (error) {
      console.error('Error storing notification:', error);
      socket.emit('notification-saved', { success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

// Handle connection errors
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO Connection error:', err);
});

// Start the server
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = io;