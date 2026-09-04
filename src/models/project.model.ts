import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { CourseName } from "../types/course";
import { Term } from "../types/enrollment";
import { LevelName } from "../types/level";
import { ProjectAttributes } from "./types";

type Milestone = import("./milestone.model").default;

interface ProjectCreationAttributes
  extends Optional<
    ProjectAttributes,
    "id" | "term" | "year" | "estimatedDuration" | "isFeatured" | "milestones" | "createdAt" | "updatedAt"
  > {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: string;
  public name!: string;
  public title!: string;
  public code!: string;
  public course!: CourseName;
  public description!: string;
  public version!: string;
  public level!: LevelName;
  public term?: Term;
  public year?: number;
  public credits!: number;
  public estimatedDuration?: string;
  public isFeatured?: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public milestones?: Milestone[];

  // Static associations
  public static associations: {
    milestones: Association<Project, Milestone>;
  };
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: false,
    },
    term: {
      type: DataTypes.ENUM("Jan", "May", "Sep"),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    estimatedDuration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "projects",
    timestamps: true,
    indexes: [
      {
        fields: ["name"],
        unique: true,
      },
      {
        fields: ["code"],
        unique: true,
      },
      {
        fields: ["level"],
      },
      {
        fields: ["course"],
      },
    ],
  }
);

export default Project;
