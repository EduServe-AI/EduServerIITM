import Course from "../models/course.model";
import Level from "../models/level.model";
import { COURSES_DATA } from "../constants/courses.constants";

export const populateCoursesIfEmpty = async () => {
  try {
    const existingCoursesCount = await Course.count();

    if (existingCoursesCount === 0) {
      console.log(
        "Courses table is empty ! Populating it with initial data ..."
      );

      // First we retreive all the levels to map level names to IDs
      const levels = await Level.findAll();
      const levelMap = new Map();

      levels.forEach((level) => {
        levelMap.set(level.name, level.id);
      });

      // Now preparing the course data with the levelid
      const courses = COURSES_DATA.map((courseData) => ({
        ...courseData,
        levelId: levelMap.get(courseData.level),
      }));

      // Validate that all levels exist
      const missingLevels = courses.filter((course) => !course.levelId);
      if (missingLevels.length > 0) {
        throw new Error(
          `Missing levels for courses: ${missingLevels.map((c) => c.name).join(", ")}`
        );
      }

      // Now we create the courses
      const createdCourses = await Course.bulkCreate(courses, {
        ignoreDuplicates: true,
        returning: true,
      });

      console.log(`✅ Successfully populated ${createdCourses.length} courses`);

      return createdCourses;
    } else {
      console.log(
        `ℹ️  Courses table already has ${existingCoursesCount} record skipping population`
      );
      return await Course.findAll();
    }
  } catch (error) {
    console.error("❌ Error populating levels:", error);
    throw error;
  }
};

export const forcePopulateCourses = async () => {
  try {
    await Course.sync();

    // Clearing existing data (we should be careful with this in production!)
    await Course.destroy({ where: {} });

    return await populateCoursesIfEmpty();
  } catch (error) {
    console.error("❌ Error force populating courses:", error);
    throw error;
  }
};
