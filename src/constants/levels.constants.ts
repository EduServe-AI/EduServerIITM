import { Level } from "../types/level";

// Defining the levels data as a constant
export const LEVELS_DATA: Level[] = [
  {
    name: "foundation",
    totalCourses: 8,
    credits: 32,
  },
  {
    name: "diploma",
    totalCourses: 16,
    credits: 54,
  },
  {
    name: "bsc",
    totalCourses: 7,
    credits: 28,
  },
  {
    name: "bs",
    totalCourses: 7,
    credits: 28,
  },
] as const;
