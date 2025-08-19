import User from "./user.model";
import Level from "./level.model";
import Course from "./course.model";
import Enrollment from "./enrollment.model";

// setup associations
export const setUpAssociations = () => {
  console.log("Setting up associations...");

  // one level has many courses
  Level.hasMany(Course, {
    foreignKey: "levelId",
    as: "courses", // This allows us to use level.courses
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // one course belongs to one level
  Course.belongsTo(Level, {
    foreignKey: "levelId",
    as: "levelInfo", // This allows to use course.level
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // one user can enroll in many courses
  User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: "userId",
    otherKey: "courseId",
    as: "courses", // This allows us to use user.courses
  });

  // one course has many users
  Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: "courseId",
    otherKey: "userId",
    as: "users",
  });

  // Direct associations with Enrollment for more detailed queries
  User.hasMany(Enrollment, {
    foreignKey: "userId",
    as: "enrollments",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Enrollment.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Course.hasMany(Enrollment, {
    foreignKey: "courseId",
    as: "enrollments",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Enrollment.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  console.log("Associations set up successfully!");
};

export { User, Level, Course, Enrollment };
