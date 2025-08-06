import Level from "../models/level.model";
import { LEVELS_DATA } from "../constants/levels.constants";

export const populateLevelsIfEmpty = async () => {
  try {
    const exsitingLevelsCount = await Level.count();

    if (exsitingLevelsCount === 0) {
      console.log(
        "Levels table is empty ! Populating it with initial data ..."
      );

      const createdLevels = await Level.bulkCreate(LEVELS_DATA, {
        ignoreDuplicates: true,
        returning: true,
      });
      console.log(`✅ Successfully populated ${createdLevels.length} levels`);
      return createdLevels;
    } else {
      console.log(
        `ℹ️  Levels table already has ${exsitingLevelsCount} records, skipping population`
      );
      return await Level.findAll();
    }
  } catch (error) {
    console.error("❌ Error populating levels:", error);
    throw error;
  }
};

export const forcePopulateLevels = async () => {
  try {
    await Level.sync();

    // Clear existing data (be careful with this in production!)
    await Level.destroy({ where: {} });

    // Use the imported constants
    const createdLevels = await Level.bulkCreate(LEVELS_DATA, {
      returning: true,
    });

    console.log(`✅ Force populated ${createdLevels.length} levels`);
    return createdLevels;
  } catch (error) {
    console.error("❌ Error force populating levels:", error);
    throw error;
  }
};
