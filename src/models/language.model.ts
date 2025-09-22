// models/language.model.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.config";

interface LanguageAttributes {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

type LanguageCreationAttributes = Optional<
  LanguageAttributes,
  "id" | "isActive"
>;

export default class Language
  extends Model<LanguageAttributes, LanguageCreationAttributes>
  implements LanguageAttributes
{
  declare id: string;
  public name!: string;
  public code!: string;
  public isActive!: boolean;
}

Language.init(
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
    code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: "ISO 639-1 code",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    tableName: "languages",
    modelName: "Language",
    underscored: true,
    timestamps: true,
  }
);
