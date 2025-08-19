import { LevelName } from "./level";

export type foundationSubjects =
  | "Maths-I"
  | "Maths-II"
  | "Stats-I"
  | "Stats-II"
  | "English-I"
  | "English-II"
  | "Computational Thinking"
  | "Python";

export type diplomadsSubjects = "MLF" | "MLT" | "MLP" | "BDM" | "BA" | "TDS";

export type diplomaprSubjects =
  | "PDSA"
  | "DBMS"
  | "MAD-I"
  | "MAD-II"
  | "JAVA"
  | "SC";

export type diplomaProjects =
  | "MLP Project"
  | "BDM Project"
  | "MAD-I Project"
  | "MAD-II Project";

export type bscSubjects = "AI" | "DL" | "SE" | "ST" | "SFPG" | "MR" | "LLM";

export type CourseName =
  | foundationSubjects
  | diplomadsSubjects
  | diplomaprSubjects
  | diplomaProjects
  | bscSubjects;

export type Course = {
  name: CourseName;
  description: string;
  credits: number;
  level: LevelName;
  levelId?: string;
};

export type FoundationSubjects = {
  name: foundationSubjects;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: foundationSubjects[];
};

export type DiplomaDsSubjects = {
  name: diplomadsSubjects;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomadsSubjects[];
};

export type DiplomaPrSubjects = {
  name: diplomaprSubjects;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomaprSubjects[];
};

export type DiplomaProjects = {
  name: diplomaProjects;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomaProjects[];
};

export type BscSubjects = {
  name: bscSubjects;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: bscSubjects[];
};
