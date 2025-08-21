import { DiplomaPrSubjects } from "../types/course";

export const DIPLOMAPR_SUBJECTS: DiplomaPrSubjects[] = [
  {
    name: "PDSA",
    description:
      "A good foundation course to introduce basic concepts in the design and analysis of algorithms as well as standard data structures, using Python as a base language for implementing these.",
    credits: 4,
    level: "diploma",
  },
  {
    name: "DBMS",
    description:
      "This practical course will teach students to use popular tools for sourcing data, transforming it, analyzing it, communicating these as visual stories, and deploying them in production. Pre-requisites: Python, HTML, JavaScript, Excel, data science basics",
    credits: 4,
    level: "diploma",
  },
  {
    name: "JAVA",
    description:
      "This course uses Java to provide an understanding of core ideas in object oriented programming, exception handling, event driven programming, concurrent programming and functional programming.",
    credits: 4,
    level: "diploma",
    prerequisites: [],
  },
  {
    name: "MAD-I",
    description:
      "Building a modern application involves many different aspects: front end, recording transactions, storage, connecting to a remote server, using APIs etc. The courses Modern Application Development I and II go through all these aspects through a detailed and evolving case study, teaching the relevant programming skills as the course progresses.",
    credits: 4,
    level: "diploma",
  },
  {
    name: "MAD-II",
    description:
      "Building a modern application involves many different aspects: front end, recording transactions, storage, connecting to a remote server, using APIs etc. The courses Modern Application Development I and II go through all these aspects through a detailed and evolving case study, teaching the relevant programming skills as the course progresses.",
    credits: 4,
    level: "diploma",
    prerequisites: ["MAD-I"],
  },
  {
    name: "SC",
    description:
      "Brief introduction to the various commands in Linux and Shell Scripting",
    credits: 3,
    level: "diploma",
  },
];
