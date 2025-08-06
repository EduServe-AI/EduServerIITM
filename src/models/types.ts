export interface UserAttributes {
  id: string;
  username: string | null;
  email: string;
  password: string | null;
  role: "student" | "instructor";
  onboarded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  verified: boolean;
}

export interface LevelAttributes {
  id: string;
  name: "Foundation" | "Diploma" | "Bsc" | "Bs";
  totalCourses: number;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}
