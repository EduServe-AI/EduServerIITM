export interface UserAttributes {
  id: string;
  username: string | null;
  email: string;
  password: string | null;
  role: "student" | "instructor";
  level?: "foundation" | "diploma" | "bsc" | "bs";
  onboarded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  verified: boolean;
}

export interface LevelAttributes {
  id: string;
  name: "foundation" | "diploma" | "bsc" | "bs";
  totalCourses: number;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}
