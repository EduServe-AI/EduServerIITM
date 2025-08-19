import { DiplomaDsSubjects } from "../types/course";

export const DIPLOMADS_SUBJECTS: DiplomaDsSubjects[] = [
  {
    name: "MLF",
    description:
      "This course lays the groundwork for the upcoming ML courses by covering various fundamentals that do not necessarily fall under Machine Learning but are quite necessary for a comprehensive understanding of Machine Learning.",
    credits: 4,
    level: "diploma",
  },
  {
    name: "MLT",
    description:
      "To introduce the main methods and models used in machine learning problems of regression, classification and clustering. To study the properties of these models and methods and learn about their suitability for different problems.",
    credits: 4,
    level: "diploma",
  },
  {
    name: "MLP",
    description:
      "This companion course to the ML Theory course introduces the student to scikit-learn, a popular Python machine learning module, to provide hands-on problem solving experience for all the methods and models learnt in the Theory course.",
    credits: 4,
    level: "diploma",
    prerequisites: ["MLF", "MLT"],
  },
  {
    name: "BDM",
    description:
      "A significant source of data sets and problems for data scientists will come from the business domain. This course provides a basic understanding of how businesses are organised and run from a data perspective.",
    credits: 4,
    level: "diploma",
  },
  {
    name: "BA",
    description:
      "That basic course focused on the preliminaries of the area. This course highlights a business application and then demonstates an application of a statistical techique to solve that scenario and arrive at the best decisions and insights.",
    credits: 4,
    level: "diploma",
    prerequisites: ["BDM"],
  },
  {
    name: "TDS",
    description:
      "This practical course will teach students to use popular tools for sourcing data, transforming it, analyzing it, communicating these as visual stories, and deploying them in production. Pre-requisites: Python, HTML, JavaScript, Excel, data science basics",
    credits: 3,
    level: "diploma",
  },
];
