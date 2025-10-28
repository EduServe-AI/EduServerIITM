import { sequelize } from "../config/db.config";
import { ChatAttributes } from "./types";
import { DataTypes, Model, Optional, Association } from "sequelize";

// Type imports to avoid circular dependencies
type Bot = import("./bot.model").default;
type User = import("./user.model").default;
type ChatMessages = import("./chatMessage.model").default;

interface ChatCreationAttributes
  extends Optional<
    ChatAttributes,
    "id" | "isDeleted" | "lastInteractionTime"
  > {}

class Chats
  extends Model<ChatAttributes, ChatCreationAttributes>
  implements ChatAttributes
{
  public id!: string;
  public botId!: string;
  public botName!: string;
  public chatId!: string;
  public userId!: string;
  public title?: string | undefined;
  public isDeleted?: boolean | undefined;
  public lastInteractionTime?: Date | undefined;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public bot?: Bot;
  public user?: User;
  public messages?: ChatMessages[];

  // Static associations
  public static associations: {
    bot: Association<Chats, Bot>;
    user: Association<Chats, User>;
    messages: Association<Chats, ChatMessages>;
  };
}

// creating the model
Chats.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    botId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    botName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastInteractionTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Chats",
    tableName: "chats",
    indexes: [
      {
        fields: ["botId", "chatId"],
      },
      {
        fields: ["chatId"],
      },
      {
        fields: ["botId"],
      },
      {
        fields: ["userId"],
      },
    ],
  }
);

export default Chats;
