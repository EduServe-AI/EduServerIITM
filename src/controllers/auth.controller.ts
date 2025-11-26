import { Request, Response } from "express";
import {
  checkPassword,
  createInstructor,
  createStudent,
  findInstructorByEmail,
  findStudentByEmail,
} from "../services/user.service";
import { generateToken, verifyToken } from "../utils/jwt";
import Responder from "../utils/responder";

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // checking for student existence
    const existingStudent = await findStudentByEmail(email);
    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Student with this Email already exists" });
    }

    const newStudent = await createStudent(username, email, password);

    const { accessToken, refreshToken } = generateToken(
      newStudent.id,
      newStudent.role
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return Responder(res, {
      message: "Student registered successfully",
      data: {
        user: newStudent,
        accessToken,
      },
      httpCode: 200,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};

export const registerInstructor = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // checking for instructor existence
    const existingInstructor = await findInstructorByEmail(email);
    if (existingInstructor) {
      return res
        .status(400)
        .json({ message: "Instructor with this Email already exists" });
    }

    const newInstructor = await createInstructor(username, email, password);

    const { accessToken, refreshToken } = generateToken(
      newInstructor.id,
      newInstructor.role
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return Responder(res, {
      message: "Instructor registered successfully",
      data: {
        instructor: newInstructor,
        accessToken,
      },
      httpCode: 200,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  try {
    if (!req.cookies) {
      return Responder(res, {
        message: "No cookies provided",
        httpCode: 401,
      });
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return Responder(res, {
        message: "No refresh token provided",
        httpCode: 401,
      });
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken, "refresh") as any;

    if (
      !decoded ||
      decoded.type !== "refresh" ||
      !decoded.userId ||
      !decoded.role
    ) {
      return Responder(res, {
        message: "Invalid refresh token",
        httpCode: 401,
      });
    }

    // Generating new access token
    const { accessToken } = generateToken(decoded.userId, decoded.role);

    return Responder(res, {
      message: "Access token refreshed successfully",
      data: { accessToken },
      httpCode: 200,
    });
  } catch (error: any) {
    console.error("Refresh Token Error: ", error);
    return Responder(res, {
      error: error,
      message: "Refresh Token Error",
      httpCode: 500,
    });
  }
};

export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // checking for student existence
    const student = await findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // checking for password hash
    const isMatch = await checkPassword(password, student.password!);

    // validating
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generating tokens
    const { accessToken, refreshToken } = generateToken(
      student.id,
      student.role
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return Responder(res, {
      message: "Student logged-in successfully",
      data: {
        student: student,
        accessToken,
      },
      httpCode: 200,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};

export const loginInstructor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // checking for instructor existence
    const instructor = await findInstructorByEmail(email);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // checking for password hash
    const isMatch = await checkPassword(password, instructor.password!);

    // validating
    if (!isMatch) {
      return Responder(res, {
        error: "Invalid credentials",
        httpCode: 401,
      });
    }

    // Generating tokens
    const { accessToken, refreshToken } = generateToken(
      instructor.id,
      instructor.role
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return Responder(res, {
      message: "Instructor logged-in successfully",
      data: {
        instructor: instructor,
        accessToken,
      },
      httpCode: 200,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};

export const logOutController = async (req: Request, res: Response) => {
  try {
    // clearing the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return Responder(res, {
      message: "Logged out successfully",
      httpCode: 200,
    });
  } catch (error) {
    console.error("Logout error:", error);
    Responder(res, {
      error: error,
      message: "Internal Server Error",
      httpCode: 500,
    });
  }
};
