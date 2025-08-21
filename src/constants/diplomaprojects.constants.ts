import { DiplomaProjects } from "../types/course";

export const DIPLOMA_PROJECTS: DiplomaProjects[] = [
  {
    name: "MLP Project",
    description: "Machine Learning Practice - Project",
    credits: 2,
    level: "diploma",
  },
  {
    name: "BDM Project",
    description:
      "To Analyze and gather real world Business Data and to provide relevant insights",
    credits: 2,
    level: "diploma",
  },
  {
    name: "MAD-I Project",
    description: "Developing a Backend Application using Flask and Jinja",
    credits: 2,
    level: "diploma",
  },
  {
    name: "MAD-II Project",
    description: "Developing a Full Stack Application using Flask and Vuejs",
    credits: 2,
    level: "diploma",
    prerequisites: ["MAD-I Project"],
  },
];
