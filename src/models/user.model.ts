import {
  DataTypes,
  Model,
  Optional,
  Association,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { sequelize } from "../config/db.config";
import { UserAttributes } from "./types";
import Course from "./course.model";
import Enrollment from "./enrollment.model";

// 2. Creation attributes for optional fields
interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

// 3. Define User model class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public username!: string | null;
  public email!: string;
  public password!: string | null;
  public role!: "admin" | "student" | "instructor";
  public level!: "foundation" | "diploma" | "bsc" | "bs";
  public onboarded!: boolean;
  public verified!: boolean;
  public profileUrl!: string;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Assosciation properties
  public courses?: Course[];
  public enrollments?: Enrollment[];

  // Static associations
  public static associations: {
    courses: Association<User, Course>;
    enrollments: Association<User, Enrollment>;
  };
}

// 4. Init the model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "instructor"),
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM("foundation", "diploma", "bsc", "bs"),
      allowNull: true,
    },
    onboarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users", // consistent naming
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
  }
);

// export the class
export default User;
