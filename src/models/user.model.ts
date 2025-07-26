import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.config";
import { UserAttributes } from "./types";


// 2. Creation attributes for optional fields
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

// 3. Define User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string | null;
  public email!: string;
  public password!: string | null;
  public role!: "student" | "instructor";
  public onboarded!: boolean;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      type: DataTypes.ENUM("student", "instructor"),
      allowNull: true,
    },
    onboarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User", 
    tableName: "users", // consistent naming
    timestamps: true,
  }
);

// export the class
export default User;
