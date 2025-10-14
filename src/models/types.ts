import { CourseName } from "../types/course";
import { LevelName } from "../types/level";
import { Term, CourseStatus } from "../types/enrollment";

export interface UserAttributes {
  id: string;
  username: string | null;
  email: string;
  password: string | null;
  role: "admin" | "student" | "instructor";
  level?: LevelName;
  onboarded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  verified: boolean;
  profileUrl?: string;
}

export interface LevelAttributes {
  id: string;
  name: LevelName;
  totalCourses: number;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseAttributes {
  id: string;
  name: CourseName;
  description: string;
  credits: number;
  level: LevelName;
  levelId: string;
  prerequisites?: CourseName[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrollmentAttributes {
  id: string;
  userId: string;
  courseId: string;
  term: Term;
  year: number;
  status: CourseStatus;
  grade?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BotAttributes {
  id: string;
  name: string;
  description: string;
  courseId: string;
  numInteractions?: number;
  level: LevelName;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
