// models/instructor.model.ts

import { DataTypes, Model, Optional, Association } from "sequelize";
import { sequelize } from "../config/db.config";
import type Skill from "./skill.model";
import type UserLanguage from "./userLanguage.model";
import { LevelName } from "../types/level";
import { Price } from "../types/price";

interface InstructorAttributes {
  id: string;
  instructorId: string; // foreignkey referencing id in the users table
  iitmProfileUrl: string;
  cgpa: number;
  level: LevelName;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  basePrice: Price;
}

type InstructorCreationAttributes = Optional<
  InstructorAttributes,
  "id" | "githubUrl" | "linkedinUrl"
>;

export default class InstructorProfiles
  extends Model<InstructorAttributes, InstructorCreationAttributes>
  implements InstructorAttributes
{
  declare id: string;
  public instructorId!: string;
  public iitmProfileUrl!: string;
  public cgpa!: number;
  public level!: LevelName;
  public bio!: string;
  public githubUrl!: string;
  public linkedinUrl!: string;
  public basePrice!: Price;

  // Association properties
  public subjects?: Skill[];
  public languages?: UserLanguage[];

  // Static associations
  public static associations: {
    skills: Association<InstructorProfiles, Skill>;
    languages: Association<InstructorProfiles, UserLanguage>;
  };
}

InstructorProfiles.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    iitmProfileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cgpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    githubUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "InstructorProfile",
    tableName: "instructorprofiles",
    timestamps: true,
  }
);
