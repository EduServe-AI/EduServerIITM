import { sequelize } from "../config/db.config";
import { ChatMessagesAttributes } from "./types";
import { DataTypes, Model, Optional, Association } from "sequelize";

// Type imports to avoid circular dependencies
type Bot = import("./bot.model").default;
type User = import("./user.model").default;
type Chat = import("./chat.model").default;

interface ChatCreationAttributes
  extends Optional<ChatMessagesAttributes, "id" | "isDeleted"> {}

class ChatMessages
  extends Model<ChatMessagesAttributes, ChatCreationAttributes>
  implements ChatMessagesAttributes
{
  public id!: string;
  public botId!: string;
  public chatId!: string;
  public messageId!: string;
  public isDeleted?: boolean | undefined;
  public content!: string;
  public rating!: number;
  public sender!: "bot" | "user";
  public userId!: string;
  public username!: string;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public chat?: Chat;
  public bot?: Bot;
  public user?: User;

  // Static associations
  public static associations: {
    chat: Association<ChatMessages, Chat>;
    bot: Association<ChatMessages, Bot>;
    user: Association<ChatMessages, User>;
  };
}

// creating the model
ChatMessages.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    botId: {
      // foreignkey referencing id in the bots table
      type: DataTypes.UUID,
      allowNull: false,
    },
    chatId: {
      // foreignkey referencing the column Id in the chats table
      type: DataTypes.UUID,
      allowNull: false,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      // foreignkey referencing the column userId in the users table
      type: DataTypes.UUID,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender: {
      type: DataTypes.ENUM("bot", "user"),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "ChatMessages",
    tableName: "chatMessages",
    indexes: [
      // 1. The most important index for a chat app
      {
        fields: ["chatId", "createdAt"],
      },
      // 2. A useful index for finding all messages from one user
      {
        fields: ["userId"],
      },
    ],
  }
);

export default ChatMessages;
