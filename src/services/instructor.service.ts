import { Transaction } from "sequelize";
import Availability from "../models/availability.model";
import DayOfWeek from "../models/dayofWeek";
import InstructorProfiles from "../models/instructor.model";
import Language from "../models/language.model";
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
  transaction: Transaction,
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
  transaction: Transaction,
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
    if (updates.basePrice <= 0) {
      return { success: false, error: "Base price must be greater than zero" };
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
 * Update instructor skills with diffing
 * Performs targeted inserts, updates, and deletes instead of delete-then-create
 * Preserves data integrity and improves efficiency
 */
export const updateInstructorSkills = async (
  instructorProfileId: string,
  userId: string,
  newSkills: SkillPayload[],
  transaction: Transaction,
): Promise<void> => {
  // Retrieve existing skills
  const existingSkills = await Skill.findAll({
    where: { instructorProfileId },
  });

  // Create maps for efficient comparison
  const existingSkillMap = new Map(
    existingSkills.map((skill) => [skill.name, skill]),
  );
  const newSkillNames = new Set(newSkills.map((skill) => skill.name));

  // Determine skills to add, update, and remove
  const skillsToAdd: SkillPayload[] = [];
  const skillsToUpdate: Array<{ skill: Skill; payload: SkillPayload }> = [];
  const skillIdsToRemove: string[] = [];

  // Find skills to add and update
  for (const newSkill of newSkills) {
    const existingSkill = existingSkillMap.get(newSkill.name);

    if (existingSkill) {
      // Skill exists, prepare for update if needed
      skillsToUpdate.push({ skill: existingSkill, payload: newSkill });
    } else {
      // New skill to add
      skillsToAdd.push(newSkill);
    }
  }

  // Find skills to remove
  for (const existingSkill of existingSkills) {
    if (!newSkillNames.has(existingSkill.name)) {
      skillIdsToRemove.push(existingSkill.id);
    }
  }

  // Perform targeted database operations
  try {
    // Remove skills that are no longer needed
    if (skillIdsToRemove.length > 0) {
      await Skill.destroy({
        where: { id: skillIdsToRemove },
        transaction,
      });
    }

    // Add new skills with course mapping
    if (skillsToAdd.length > 0) {
      const courseIdPromises = skillsToAdd.map((skill) =>
        getCourseId(skill.name),
      );

      const resolvedCourseIds = await Promise.all(courseIdPromises);
      const skillsToCreatePayload = skillsToAdd.map((skill, index) => {
        const courseId = resolvedCourseIds[index];

        if (!courseId) {
          throw new Error(
            `Failed to find a corresponding course for subject: ${skill.name}`,
          );
        }

        return {
          name: skill.name,
          instructorProfileId: instructorProfileId,
          courseId: courseId,
          userId: userId,
        };
      });

      await Skill.bulkCreate(skillsToCreatePayload, { transaction });
    }

    // Update existing skills if needed (e.g., if course mapping changed)
    for (const { skill, payload } of skillsToUpdate) {
      const courseId = await getCourseId(payload.name);

      if (courseId && skill.courseId !== courseId) {
        await skill.update(
          {
            courseId: courseId,
            name: payload.name,
          },
          { transaction },
        );
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to update instructor skills: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Update user languages with diffing
 * Performs targeted inserts and deletes instead of delete-then-create
 */
export const updateUserLanguages = async (
  userId: string,
  newLanguages: LanguagePayload[],
  transaction: Transaction,
): Promise<void> => {
  // Retrieve existing languages
  const existingLanguages = await UserLanguage.findAll({
    where: { userId },
    include: [
      {
        association: "language",
        attributes: ["id", "name"],
      },
    ],
  });

  // Create maps for efficient comparison
  const existingLanguageMap = new Map(
    existingLanguages.map((ul) => [ul.language?.name || ul.languageId, ul.id]),
  );
  const newLanguageNames = new Set(newLanguages.map((l) => l.language.name));

  // Determine languages to add and remove
  const languagesToAdd: LanguagePayload[] = [];
  const languageIdsToRemove: string[] = [];

  // Find languages to add
  for (const newLanguage of newLanguages) {
    if (!existingLanguageMap.has(newLanguage.language.name)) {
      languagesToAdd.push(newLanguage);
    }
  }

  // Find languages to remove
  for (const existingLanguage of existingLanguages) {
    const languageName = existingLanguage.language?.name;
    if (languageName && !newLanguageNames.has(languageName)) {
      languageIdsToRemove.push(existingLanguage.id);
    }
  }

  // Perform targeted database operations
  try {
    // Remove languages that are no longer needed
    if (languageIdsToRemove.length > 0) {
      await UserLanguage.destroy({
        where: { id: languageIdsToRemove },
        transaction,
      });
    }

    // Add new languages with language mapping
    if (languagesToAdd.length > 0) {
      const languageIdPromises = languagesToAdd.map((language) =>
        getLanguageId(language.language.name),
      );

      const resolvedLanguageIds = await Promise.all(languageIdPromises);
      const languagesToCreatePayload = languagesToAdd.map((language, index) => {
        const languageId = resolvedLanguageIds[index];

        if (!languageId) {
          throw new Error(
            `Failed to find a corresponding language: ${language.language.name}`,
          );
        }

        return {
          userId: userId,
          languageId: languageId,
        };
      });

      await UserLanguage.bulkCreate(languagesToCreatePayload, { transaction });
    }
  } catch (error) {
    throw new Error(
      `Failed to update user languages: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Update instructor availabilities with diffing
 * Performs targeted inserts, updates, and deletes for availabilities and time slots
 */
export const updateInstructorAvailabilities = async (
  instructorProfileId: string,
  userId: string,
  newAvailabilities: AvailabilityPayload[],
  transaction: Transaction,
): Promise<void> => {
  // Retrieve existing availabilities with their time slots
  const existingAvailabilities = await Availability.findAll({
    where: { instructorProfileId },
    include: [{ model: AvailabilityTimeSlot, as: "timeSlots" }],
  });

  // Fetch all days of the week
  const daysOfWeek = await DayOfWeek.findAll();
  const dayIdMap: { [key: string]: number } = {};
  daysOfWeek.forEach((day) => {
    dayIdMap[day.name] = day.id;
  });

  // Create map for existing availabilities by day
  const existingAvailabilityMap = new Map(
    existingAvailabilities.map((av) => [av.dayOfWeekId, av]),
  );
  const newDayIds = new Set<number>();

  try {
    // Process each new availability
    for (const availability of newAvailabilities) {
      const dayOfWeekId =
        availability.dayOfWeek?.id ||
        (availability.dayOfWeek?.name
          ? dayIdMap[availability.dayOfWeek.name]
          : undefined);

      if (!dayOfWeekId) {
        console.warn(
          `Could not find a day of the week for: ${availability.dayOfWeek?.name}`,
        );
        throw new Error(
          `Invalid day of the week: ${availability.dayOfWeek?.name}`,
        );
      }

      newDayIds.add(dayOfWeekId);
      const existingAvailability = existingAvailabilityMap.get(dayOfWeekId);

      if (existingAvailability) {
        // Update existing availability
        await existingAvailability.update(
          {
            isAvailable: availability.isAvailable,
          },
          { transaction },
        );

        // Handle time slots update
        if (availability.isAvailable && availability.timeSlots) {
          // Delete old time slots for this availability
          await AvailabilityTimeSlot.destroy({
            where: { availabilityId: existingAvailability.id },
            transaction,
          });

          // Create new time slots
          if (availability.timeSlots.length > 0) {
            const timeSlotsToCreate = availability.timeSlots.map((slot) => ({
              availabilityId: existingAvailability.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }));

            await AvailabilityTimeSlot.bulkCreate(timeSlotsToCreate, {
              transaction,
            });
          }
        } else if (!availability.isAvailable) {
          // Remove time slots if no longer available
          await AvailabilityTimeSlot.destroy({
            where: { availabilityId: existingAvailability.id },
            transaction,
          });
        }
      } else {
        // Create new availability
        const availabilityRecord = await Availability.create(
          {
            instructorProfileId: instructorProfileId,
            dayOfWeekId: dayOfWeekId,
            isAvailable: availability.isAvailable,
            userId: userId,
          },
          { transaction },
        );

        // Create time slots if available
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

    // Remove availabilities for days not in new list
    for (const existingAvailability of existingAvailabilities) {
      if (!newDayIds.has(existingAvailability.dayOfWeekId)) {
        // Delete time slots first
        await AvailabilityTimeSlot.destroy({
          where: { availabilityId: existingAvailability.id },
          transaction,
        });

        // Then delete availability
        await existingAvailability.destroy({ transaction });
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to update instructor availabilities: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/*
 * Helper to get instructor skills
 */
export const getInstructorSkills = async (instructorProfileId: string) => {
  // Logic to get instructor skills
  const instructorProfile = await InstructorProfiles.findByPk(
    instructorProfileId,
    {
      include: [
        {
          model: Skill,
          as: "skills",
          attributes: ["name", "courseId"],
        },
      ],
    },
  );

  if (!instructorProfile) {
    console.log("returned null");
    return null;
  }

  return instructorProfile.skills?.map((skill) => skill.name) ?? [];
};

/*
 * Helper to get instructor languages
 */
export const getInstructorLanguages = async (instructorProfileId: string) => {
  // Logic to get instructor languages

  const instructorProfile =
    await InstructorProfiles.findByPk(instructorProfileId);

  if (!instructorProfile) {
    console.log("returned null");
    return null;
  }
  const userLanguages = await UserLanguage.findAll({
    where: { userId: instructorProfile.instructorId },
    include: [
      {
        model: Language,
        as: "language",
        attributes: ["name"],
      },
    ],
  });

  return userLanguages.map((ul) => ul.language?.name || "");
};

/*
 * Helper to get instructor availabilites
 */
export const getInstructorAvailabilites = async (
  instructorProfileId: string,
) => {
  try {
    // Fetch all availabilities for the instructor with their time slots
    const availabilities = await Availability.findAll({
      where: { instructorProfileId },
      include: [
        {
          model: DayOfWeek,
          as: "dayOfWeek",
          attributes: ["id", "name"],
        },
        {
          model: AvailabilityTimeSlot,
          as: "timeSlots",
          attributes: ["startTime", "endTime"],
        },
      ],
    });

    if (!availabilities || availabilities.length === 0) {
      return {};
    }

    // Format the data into the desired structure
    const formattedAvailability: {
      [key: string]: string[];
    } = {};

    availabilities.forEach((availability) => {
      const dayName = availability.dayOfWeek?.name || "";

      if (
        availability.isAvailable &&
        availability.timeSlots &&
        availability.timeSlots.length > 0
      ) {
        // Format time slots as "HH:MM - HH:MM"
        const timeSlots = availability.timeSlots.map((slot) => {
          const startTime = slot.startTime;
          const endTime = slot.endTime;
          return `${startTime} - ${endTime}`;
        });
        formattedAvailability[dayName] = timeSlots;
      } else {
        // If not available or no time slots, return empty array
        formattedAvailability[dayName] = [];
      }
    });

    return formattedAvailability;
  } catch (error) {
    console.error("Error fetching instructor availabilities:", error);
    throw new Error(
      `Failed to fetch instructor availabilities: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
