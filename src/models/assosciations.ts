import Availability from "./availability.model";
import Bots from "./bot.model";
import Chats from "./chat.model";
import ChatMessages from "./chatMessage.model";
import Course from "./course.model";
import DayOfWeek from "./dayofWeek";
import Enrollment from "./enrollment.model";
import InstructorProfiles from "./instructor.model";
import Language from "./language.model";
import Level from "./level.model";
import Session from "./session.model";
import Skill from "./skill.model";
import AvailabilityTimeSlot from "./timeSlot.model";
import User from "./user.model";
import UserLanguage from "./userLanguage.model";

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

  //------------------------- Relationship between User and Instructor profile ---------------
  User.hasOne(InstructorProfiles, {
    foreignKey: "instructorId",
    as: "instructorProfile",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  InstructorProfiles.belongsTo(User, {
    foreignKey: "instructorId",
    as: "user",
  });

  // one instructor can have many skills
  InstructorProfiles.hasMany(Skill, {
    foreignKey: "instructorProfileId",
    as: "skills",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Skill.belongsTo(InstructorProfiles, {
    foreignKey: "instructorProfileId",
    as: "instructorProfile",
  });

  // -------------------- Relationship between User and SKills Table for instructors --------

  User.hasMany(Skill, {
    foreignKey: "userId",
    as: "skills",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Skill.belongsTo(User, {
    foreignKey: "userId",
    as: "instructor",
  });

  // Add new association for Availability
  // InstructorProfiles.hasMany(Availability, {
  //   foreignKey: "instructorProfileId",
  //   as: "availabilities",
  //   onDelete: "CASCADE",
  //   onUpdate: "CASCADE",
  // });

  // Availability.belongsTo(InstructorProfiles, {
  //   foreignKey: "instructorProfileId",
  //   as: "instructorProfile",
  // });

  // Adding new association for courseId

  // A Course has and belongs to many InstructorProfiles (through the Skill table)
  Course.belongsToMany(InstructorProfiles, {
    through: Skill,
    foreignKey: "courseId", // This is the foreign key in the Skill table that points to Course
    otherKey: "instructorProfileId", // This is the other foreign key in the Skill table
    as: "instructors", // This will allow you to use course.getInstructors() and include: 'instructors'
  });

  // An InstructorProfile has and belongs to many Courses (through the Skill table)
  InstructorProfiles.belongsToMany(Course, {
    through: Skill,
    foreignKey: "instructorProfileId", // This is the foreign key in the Skill table that points to InstructorProfiles
    otherKey: "courseId", // This is the other foreign key
    as: "courses", // This will allow you to use instructorProfile.getCourses()
  });

  // Many to Many relationships Among Users , Languages and UserLanguages

  // A User has many entries in the UserLanguage table
  User.hasMany(UserLanguage, {
    foreignKey: "userId",
    as: "userLanguages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  UserLanguage.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // A Language has many entries in the UserLanguage table
  Language.hasMany(UserLanguage, {
    foreignKey: "languageId",
    as: "languageUsers",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  UserLanguage.belongsTo(Language, {
    foreignKey: "languageId",
    as: "language",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // --------------- Relationships for Availability -------------

  // An InstructorProfile can have multiple availability records (one for each day they work)
  InstructorProfiles.hasMany(Availability, {
    foreignKey: "instructorProfileId",
    as: "availabilities",
    onDelete: "CASCADE",
  });

  Availability.belongsTo(InstructorProfiles, {
    foreignKey: "instructorProfileId",
    as: "instructorProfile",
  });

  // A user/instructor can have multiple availability records ( onre for each day they work )
  User.hasMany(Availability, {
    foreignKey: "userId",
    as: "useravailabilities",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Availability.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // A DayOfWeek can be associated with many availability records
  DayOfWeek.hasMany(Availability, {
    foreignKey: "dayOfWeekId",
    as: "availabilityRecords",
  });

  Availability.belongsTo(DayOfWeek, {
    foreignKey: "dayOfWeekId",
    as: "dayOfWeek",
  });

  // An Availability record (an instructor on a specific day) can have multiple time slots
  Availability.hasMany(AvailabilityTimeSlot, {
    foreignKey: "availabilityId",
    as: "timeSlots",
    onDelete: "CASCADE",
  });

  AvailabilityTimeSlot.belongsTo(Availability, {
    foreignKey: "availabilityId",
    as: "availability",
  });

  // ----------------------- Relationships between course and chatbots -----------------
  Course.hasMany(Bots, {
    foreignKey: "courseId",
    as: "bots",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Bots.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
  });

  // ------------------- Relationship between Chatbots and chats --------------------
  Bots.hasMany(Chats, {
    foreignKey: "botId",
    as: "chats",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Chats.belongsTo(Bots, {
    foreignKey: "botId",
    as: "bot",
  });

  // ------------------- Relationship between User and Chats --------------------
  User.hasMany(Chats, {
    foreignKey: "userId",
    as: "chats",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Chats.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // ------------------- Relationship between Chats and ChatsMessages ------------
  Chats.hasMany(ChatMessages, {
    foreignKey: "chatId",
    as: "messages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  ChatMessages.belongsTo(Chats, {
    foreignKey: "chatId",
    as: "chat",
  });

  // ------------------ Relationship between Bots and ChatMessages ------------
  Bots.hasMany(ChatMessages, {
    foreignKey: "botId",
    as: "allmessages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  ChatMessages.belongsTo(Bots, {
    foreignKey: "botId",
    as: "bot",
  });

  // ----------------- Relationship between User and ChatMessages --------------
  User.hasMany(ChatMessages, {
    foreignKey: "userId",
    as: "allmessages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  ChatMessages.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(Session, {
    foreignKey: "host_id",
    as: "hostedSessions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  User.hasMany(Session, {
    foreignKey: "guest_id",
    as: "guestSessions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Session.belongsTo(User, { foreignKey: "host_id", as: "host" });
  Session.belongsTo(User, { foreignKey: "guest_id", as: "guest" });

  console.log("Associations set up successfully!");
};

export { Course, Enrollment, Level, User };
