import Language from "../models/language.model";

export const getLanguageId = async (name: string) => {
  const language = await Language.findOne({ where: { name: name } });
  return language?.id;
};
