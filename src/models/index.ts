import Availability from "./availability.model";
import Bots from "./bot.model";
import Chats from "./chat.model";
import ChatMessages from "./chatMessage.model";
import Course from "./course.model";
import DayOfWeek from "./dayofWeek";
import DocumentLink from "./documentLink.model";
import Enrollment from "./enrollment.model";
import InstructorProfiles from "./instructor.model";
import Language from "./language.model";
import Level from "./level.model";
import Skill from "./skill.model";
import AvailabilityTimeSlot from "./timeSlot.model";
import User from "./user.model";
import UserLanguage from "./userLanguage.model";
// import KnowledgeBase from "./knowledgeBase.model";
import { initializeKnowledgeBase } from "../services/knowledgeBase.service";
import Session from "./session.model";

export const syncModels = async () => {
  // Only use alter: true in development to avoid table locking and performance issues in production
  const syncOptions = process.env.NODE_ENV === "development" ? { alter: true } : {};
  
  console.log(`Syncing models with options: ${JSON.stringify(syncOptions)}`);

  await User.sync(syncOptions);
  await Level.sync(syncOptions);
  await Course.sync(syncOptions);
  await Enrollment.sync(syncOptions);
  await InstructorProfiles.sync(syncOptions);
  await Skill.sync(syncOptions);
  await Language.sync(syncOptions);
  await UserLanguage.sync(syncOptions);
  await DayOfWeek.sync(syncOptions);
  await Availability.sync(syncOptions);
  await AvailabilityTimeSlot.sync(syncOptions);
  await Bots.sync(syncOptions);
  await Chats.sync(syncOptions);
  await ChatMessages.sync(syncOptions);
  // await KnowledgeBase.sync(syncOptions);
  await Session.sync(syncOptions);
  await DocumentLink.sync(syncOptions);

  await initializeKnowledgeBase();
};
