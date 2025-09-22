import DayOfWeek from "../models/dayofWeek";

export const getDayIndex = async (name: string) => {
  const day = await DayOfWeek.findOne({ where: { name: name } });
  return day?.dayIndex;
};
