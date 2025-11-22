import Language from "../models/language.model";
import { Language_Data } from "../constants/languages.constants";

export const populateLanguagesIfEmpty = async () => {
  try {
    const existingLanguagesCount = await Language.count();

    if (existingLanguagesCount === 0) {
      console.log(
        "Languages table is empty ! Populating it with indian languages ..."
      );

      const langauges = Language_Data.map((langauge_data) => ({
        name: langauge_data.name,
        code: langauge_data.iso_639_1,
      }));

      const createdLanguages = await Language.bulkCreate(langauges, {
        ignoreDuplicates: true,
        returning: true,
      });

      console.log(
        `✅ Successfully populated ${createdLanguages.length} languages`
      );

      return createdLanguages;
    } else {
      console.log(
        `ℹ️  Languages table already has ${existingLanguagesCount} record skipping population`
      );
      return await Language.findAll();
    }
  } catch (error) {
    console.error("❌ Error populating languages:", error);
    throw error;
  }
};
