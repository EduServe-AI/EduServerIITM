import { FoundationSubjects } from "../types/course";

export const FOUNDATION_SUBJECTS: FoundationSubjects[] = [
  {
    name: "Maths-I",
    description:
      "This course introduces functions (straight lines, polynomials, exponentials and logarithms) and discrete mathematics (basics, graphs) with many examples. The students will be exposed to the idea of using abstract mathematical structures to represent concrete real life situations.",
    credits: 4,
    level: "foundation",
  },
  {
    name: "Maths-II",
    description:
      "This course aims to introduce the basic concepts of linear algebra, calculus and optimization with a focus towards the application area of machine learning and data science.",
    credits: 4,
    level: "foundation",
    prerequisites: ["Maths-I"],
  },
  {
    name: "Stats-I",
    description:
      "The students will be introduced to large datasets. Using this data, the students will be introduced to various insights one can glean from the data. Basic concepts of probability also will be introduced during the course leading to a discussion on Random variables.",
    credits: 4,
    level: "foundation",
  },
  {
    name: "Stats-II",
    description:
      "This second course will develop on the first course on statistics and further delve into the main statistical problems and solution approaches",
    credits: 4,
    level: "foundation",
    prerequisites: ["Stats-I"],
  },
  {
    name: "English-I",
    description:
      "This course aims at achieving fluency and confidence in spoken and written English. This course will use insights from theories of learning and dominant methods of teaching language.",
    credits: 4,
    level: "foundation",
  },
  {
    name: "English-II",
    description:
      "Focus on achieving greater degree of fluency in functional and conversational English to understand subtle and detailed meaning in conversations and texts through short literary pieces and contextualized content.",
    credits: 4,
    level: "foundation",
    prerequisites: ["English-I"],
  },
  {
    name: "Computational Thinking",
    description:
      "The students will be introduced to a number of programming concepts using illustrative examples which will be solved almost entirely manually. The manual execution of each solution allows for close inspection of the concepts being discussed.",
    credits: 4,
    level: "foundation",
  },
  {
    name: "Python",
    description:
      "This will be the first formal programming course that students will see in this programme. The goal of this course is to introduce Python programming, which is used throughout the programme, with a basic problem solving and algorithmic flavour.",
    credits: 4,
    level: "foundation",
    prerequisites: ["Computational Thinking"],
  },
];
