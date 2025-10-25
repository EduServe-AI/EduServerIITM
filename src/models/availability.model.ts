import { Association, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.config";

type DayOfWeek = import("./dayofWeek").default;
type InstructorProfiles = import("./instructor.model").default;
type User = import("./user.model").default;
type AvailabilityTimeSlot = import("./timeSlot.model").default;

interface InstructorAvailabilityAttributes {
  id: string;
  instructorProfileId: string;
  userId: string;
  dayOfWeekId: number;
  isAvailable: boolean;
}

interface InstructorAvailabilityCreationAttributes
  extends Optional<InstructorAvailabilityAttributes, "id" | "isAvailable"> {}

class Availability
  extends Model<
    InstructorAvailabilityAttributes,
    InstructorAvailabilityCreationAttributes
  >
  implements InstructorAvailabilityAttributes
{
  public id!: string;
  public instructorProfileId!: string;
  public userId!: string;
  public dayOfWeekId!: number;
  public isAvailable!: boolean;

  // --- New association properties ---
  public instructorProfile?: InstructorProfiles;
  public userProfile?: User;
  public dayOfWeek?: DayOfWeek;
  public timeSlots?: AvailabilityTimeSlot[];

  public static associations: {
    instructorProfile: Association<Availability, InstructorProfiles>;
    dayOfWeek: Association<Availability, DayOfWeek>;
    timeSlots: Association<Availability, AvailabilityTimeSlot>;
  };
}

Availability.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    instructorProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dayOfWeekId: {
      // foreignKey referencing the dayOfWeek Table
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "day_of_week_id",
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_available",
    },
  },
  {
    sequelize,
    modelName: "InstructorAvailability",
    tableName: "instructor_availability", // Conventionally plural
    indexes: [
      {
        unique: true,
        fields: ["instructorProfileId", "day_of_week_id"],
      },
    ],
  }
);

export default Availability;
