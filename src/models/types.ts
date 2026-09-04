import { CourseName } from "../types/course";
import { CourseStatus, Term } from "../types/enrollment";
import { LevelName } from "../types/level";

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
  googleId?: string;
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
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  levelId: string;
  prerequisites?: CourseName[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MilestoneTask {
  id: string;
  title: string;
  details?: string[];
  subtasks?: string[];
}

export interface MilestoneResource {
  title: string;
  url?: string;
  type?: string;
}

export interface MilestoneAttributes {
  id: string;
  projectId: string;
  milestoneNumber: number;
  title: string;
  description: string;
  expectedTime: string;
  completionProgress: number;
  tasks: MilestoneTask[];
  deliverables?: string[];
  resources?: MilestoneResource[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectAttributes {
  id: string;
  name: string;
  title: string;
  code: string;
  course: CourseName;
  description: string;
  version: string;
  level: LevelName;
  term?: Term;
  year?: number;
  credits: number;
  estimatedDuration?: string;
  isFeatured?: boolean;
  milestones?: MilestoneAttributes[];
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
  is_featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatAttributes {
  id: string;
  botId: string;
  botName: string;
  userId: string;
  title?: string;
  isDeleted?: boolean;
  lastInteractionTime?: Date;
}

export interface ChatMessagesAttributes {
  id: string;
  botId: string;
  chatId: string;
  content: string;
  sources?: object[] | null;
  sender: "bot" | "user";
  rating: number;
  userId: string;
  username: string;
  isDeleted?: boolean;
}

export interface KnowledgeBaseAttributes {
  id: string;
  content: string;
  embedding: number[];
  courseId: string;
  source: string;
  weekNumber?: number | null;
}

export interface SessionAttributes {
  id: string;
  studentId: string;
  instructorId: string;
  title: string;
  description: string | undefined | null;
  start_time: string;
  duration_minutes: string;
  end_time: string;
  stream_call_id: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

// Defining a custom
