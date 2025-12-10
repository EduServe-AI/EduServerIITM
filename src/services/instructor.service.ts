import { Transaction } from "sequelize";
import Availability from "../models/availability.model";
import DayOfWeek from "../models/dayofWeek";
import InstructorProfiles from "../models/instructor.model";
import Skill from "../models/skill.model";
import AvailabilityTimeSlot from "../models/timeSlot.model";
import User from "../models/user.model";
import UserLanguage from "../models/userLanguage.model";
import type { Price } from "../types/price";
import { getCourseId } from "./course.service";
import { getLanguageId } from "./language.service";

// Type definitions for update payloads
interface UserUpdatePayload {
  username?: string;
  email?: string;
  level?: "foundation" | "diploma" | "bsc" | "bs";
}

interface InstructorProfileUpdatePayload {
  bio?: string;
  basePrice?: Price;
  githubUrl?: string;
  linkedinUrl?: string;
  iitmProfileUrl?: string;
  cgpa?: number;
  level?: "foundation" | "diploma" | "bsc" | "bs";
}

interface SkillPayload {
  name: string;
  id?: string;
}

interface LanguagePayload {
  language: {
    name: string;
    id?: string;
  };
  languageId?: string;
}

interface TimeSlotPayload {
  startTime: string;
  endTime: string;
  id?: string;
}

interface AvailabilityPayload {
  dayOfWeek?: {
    id?: number;
    name: string;
  };
  isAvailable: boolean;
  timeSlots?: TimeSlotPayload[];
  id?: string;
}

/**
 * Update user fields (username, email, level)
 * Validates email format and uniqueness
 */
export const updateUserFields = async (
  user: User,
  updates: UserUpdatePayload,
  transaction: Transaction
): Promise<{ success: boolean; error?: string }> => {
  const userUpdates: Partial<{
    username: string;
    email: string;
    level: "foundation" | "diploma" | "bsc" | "bs";
  }> = {};

  // Process username
  if (updates.username !== undefined && updates.username !== null) {
    userUpdates.username = updates.username;
  }

  // Process email with validation
  if (updates.email !== undefined && updates.email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      where: { email: updates.email },
    });

    if (existingUser && existingUser.id !== user.id) {
      return {
        success: false,
        error: "Email is already in use by another user",
      };
    }

    userUpdates.email = updates.email;
  }

  // Process level
  if (updates.level !== undefined && updates.level !== null) {
    userUpdates.level = updates.level;
  }

  // Apply updates if any
  if (Object.keys(userUpdates).length > 0) {
    await user.update(userUpdates, { transaction });
  }

  return { success: true };
};

/**
 * Update instructor profile fields
 * Validates basePrice and cgpa ranges
 */
export const updateInstructorProfileFields = async (
  instructorProfile: InstructorProfiles,
  updates: InstructorProfileUpdatePayload,
  transaction: Transaction
): Promise<{ success: boolean; error?: string }> => {
  const profileUpdates: Partial<{
    bio: string;
    basePrice: Price;
    githubUrl: string;
    linkedinUrl: string;
    iitmProfileUrl: string;
    cgpa: number;
    level: "foundation" | "diploma" | "bsc" | "bs";
  }> = {};

  // Process bio
  if (updates.bio !== undefined && updates.bio !== null) {
    profileUpdates.bio = updates.bio;
  }

  // Process basePrice with validation
  if (updates.basePrice !== undefined && updates.basePrice !== null) {
    if (updates.basePrice < 0) {
      return { success: false, error: "Base price cannot be negative" };
    }
    profileUpdates.basePrice = updates.basePrice;
  }

  // Process URLs (can be null/undefined to clear them)
  if (updates.githubUrl !== undefined) {
    profileUpdates.githubUrl = updates.githubUrl;
  }
  if (updates.linkedinUrl !== undefined) {
    profileUpdates.linkedinUrl = updates.linkedinUrl;
  }
  if (updates.iitmProfileUrl !== undefined) {
    profileUpdates.iitmProfileUrl = updates.iitmProfileUrl;
  }

  // Process cgpa with validation
  if (updates.cgpa !== undefined && updates.cgpa !== null) {
    if (updates.cgpa < 0 || updates.cgpa > 10) {
      return { success: false, error: "CGPA must be between 0 and 10" };
    }
    profileUpdates.cgpa = updates.cgpa;
  }

  // Process level
  if (updates.level !== undefined && updates.level !== null) {
    profileUpdates.level = updates.level;
  }

  // Apply updates if any
  if (Object.keys(profileUpdates).length > 0) {
    await instructorProfile.update(profileUpdates, { transaction });
  }

  return { success: true };
};

/**
 * Update instructor skills
 * Deletes existing skills and creates new ones with proper course mapping
 */
export const updateInstructorSkills = async (
  instructorProfileId: string,
  userId: string,
  skills: SkillPayload[],
  transaction: Transaction
): Promise<void> => {
  // Delete existing skills for this instructor
  await Skill.destroy({
    where: {
      instructorProfileId: instructorProfileId,
    },
    transaction,
  });

  // Create new skills if array is not empty
  if (skills.length > 0) {
    const courseIdPromises = skills.map((skill) => getCourseId(skill.name));

    const resolvedCourseIds = await Promise.all(courseIdPromises);
    const skillsToCreate = skills.map((skill, index) => {
      const courseId = resolvedCourseIds[index];

      if (!courseId) {
        throw new Error(
          `Failed to find a corresponding course for subject: ${skill.name}`
        );
      }

      return {
        name: skill.name,
        instructorProfileId: instructorProfileId,
        courseId: courseId,
        userId: userId,
      };
    });

    await Skill.bulkCreate(skillsToCreate, { transaction });
  }
};

/**
 * Update user languages
 * Deletes existing languages and creates new ones with proper language mapping
 */
export const updateUserLanguages = async (
  userId: string,
  languages: LanguagePayload[],
  transaction: Transaction
): Promise<void> => {
  // Delete existing languages for this user
  await UserLanguage.destroy({
    where: {
      userId: userId,
    },
    transaction,
  });

  // Create new languages if array is not empty
  if (languages.length > 0) {
    const languageIdPromises = languages.map((language) =>
      getLanguageId(language.language.name)
    );

    const resolvedLanguageIds = await Promise.all(languageIdPromises);
    const languagesToCreate = languages.map((language, index) => {
      const languageId = resolvedLanguageIds[index];

      if (!languageId) {
        throw new Error(
          `Failed to find a corresponding language for language: ${language.language.name}`
        );
      }

      return {
        userId: userId,
        languageId: languageId,
      };
    });

    await UserLanguage.bulkCreate(languagesToCreate, { transaction });
  }
};

/**
 * Update instructor availabilities with nested time slots
 * Deletes existing availabilities and time slots, then creates new ones
 */
export const updateInstructorAvailabilities = async (
  instructorProfileId: string,
  userId: string,
  availabilities: AvailabilityPayload[],
  transaction: Transaction
): Promise<void> => {
  // Delete existing availabilities and their time slots for this instructor
  const existingAvailabilities = await Availability.findAll({
    where: {
      instructorProfileId: instructorProfileId,
    },
    attributes: ["id"],
  });

  const availabilityIds = existingAvailabilities.map((av) => av.id);

  if (availabilityIds.length > 0) {
    // Delete time slots first (child records)
    await AvailabilityTimeSlot.destroy({
      where: {
        availabilityId: availabilityIds,
      },
      transaction,
    });

    // Then delete availabilities (parent records)
    await Availability.destroy({
      where: {
        instructorProfileId: instructorProfileId,
      },
      transaction,
    });
  }

  // Create new availabilities if array is not empty
  if (availabilities.length > 0) {
    // Fetch all days of the week to create a map
    const daysOfWeek = await DayOfWeek.findAll();
    const dayIdMap: { [key: string]: number } = {};
    daysOfWeek.forEach((day) => {
      dayIdMap[day.name] = day.id;
    });

    // Process each availability
    for (const availability of availabilities) {
      const dayOfWeekId =
        availability.dayOfWeek?.id || 
        (availability.dayOfWeek?.name ? dayIdMap[availability.dayOfWeek.name] : undefined);

      if (!dayOfWeekId) {
        console.warn(
          `Could not find a day of the week for: ${availability.dayOfWeek?.name}`
        );
        continue; // Skip invalid days
      }

      // Create the availability record
      const availabilityRecord = await Availability.create(
        {
          instructorProfileId: instructorProfileId,
          dayOfWeekId: dayOfWeekId,
          isAvailable: availability.isAvailable,
          userId: userId,
        },
        { transaction }
      );

      // If available and has time slots, create them
      if (
        availability.isAvailable &&
        availability.timeSlots &&
        availability.timeSlots.length > 0
      ) {
        const timeSlotsToCreate = availability.timeSlots.map((slot) => ({
          availabilityId: availabilityRecord.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        await AvailabilityTimeSlot.bulkCreate(timeSlotsToCreate, {
          transaction,
        });
      }
    }
  }
};
