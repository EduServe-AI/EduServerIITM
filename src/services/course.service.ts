import Course from "../models/course.model";

export const getCourseId = async (courseName: string) => {
  const course = await Course.findOne({ where: { name: courseName } });

  return course?.id;
};

export const getWeekNumber = (filename: string): number | null => {
  if (!filename) return null;

  const lower = filename.toLowerCase();

  // 1) Prefer explicit "week" patterns anywhere in the string
  const weekMatch = lower.match(/week[\s._-]*([0-9]{1,2})/i);
  if (weekMatch && weekMatch[1]) return parseInt(weekMatch[1], 10);

  // 2) Abbreviated "wk" or "w" patterns
  const wkMatch = lower.match(/\b(?:wk|w)[\s._-]*([0-9]{1,2})\b/i);
  if (wkMatch && wkMatch[1]) return parseInt(wkMatch[1], 10);

  // 3) Handle dotted lecture numbers like "Lecture 2.6" -> treat "2" as the week
  const dottedMatch = lower.match(/([0-9]{1,2})\.([0-9]{1,2})/);
  if (dottedMatch && dottedMatch.index !== undefined) {
    const idx = dottedMatch.index;
    const before = lower.slice(Math.max(0, idx - 12), idx);
    if (before.includes("lecture") || before.includes("lec")) {
      return parseInt(dottedMatch[1], 10);
    }
  }

  // Keywords that indicate the number is a lecture/slide/part number and should be ignored
  const ignoreKeywords = [
    "lecture",
    "lec",
    "slides",
    "slide",
    "part",
    "chapter",
    "ch",
    "session",
  ];

  // 3) Collect all numeric tokens and pick the first one that is NOT clearly a lecture/slide number
  const numberRegex = /([0-9]{1,2})/g;
  const matches = [...lower.matchAll(numberRegex)];

  for (const m of matches) {
    const num = m[1];
    const idx = m.index ?? 0;

    // look around the number (15 chars before/after) to detect context
    const before = lower.slice(Math.max(0, idx - 15), idx);
    const after = lower.slice(idx + num.length, idx + num.length + 15);

    const context = before + " " + after;

    // if context contains an ignore keyword near the number, skip it
    let isIgnored = false;
    for (const kw of ignoreKeywords) {
      if (context.includes(kw)) {
        isIgnored = true;
        break;
      }
    }

    if (!isIgnored) {
      return parseInt(num, 10);
    }
  }

  return null;
};
