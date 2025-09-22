import DayOfWeek from "../models/dayofWeek";
import { Days } from "../constants/days.constants";

export const populateDaysIfEmpty = async () => {
  try {
    const existingDaysCount = await DayOfWeek.count();

    if (existingDaysCount === 0) {
      console.log("Days table is empty ! Populating it with week days ...");

      const days = Days.map((day) => ({
        ...day,
      }));

      const createdDays = await DayOfWeek.bulkCreate(days, {
        ignoreDuplicates: true,
        returning: true,
      });

      console.log(`✅ Successfully populated ${createdDays.length} days`);

      return createdDays;
    } else {
      console.log(
        `ℹ️  Languages table already has ${existingDaysCount} record skipping population`
      );
      return await DayOfWeek.findAll();
    }
  } catch (error) {
    console.error("❌ Error populating languages:", error);
    throw error;
  }
};
