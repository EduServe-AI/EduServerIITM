import { Request, Response } from "express";
import Responder from "../utils/responder";
import { findUserById } from "../services/user.service";
import User from "../models/user.model";
import { sequelize } from "../config/db.config";
import InstructorProfiles from "../models/instructor.model";
import { OnboardingSchemaType } from "../utils/validator";
import { getCourseId } from "../services/course.service";
import { getLanguageId } from "../services/language.service";
import Skill from "../models/skill.model";
import UserLanguage from "../models/userLanguage.model";
import Availability from "../models/availability.model";
import { getDayIndex } from "../services/day.service";
import DayOfWeek from "../models/dayofWeek";
import AvailabilityTimeSlot from "../models/timeSlot.model";

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
