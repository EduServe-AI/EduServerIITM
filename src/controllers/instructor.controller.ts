import { Request, Response } from "express";
import sequelize from "../config/db.config";
import User from "../models/user.model";
import { findUserById } from "../services/user.service";
import Responder from "../utils/responder";

import Availability from "../models/availability.model";
import DayOfWeek from "../models/dayofWeek";
import InstructorProfiles from "../models/instructor.model";
import Language from "../models/language.model";
import Skill from "../models/skill.model";
import AvailabilityTimeSlot from "../models/timeSlot.model";
import UserLanguage from "../models/userLanguage.model";
import { getCourseId } from "../services/course.service";
import {
  updateInstructorAvailabilities,
  updateInstructorProfileFields,
  updateInstructorSkills,
  updateUserFields,
  updateUserLanguages,
} from "../services/instructor.service";
import { getLanguageId } from "../services/language.service";
import { OnboardingSchemaType } from "../utils/validator";

export const instructorOnboardController = async (
  req: Request,
  res: Response
) => {
  let transaction;

  try {
    const instructor = await findUserById(req.userId!);
    if (!instructor) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    if (instructor.onboarded) {
      return Responder(res, {
        message: "Instructor is already onboarded",
        httpCode: 400,
      });
    }
    // getting the updates from the req
    const {
      iitmProfileUrl,
      cgpa,
      level,
      subjects,
      languages,
      bio,
      githubUrl,
      linkedinUrl,
      availability,
    } = req.body as OnboardingSchemaType;

    transaction = await sequelize.transaction();

    // creating instructor profile
    const instructorProfile = await InstructorProfiles.create(
      {
        instructorId: instructor.id,
        iitmProfileUrl,
        cgpa,
        level,
        bio,
        githubUrl,
        linkedinUrl,
        basePrice: 100,
      },
      { transaction }
    );

    // creating records in skills table  - instructor subject expertises
    const courseIdPromises = subjects.map((subject) => getCourseId(subject));

    const resolvedCourseIds = await Promise.all(courseIdPromises);
    const skillsToCreate = subjects.map((subject, index) => {
      const courseId = resolvedCourseIds[index];

      // Important: Handle cases where a course might not be found
      if (!courseId) {
        // You can choose to either throw an error or simply skip this skill
        throw new Error(
          `Failed to find a corresponding course for subject: ${subject}`
        );
      }

      return {
        name: subject,
        instructorProfileId: instructorProfile.id,
        courseId: courseId,
        userId: req.userId!,
      };
    });

    await Skill.bulkCreate(skillsToCreate, {
      transaction,
    });

    // creating records in languages table - user languages
    const languageIdPromises = languages.map((language) =>
      getLanguageId(language)
    );

    const resolvedLanguageIds = await Promise.all(languageIdPromises);
    const languagesToCreate = languages.map((language, index) => {
      const languageId = resolvedLanguageIds[index];

      // Important: Handle cases where a language might not be found
      if (!languageId) {
        // You can choose to either throw an error or simply skip this skill
        throw new Error(
          `Failed to find a corresponding language for language: ${language}`
        );
      }

      return {
        userId: instructor.id,
        languageId: languageId,
      };
    });

    await UserLanguage.bulkCreate(languagesToCreate, { transaction });

    // Need to create availability
    // 1. For efficiency, fetch all DayOfWeek records once to create a map
    // of day names to their database IDs. This avoids querying inside a loop.
    const daysOfWeek = await DayOfWeek.findAll();

    // creating a map object that maps each day with its dayIndex - - {Monday : 1}
    const dayIndexMap: { [key: string]: number } = {};
    daysOfWeek.forEach((day) => {
      dayIndexMap[day.name] = day.id;
    });

    //2 .  Looping through the availability data
    for (const [dayName, dayData] of Object.entries(availability)) {
      // retreiving the dayId
      const dayOfWeekId = dayIndexMap[dayName];
      if (!dayOfWeekId) {
        console.warn(`Could not find a day of the week for: ${dayName}`);
        continue; // Skip if the day name is invalid
      }

      //3. Creating the record in availability table for the instructor and the specific day.
      // This links an instructor to a day in the dayOfWeek Table and stores if they are generally available
      const availabilityRecord = await Availability.create(
        {
          instructorProfileId: instructorProfile.id,
          dayOfWeekId: dayOfWeekId,
          isAvailable: dayData.isEnabled,
          userId: req.userId!,
        },
        { transaction }
      );

      //4. If the day is enabled and has timeslots , we create child records in the timeslots table.
      if (dayData.isEnabled && dayData.slots.length > 0) {
        const timeSlotsToCreate = dayData.slots.map((slot) => ({
          availabilityId: availabilityRecord.id,
          startTime: slot.from,
          endTime: slot.to,
        }));

        //5. Bulk creating all time slots for that specific day
        await AvailabilityTimeSlot.bulkCreate(timeSlotsToCreate, {
          transaction,
        });
      }
    }

    // Need to mark the instructor as onboarded
    instructor.onboarded = true;
    instructor.level = level;
    await instructor.save({ transaction });

    await transaction.commit();

    return Responder(res, {
      message: "Instructor Onboarded successfully",
      httpCode: 200,
      data: {
        instructor,
        instructorProfile,
      },
    });
  } catch (error) {
    // Rollbacking the transaction
    if (transaction) await transaction.rollback();

    console.error(error);
    return Responder(res, {
      error: error,
      message: "InternaL Server Error",
      httpCode: 500,
    });
  }
};

export const featuredInstructorController = async (
  req: Request,
  res: Response
) => {
  try {
    const featuredInstructors = await InstructorProfiles.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
        {
          model: Skill,
          as: "skills",
          attributes: ["name"],
        },
      ],
      attributes: ["level", "bio", "basePrice", "id", "instructorId"],
    });

    return Responder(res, {
      message: "Featured Instructors retreived Successfully",
      httpCode: 200,
      data: {
        featuredInstructors,
      },
    });
  } catch (error) {
    console.error(error);
    return Responder(res, {
      error: error,
      message: "InternaL Server Error",
      httpCode: 500,
    });
  }
};

export const getInstructorDataController = async (
  req: Request,
  res: Response
) => {
  try {
    const instructor = await User.findByPk(req.userId, {
      include: [
        {
          model: InstructorProfiles,
          attributes: [
            "iitmProfileUrl",
            "cgpa",
            "level",
            "bio",
            "githubUrl",
            "linkedinUrl",
            "basePrice",
          ],
          as: "instructorProfile",
          include: [
            {
              model: Skill,
              as: "skills",
            },
            {
              model: Availability,
              as: "availabilities",
              include: [
                {
                  model: DayOfWeek,
                  as: "dayOfWeek",
                  attributes: ["id", "name"],
                },
                {
                  model: AvailabilityTimeSlot,
                  as: "timeSlots",
                  attributes: ["id", "startTime", "endTime"],
                },
              ],
            },
          ],
        },
        {
          model: UserLanguage,
          as: "userLanguages",
          include: [
            {
              model: Language,
              as: "language",
            }
          ],
        }
      ],
    });

    return Responder(res, {
      message: "Instructor Data Fetched sucessfully",
      data: {
        instructor: instructor,
      },
      httpCode: 200,
    });
  } catch (error) {
    console.error(error);
    return Responder(res, {
      error: error,
      message: "InternaL Server Error",
      httpCode: 500,
    });
  }
};


export const updateInstructorDataController = async (
  req: Request,
  res: Response
) => {
  let transaction;

  try {
    const instructor = await User.findByPk(req.userId, {
      include: [
        {
          model: InstructorProfiles,
          as: "instructorProfile",
        },
      ],
    });

    if (!instructor) {
      return Responder(res, {
        message: "User not found",
        httpCode: 404,
      });
    }

    if (!instructor.instructorProfile) {
      return Responder(res, {
        message: "Instructor profile not found. Please complete onboarding first.",
        httpCode: 404,
      });
    }

    // Extract all possible fields from request body
    const {
      username,
      email,
      level,
      bio,
      basePrice,
      githubUrl,
      linkedinUrl,
      iitmProfileUrl,
      cgpa,
      skills,
      languages,
      availabilities,
    } = req.body;

    // Start transaction for atomic updates
    transaction = await sequelize.transaction();

    // 1. Update User fields if provided
    if (username !== undefined || email !== undefined || level !== undefined) {
      const userUpdateResult = await updateUserFields(
        instructor,
        { username, email, level },
        transaction
      );

      if (!userUpdateResult.success) {
        await transaction.rollback();
        return Responder(res, {
          message: userUpdateResult.error || "Failed to update user fields",
          httpCode: 400,
        });
      }
    }

    // 2. Update InstructorProfile fields if provided
    if (
      bio !== undefined ||
      basePrice !== undefined ||
      githubUrl !== undefined ||
      linkedinUrl !== undefined ||
      iitmProfileUrl !== undefined ||
      cgpa !== undefined ||
      (level !== undefined && instructor.instructorProfile)
    ) {
      const profileUpdateResult = await updateInstructorProfileFields(
        instructor.instructorProfile,
        { bio, basePrice, githubUrl, linkedinUrl, iitmProfileUrl, cgpa, level },
        transaction
      );

      if (!profileUpdateResult.success) {
        await transaction.rollback();
        return Responder(res, {
          message:
            profileUpdateResult.error || "Failed to update instructor profile",
          httpCode: 400,
        });
      }
    }

    // 3. Update Skills if provided
    if (skills !== undefined && Array.isArray(skills)) {
      await updateInstructorSkills(
        instructor.instructorProfile.id,
        req.userId!,
        skills,
        transaction
      );
    }

    // 4. Update Languages if provided
    if (languages !== undefined && Array.isArray(languages)) {
      await updateUserLanguages(instructor.id, languages, transaction);
    }

    // 5. Update Availabilities if provided
    if (availabilities !== undefined && Array.isArray(availabilities)) {
      await updateInstructorAvailabilities(
        instructor.instructorProfile.id,
        req.userId!,
        availabilities,
        transaction
      );
    }

    // Commit transaction
    await transaction.commit();

    // Fetch updated instructor data with all associations
    const updatedInstructor = await User.findByPk(req.userId, {
      include: [
        {
          model: InstructorProfiles,
          as: "instructorProfile",
          include: [
            {
              model: Skill,
              as: "skills",
            },
            {
              model: Availability,
              as: "availabilities",
              include: [
                {
                  model: DayOfWeek,
                  as: "dayOfWeek",
                  attributes: ["id", "name"],
                },
                {
                  model: AvailabilityTimeSlot,
                  as: "timeSlots",
                  attributes: ["id", "startTime", "endTime"],
                },
              ],
            },
          ],
        },
        {
          model: UserLanguage,
          as: "userLanguages",
          include: [
            {
              model: Language,
              as: "language",
            },
          ],
        },
      ],
    });

    return Responder(res, {
      message: "Instructor profile updated successfully",
      httpCode: 200,
      data: {
        instructor: updatedInstructor,
      },
    });
  } catch (error) {
    // Rollback transaction on error
    if (transaction) await transaction.rollback();

    console.error("Error updating instructor data:", error);
    return Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};

