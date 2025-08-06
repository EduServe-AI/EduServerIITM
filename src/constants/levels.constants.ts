import { Level } from "../types/level";

// Defining the levels data as a constant
export const LEVELS_DATA: Level[] = [
  {
    name: "Foundation",
    totalCourses: 8,
    credits: 32,
  },
  {
    name: "Diploma",
    totalCourses: 16,
    credits: 54,
  },
  {
    name: "Bsc",
    totalCourses: 7,
    credits: 28,
  },
  {
    name: "Bs",
    totalCourses: 7,
    credits: 28,
  },
] as const;
