export type LevelName = "Foundation" | "Diploma" | "Bsc" | "Bs";

export type Level = {
  name: LevelName;
  totalCourses: number;
  credits: number;
};
