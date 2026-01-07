import { LevelName } from "./level";

export type foundationSubjects =
  | "Maths-I"
  | "Maths-II"
  | "Stats-I"
  | "Stats-II"
  | "English-I"
  | "English-II"
  | "CT"
  | "Python";

export type diplomadsSubjects =
  | "MLF"
  | "MLT"
  | "MLP"
  | "BDM"
  | "BA"
  | "TDS"
  | "DL & GENAI";

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
  | "MAD-II Project"
  | "DL & GENAI Project";

export type bscSubjects =
  | "AI"
  | "DL"
  | "SE"
  | "ST"
  | "SFPG"
  | "MR"
  | "LLM"
  | "FF"
  | "LSM"
  | "AA"
  | "SC"
  | "CSD"
  | "PC"
  | "MT"
  | "NLP"
  | "DLCV"
  | "ME"
  | "CF"
  | "DLP"
  | "OS"
  | "ADS"
  | "MLOPS"
  | "CN"
  | "TC"
  | "ADL"
  | "DS & AI Lab"
  | "MFGENAI"
  | "GT"
  | "PSOSM"
  | "SDM"
  | "I4.0"
  | "BD"
  | "RL"
  | "ATBI"
  | "BDBN";

export type CourseName =
  | foundationSubjects
  | diplomadsSubjects
  | diplomaprSubjects
  | diplomaProjects
  | bscSubjects;

export type Course = {
  name: CourseName;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  levelId?: string;
};

export type FoundationSubjects = {
  name: foundationSubjects;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: foundationSubjects[];
};

export type DiplomaDsSubjects = {
  name: diplomadsSubjects;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomadsSubjects[];
};

export type DiplomaPrSubjects = {
  name: diplomaprSubjects;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomaprSubjects[];
};

export type DiplomaProjects = {
  name: diplomaProjects;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: diplomaProjects[];
};

export type BscSubjects = {
  name: bscSubjects;
  title: string;
  description: string;
  credits: number;
  level: LevelName;
  prerequisites?: bscSubjects[];
};
