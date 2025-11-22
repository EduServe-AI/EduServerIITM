// models/TimeSlot.ts

import { Association, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";

type Availability = import("./availability.model").default;

interface AvailabilityTimeSlotAttributes {
  id: string;
  availabilityId: string;
  startTime: string; // Using string for TIME type - format: 'HH:MM:SS'
  endTime: string; // Using string for TIME type - format: 'HH:MM:SS'
  timezone: string;
  isActive: boolean;
}

interface AvailabilityTimeSlotCreationAttributes
  extends Optional<
    AvailabilityTimeSlotAttributes,
    "id" | "timezone" | "isActive"
  > {}

export default class AvailabilityTimeSlot
  extends Model<
    AvailabilityTimeSlotAttributes,
    AvailabilityTimeSlotCreationAttributes
  >
  implements AvailabilityTimeSlotAttributes
{
  public id!: string;
  public availabilityId!: string;
  public startTime!: string;
  public endTime!: string;
  public timezone!: string;
  public isActive!: boolean;

  // --- New association properties ---
  public availability?: Availability;

  public static associations: {
    availability: Association<AvailabilityTimeSlot, Availability>;
  };
}

AvailabilityTimeSlot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    availabilityId: {
      // foreignkey referencing the availability id in the availability table
      type: DataTypes.UUID,
      allowNull: false,
      field: "availability_id",
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "end_time",
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "UTC",
      validate: {
        // Basic timezone validation - you might want to use a more comprehensive list
        isIn: [
          [
            "UTC",
            "America/New_York",
            "America/Los_Angeles",
            "Europe/London",
            "Asia/Tokyo",
            "Asia/Kolkata",
          ],
        ],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    modelName: "AvailabilityTimeSlot",
    tableName: "availability_time_slots",
    underscored: true,
    timestamps: true,
  }
);
