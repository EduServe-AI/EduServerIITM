import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });


export const sequelize = new Sequelize(
    process.env.DATABASE_URL as string, { 
        dialect : "postgres",
        logging : false,
        dialectOptions : {
            ssl : {
                require : true,
                rejectUnauthorized: false
            }
        }
    }
)