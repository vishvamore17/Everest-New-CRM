require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../model/usersSchema.model");
const jwt = require("jsonwebtoken");
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
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value, // Ensure email is included
            image: profile.photos?.[0]?.value,
            password: null,
            isFirstLogin: true,
          });
        }

        // Generate a JWT token
        const createToken = (id) => {
          return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        };
        const newToken = createToken(user._id);

        // Attach additional data to the user object
        const userWithToken = {
          ...user.toObject(),
          token: newToken,
          isFirstLogin: user.isFirstLogin,
        };

        return done(null, userWithToken);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
/// Serialize user into the session
// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user); // Store the entire user object in the session
});
// Deserialize user from the session
// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user); // Retrieve the entire user object from the session
});