require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../model/usersSchema.model");
// const { createToken } = require('../controller/user.controller'); // Assuming you have a token generator
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Users.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user on first login
          user = await Users.create({
            googleId:null,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            image: profile.photos?.[0]?.value,
            password: null,
            isFirstLogin: true, // ✅ Set to true for new users
          });
        }

        // Check if it's the first login
        const isFirstLogin = user.isFirstLogin;

        if (isFirstLogin) {
          user.isFirstLogin = false; // ✅ Set to false after first login
          await user.save();
        }
        const createToken = (id) => {
          return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        };

        // Generate a token
        const newToken = createToken(user._id);

        // Attach additional data to the user object
        const userWithToken = {
          ...user.toObject(),
          token: newToken,
          isFirstLogin,
        };

        return done(null, userWithToken);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
