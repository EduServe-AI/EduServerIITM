import User from "./user.model";
import Level from "./level.model";
import Course from "./course.model";
import Enrollment from "./enrollment.model";

export const syncModels = async () => {
  await User.sync({ alter: true });
  await Level.sync({ alter: true });
  await Course.sync({ alter: true });
  await Enrollment.sync({ alter: true });
};
