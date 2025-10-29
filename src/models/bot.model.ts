import { sequelize } from "../config/db.config";
import { LevelName } from "../types/level";
import { BotAttributes } from "./types";
import { DataTypes, Model, Optional, Association } from "sequelize";

// Type imports to avoid circular dependencies
type Course = import("./course.model").default;
type Chat = import("./chat.model").default;
type ChatMessages = import("./chatMessage.model").default;

interface BotCreationAttributes
  extends Optional<
    BotAttributes,
    "id" | "createdAt" | "updatedAt" | "is_active"
  > {}

class Bots
  extends Model<BotAttributes, BotCreationAttributes>
  implements BotAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public courseId!: string;
  public level!: LevelName;
  public numInteractions!: number;
  public is_active?: boolean;
  public is_featured?: boolean;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public course?: Course;
  public chats?: Chat[];
  public allmessages?: ChatMessages[];

  // Static associations
  public static associations: {
    course: Association<Bots, Course>;
    chats: Association<Bots, Chat>;
    allmessages: Association<Bots, ChatMessages>;
  };
}

// creating the model
Bots.init(
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
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: false,
    },
    numInteractions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Bot",
    tableName: "bots",
    indexes: [
      {
        fields: ["courseId"],
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

export default Bots;
