import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import Course from "./course.model";

export interface DocumentLinkAttributes {
  id: string;
  courseId: string;
  sourceFilename: string;
  documentUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentLinkCreationAttributes
  extends Optional<DocumentLinkAttributes, "id" | "createdAt" | "updatedAt"> {}

class DocumentLink
  extends Model<DocumentLinkAttributes, DocumentLinkCreationAttributes>
  implements DocumentLinkAttributes
{
  public id!: string;
  public courseId!: string;
  public sourceFilename!: string;
  public documentUrl!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association
  public course?: Course;

  public static associations: {
    course: Association<DocumentLink, Course>;
  };
}

DocumentLink.init(
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
        model: "courses",
        key: "id",
      },
    },
    sourceFilename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "DocumentLink",
    tableName: "document_links",
    indexes: [
      {
        // Fast lookup: given a course + filename, find the URL
        unique: true,
        fields: ["courseId", "sourceFilename"],
      },
      {
        fields: ["courseId"],
      },
    ],
  }
);

export default DocumentLink;
