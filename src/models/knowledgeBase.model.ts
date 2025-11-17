import sequelize from "../config/db.config";
import { DataTypes, Model, Optional, UUIDV4 } from "sequelize";
import Course from "./course.model";
import { KnowledgeBaseAttributes } from "./types";

interface KnowledgeBaseCreationAttributes
  extends Optional<KnowledgeBaseAttributes, "id" | "weekNumber"> {}

export default class KnowledgeBase
  extends Model<KnowledgeBaseAttributes, KnowledgeBaseCreationAttributes>
  implements KnowledgeBaseAttributes
{
  public id!: string;
  public courseId!: string;
  public embedding!: number[];
  public content!: string;
  public source!: string;
  public weekNumber?: number | null | undefined;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// creating the model
KnowledgeBase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Course,
        key: "id",
      },
    },
    embedding: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "KnowledgeBase",
    tableName: "knowledge_base",
    indexes: [
      {
        fields: ["courseId"],
      },
      {
        fields: ["id"],
      },
      {
        using: "ivfflat",
        fields: ["embedding"],
        operator: "vector_cosine_ops",
        name: "embedding_vector_idx",
      },
    ],
  }
);
