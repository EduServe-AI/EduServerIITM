// models/UserLanguage.ts

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import Language from "./language.model";

interface UserLanguageAttributes {
  id: string;
  userId: string;
  languageId: string;
}

interface UserLanguageCreationAttributes
  extends Optional<UserLanguageAttributes, "id"> {}

export default class UserLanguage
  extends Model<UserLanguageAttributes, UserLanguageCreationAttributes>
  implements UserLanguageAttributes
{
  public id!: string;
  public userId!: string;
  public languageId!: string;
      
  // Association properties
  public language?: Language;
}

UserLanguage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    languageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "language_id",
    },
  },
  {
    sequelize,
    modelName: "UserLanguage",
    tableName: "user_languages",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "language_id"],
      },
    ],
  }
);
