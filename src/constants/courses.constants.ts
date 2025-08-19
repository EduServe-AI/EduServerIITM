import { FOUNDATION_SUBJECTS } from "./foundation.constants";
import { DIPLOMADS_SUBJECTS } from "./diplomads.constants";
import { DIPLOMAPR_SUBJECTS } from "./diplomapr.constansts";
import { DIPLOMA_PROJECTS } from "./diplomaprojects.constants";
import { BSC_SUBJECTS } from "./bsc.constants";

import type { Course } from "../types/course";

export const COURSES_DATA: Course[] = [
  ...FOUNDATION_SUBJECTS,
  ...DIPLOMADS_SUBJECTS,
  ...DIPLOMAPR_SUBJECTS,
  ...DIPLOMA_PROJECTS,
  ...BSC_SUBJECTS,
];

export const COURSE_COUNTS = {
  Foundation: FOUNDATION_SUBJECTS.length,
  Diploma:
    DIPLOMADS_SUBJECTS.length +
    DIPLOMAPR_SUBJECTS.length +
    DIPLOMA_PROJECTS.length,
  Bsc: BSC_SUBJECTS.length,
} as const;
