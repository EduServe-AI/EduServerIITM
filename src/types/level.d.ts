export type LevelName = "foundation" | "diploma" | "bsc" | "bs";

export type Level = {
  name: LevelName;
  totalCourses: number;
  credits: number;
};
