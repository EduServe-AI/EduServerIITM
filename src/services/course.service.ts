import Course from "../models/course.model";

export const getCourseId = async (courseName: string) => {
  const course = await Course.findOne({ where: { name: courseName } });

  return course?.id;
};
