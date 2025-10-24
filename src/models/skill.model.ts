// models/skill.model.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.config";

interface SkillAttributes {
  id: string;
  name: string;
  courseId: string;
  instructorProfileId: string;
  userId: string;
}

type SkillCreationAttributes = Optional<SkillAttributes, "id">;

export default class Skill
  extends Model<SkillAttributes, SkillCreationAttributes>
  implements SkillAttributes
{
  declare id: string;
  public name!: string;
  public courseId!: string;
  public instructorProfileId!: string;
  public userId!: string;
}

Skill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseId: {
      // foreignkey referecing the courseId in the course table.
      type: DataTypes.UUID,
      allowNull: false,
    },
    instructorProfileId: {
      // foreignkey referencing the id in the instructorProfile table.
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      // foreignkey referencing the id in the usersTable
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "skills",
    modelName: "Skill",
    timestamps: true,
  }
);
