import passport from "passport";


import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model";


// Serializing user for session 

passport.serializeUser((user : any, done) => {
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


// Google OAUTH strategy for students 
passport.use("google-student",
    new GoogleStrategy({
        clientID : process.env.GOOGLE_CLIENT_ID!,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL : process.env.GOOGLE_CALLBACK_URL_STUDENT!,
        
    }, 
    async (accessToken , refreshToken , profile , done) => {
        try {
            // check if user already exists with this Google ID
            let user = await User.unscoped().findOne({where : {
                googleId : profile.id
            }})

            if (user){
                return done(null , user)
            }

            // checkinfg if user exists with this email 
            const existingUser = await User.unscoped().findOne({where : {
                email : profile.emails![0].value
            }}) 

            if (existingUser){
                // Linking google id to existing user
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null , existingUser)
            }

            // Creating user if not exists 
            user =await User.create({
                username : profile.displayName,
                email : profile.emails![0].value,
                googleId : profile.id,
                role : "student",
                verified : true,
                onboarded : false
            })

            done(null, user);
            
        } catch (error) {
            done(error as Error, undefined);
            
        }
    }
)
)

// Google OAUTH strategy for students 
passport.use("google-instructor",
    new GoogleStrategy({
        clientID : process.env.GOOGLE_CLIENT_ID!,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL : process.env.GOOGLE_CALLBACK_URL_INSTRUCTOR!,
        
    }, 
    async (accessToken , refreshToken , profile , done) => {
        try {
            // check if user already exists with this Google ID
            let user = await User.unscoped().findOne({where : {
                googleId : profile.id
            }})

            if (user){
                return done(null , user)
            }

            // checkinfg if user exists with this email 
            const existingUser = await User.unscoped().findOne({where : {
                email : profile.emails![0].value
            }}) 

            if (existingUser){
                // Linking google id to existing user
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null , existingUser)
            }

            // Creating user if not exists 
            user =await User.create({
                username : profile.displayName,
                email : profile.emails![0].value,
                googleId : profile.id,
                role : "instructor",
                onboarded : false,
                verified : false
            })

            done(null, user);
            
        } catch (error) {
            done(error as Error, undefined);
            
        }
    }
)
)


export default passport;


