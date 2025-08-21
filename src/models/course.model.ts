import { sequelize } from "../config/db.config";
import { LevelName } from "../types/level";
import { CourseName } from "../types/course";
import { CourseAttributes } from "./types";
import { DataTypes, Model, Optional, Association } from "sequelize";

// Type imports to avoid circular dependencies
type User = import("./user.model").default;
type Level = import("./level.model").default;
type Enrollment = import("./enrollment.model").default;

interface CourseCreationAttributes
  extends Optional<CourseAttributes, "id" | "createdAt" | "updatedAt"> {}

class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  public id!: string;
  public name!: CourseName;
  public description!: string;
  public credits!: number;
  public level!: LevelName;
  public levelId!: string;
  public prerequisites?: CourseName[];

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public users?: User[];
  public enrollments?: Enrollment[];
  public levelInfo?: Level; // renamed from 'level' to avoid conflict

  // Static associations
  public static associations: {
    users: Association<Course, User>;
    enrollments: Association<Course, Enrollment>;
    levelInfo: Association<Course, Level>;
  };
}

// creating the model
Course.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2,
        max: 4,
      },
    },
    level: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: false,
    },
    levelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "levels",
        key: "id",
      },
    },
    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Course",
    tableName: "courses",
    indexes: [
      {
        fields: ["levelId"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["name"],
        unique: true,
      },
    ],
  }
);

export default Course;
