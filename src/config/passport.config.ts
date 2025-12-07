import passport from "passport";
import { Profile } from "passport-google-oauth20";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model";

// Serializing user for session

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

type DoneFunction = (error: any, user?: any, info?: any) => void;

const googleStrategyCallback = async (
  profile: Profile,
  done: DoneFunction,
  role: "student" | "instructor",
  verified: boolean
) => {
  try {
    // check if user already exists with this Google ID
    let user = await User.unscoped().findOne({
      where: {
        googleId: profile.id,
      },
    });

    if (user) {
      return done(null, user);
    }

    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error("Email not found in Google profile."), undefined);
    }

    // checkinfg if user exists with this email
    const existingUser = await User.unscoped().findOne({
      where: {
        email: profile.emails![0].value,
      },
    });

    if (existingUser) {
      // Linking google id to existing user
      existingUser.googleId = profile.id;
      await existingUser.save();
      return done(null, existingUser);
    }

    // Creating user if not exists
    user = await User.create({
      username: profile.displayName,
      email,
      googleId: profile.id,
      role,
      verified,
      onboarded: false,
    });

    done(null, user);
  } catch (error) {
    done(error as Error, undefined);
  }
};

passport.use(
  "google-student",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_STUDENT!,
    },
    (accessToken, refreshToken, profile, done) =>
      googleStrategyCallback(profile, done, "student", true)
  )
);

passport.use(
  "google-instructor",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_INSTRUCTOR!,
    },
    (accessToken, refreshToken, profile, done) =>
      googleStrategyCallback(profile, done, "instructor", false)
  )
);

export default passport;
