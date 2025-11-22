// models/enrollment.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";

import { EnrollmentAttributes } from "./types";
import { Term, CourseStatus } from "../types/enrollment";

interface EnrollmentCreationAttributes
  extends Optional<
    EnrollmentAttributes,
    "id" | "grade" | "createdAt" | "updatedAt"
  > {}

class Enrollment
  extends Model<EnrollmentAttributes, EnrollmentCreationAttributes>
  implements EnrollmentAttributes
{
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public term!: Term;
  public year!: number;
  public status!: CourseStatus;
  public grade?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
    term: {
      type: DataTypes.ENUM("Jan", "May", "Sept"),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("enrolled", "completed", "dropped", "in_progress"),
      allowNull: false,
      defaultValue: "enrolled",
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Enrollment",
    tableName: "enrollments",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["courseId"],
      },
      {
        fields: ["term", "year"],
      },
      {
        // Unique constraint: user can't enroll in same course twice in same term
        fields: ["userId", "courseId", "term", "year"],
        unique: true,
      },
    ],
  }
);

export default Enrollment;
