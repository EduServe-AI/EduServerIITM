import { COURSES_DATA } from "../constants/courses.constants";
import Bots from "../models/bot.model";
import Course from "../models/course.model";

export const populateBotsIfEmpty = async () => {
  try {
    const existingBotsCount = await Bots.count();

    if (existingBotsCount === 0) {
      // First we retreive all the courses to map course names to IDs
      const courses = await Course.findAll();
      const courseMap = new Map();

      courses.forEach((course) => {
        courseMap.set(course.name, course.id);
      });

      // Now preparing the bots data with the courseid
      const bots = COURSES_DATA.map((courseData) => ({
        name: courseData.name,
        description: courseData.description,
        courseId: courseMap.get(courseData.name),
        level: courseData.level,
      }));

      // Validate that all levels exist
      const missingCourses = bots.filter((bot) => !bot.courseId);
      if (missingCourses.length > 0) {
        throw new Error(
          `Missing levels for courses: ${missingCourses.map((c) => c.name).join(", ")}`
        );
      }

      // Now we create the bots
      const createdBots = await Bots.bulkCreate(bots, {
        ignoreDuplicates: true,
        returning: true,
      });

      console.log(`✅ Successfully populated ${createdBots.length} bots`);

      return createdBots;
    } else {
      console.log(
        `ℹ️  Bots table already has ${existingBotsCount} record skipping population`
      );
      return await Bots.findAll();
    }
  } catch (error) {
    console.error("❌ Error populating levels:", error);
    throw error;
  }
};
