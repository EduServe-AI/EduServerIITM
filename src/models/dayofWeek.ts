import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";

type Availability = import("./availability.model").default;

// models/DayOfWeek.ts
interface DayOfWeekAttributes {
  id: number;
  name: string;
  shortName: string;
  dayIndex: number;
}

interface DayOfWeekCreationAttributes
  extends Optional<DayOfWeekAttributes, "id"> {}

export default class DayOfWeek
  extends Model<DayOfWeekAttributes, DayOfWeekCreationAttributes>
  implements DayOfWeekAttributes
{
  public id!: number;
  public name!: string;
  public shortName!: string;
  public dayIndex!: number;

  // --- New association properties ---
  public availabilities?: Availability[];

  public static associations: {
    availabilities: Association<DayOfWeek, Availability>;
  };
}

DayOfWeek.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "short_name",
    },
    dayIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "day_index",
      validate: {
        min: 0,
        max: 6,
      },
    },
  },
  {
    sequelize,
    modelName: "DayOfWeek",
    tableName: "days_of_week",
    underscored: true,
    timestamps: true,
  }
);
