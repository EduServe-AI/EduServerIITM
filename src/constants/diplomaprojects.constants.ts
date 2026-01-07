import { DiplomaProjects } from "../types/course";

export const DIPLOMA_PROJECTS: DiplomaProjects[] = [
  {
    name: "MLP Project",
    title: "Machine Learning Practice - Project",
    description: "Machine Learning Practice - Project",
    credits: 2,
    level: "diploma",
  },
  {
    name: "BDM Project",
    title: "Business Data Management - Project",
    description:
      "To Analyze and gather real world Business Data and to provide relevant insights",
    credits: 2,
    level: "diploma",
  },
  {
    name: "MAD-I Project",
    title: "Modern Application Development-I Project",
    description: "Developing a Backend Application using Flask and Jinja",
    credits: 2,
    level: "diploma",
  },
  {
    name: "MAD-II Project",
    title: "Modern Application Development-II Project",
    description: "Developing a Full Stack Application using Flask and Vuejs",
    credits: 2,
    level: "diploma",
    prerequisites: ["MAD-I Project"],
  },
  {
    name: "DL & GENAI Project",
    title: "Deep Learning and Generative AI Project",
    description: "Developing a Generative AI Project",
    credits: 2,
    level: "diploma",
  },
];
