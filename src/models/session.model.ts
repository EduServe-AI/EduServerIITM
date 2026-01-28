import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { SessionAttributes } from "./types";

interface SessionCreationAttributes
  extends Optional<SessionAttributes, "id" | "createdAt" | "updatedAt"> {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public id!: string;
  public studentId!: string;
  public instructorId!: string;
  public title!: string;
  public description: string | null | undefined;
  public start_time!: string;
  public duration_minutes!: string;
  public end_time!: string;
  public stream_call_id!: string;
  public status!: "scheduled" | "completed" | "cancelled";

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    stream_call_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      defaultValue: "scheduled",
    },
  },
  {
    sequelize,
    modelName: "Session",
    tableName: "sessions",
    timestamps: true,
  },
);

export default Session;
