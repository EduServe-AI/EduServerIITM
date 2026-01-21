// models/instructor.model.ts

import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";

import { LevelName } from "../types/level";
import { Price } from "../types/price";
import type Skill from "./skill.model";
import type UserLanguage from "./userLanguage.model";

interface InstructorAttributes {
  id: string;
  instructorId: string; // foreignkey referencing id in the users table
  iitmProfileUrl: string;
  cgpa: number;
  level: LevelName;
  bio: string;
  about: string;
  githubUrl: string;
  linkedinUrl: string;
  basePrice: Price;
  // isFeatured?: boolean;
}

type InstructorCreationAttributes = Optional<
  InstructorAttributes,
  "id" | "githubUrl" | "linkedinUrl" | "about"
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
  public about!: string;
  public githubUrl!: string;
  public linkedinUrl!: string;
  public basePrice!: Price;
  // public isFeatured?: boolean;

  // Association properties
  public skills?: Skill[];
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
      // Foreignkey referencing the user table
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
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    // isFeatured: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "InstructorProfile",
    tableName: "instructorprofiles",
    timestamps: true,
  },
);
