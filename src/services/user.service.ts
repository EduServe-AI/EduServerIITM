import User from "../models/user.model";
import bcrypt from "bcryptjs";
import Responder from "../utils/responder";
import { Request, Response } from "express";

export const findStudentByEmail = async (email: string) => {
  return await User.unscoped().findOne({ where: { email, role: "student" } });
};

export const findInstructorByEmail = async (email: string) => {
  return await User.unscoped().findOne({
    where: { email, role: "instructor" },
  });
};

export const findUserById = async (userId: string) => {
  return await User.findByPk(userId);
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

export const getUserOrFail = async (req: Request, res: Response) => {
  const user = await findUserById(req.userId!);
  if (!user) {
    Responder(res, {
      message: "User not found",
      httpCode: 404,
    });
    return null;
  }
  return user;
};
