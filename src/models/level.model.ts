import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.config";
import { LevelAttributes } from "./types";

interface LevelCreationAttributes
  extends Optional<LevelAttributes, "id" | "createdAt" | "updatedAt"> {}

class Level
  extends Model<LevelAttributes, LevelCreationAttributes>
  implements LevelAttributes
{
  public id!: string;
  public name!: "foundation" | "diploma" | "bsc" | "bs";
  public totalCourses!: number;
  public credits!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Level.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: true,
    },
    totalCourses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Level",
    tableName: "levels",
    timestamps: true,
  }
);

export default Level;
