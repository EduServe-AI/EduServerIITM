import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  onboarded: z.boolean().optional(),
  verified: z.boolean().optional(),
  level: z.enum(["foundation", "diploma", "bsc", "bs"]).optional(),
});

// -------------------------- Instructor Onboarding Schema --------------------------------

// Define the time slot schema
const timeSlotSchema = z.object({
  from: z.string(),
  to: z.string(),
});

// Define the day availability schema
const dayAvailabilitySchema = z.object({
  isEnabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

// Define the days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// Create availability schema
export const availabilitySchema = z.object({
  ...Object.fromEntries(daysOfWeek.map((day) => [day, dayAvailabilitySchema])),
});

export const instructorOnboardSchema = z.object({
  iitmProfileUrl: z.string(),
  cgpa: z.coerce.number().min(0).max(10),
  level: z.enum(["foundation", "diploma", "bsc", "bs"]),
  subjects: z.array(z.string()),
  languages: z.array(z.string()),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().trim().min(50).max(500),
  about: z.string().trim().min(50).max(500),
  githubUrl: z
    .string()
    .url("Please provide a valid GitHub URL.")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Please provide a valid LinkedIn URL.")
    .optional()
    .or(z.literal("")),
  availability: availabilitySchema,
});

// Type for the complete schema
export type OnboardingSchemaType = z.infer<typeof instructorOnboardSchema>;
