import User from "../models/user.model";
import bcrypt from "bcryptjs";

export const findStudentByEmail = async (email: string) => {
  return await User.unscoped().findOne({ where: { email, role: "student" } });
};

export const findInstructorByEmail = async (email: string) => {
  return await User.unscoped().findOne({
    where: { email, role: "instructor" },
  });
};

export const createStudent = async (
  username: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "student",
    onboarded: false,
    verified: false,
  });

  return student;
};

export const createInstructor = async (
  username: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const instructor = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "instructor",
    onboarded: false,
    verified: false,
  });

  return instructor;
};

export const checkPassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);

  return isMatch;
};
