import "sequelize";
import { DataTypes } from "sequelize";

declare module "sequelize" {
  namespace DataTypes {
    // Defining vector as an abstract class
    class VECTOR extends ABSTRACT {}

    // Add static method for the DataTypes object
    interface DataTypesStatic {
      VECTOR: (dimensions?: number) => VECTOR;
    }
  }
}
