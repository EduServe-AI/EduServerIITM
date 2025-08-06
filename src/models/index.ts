import User from "./user.model";
import Level from "./level.model";

export const syncModels = async () => {
  await User.sync({ alter: true });
  await Level.sync({ alter: true });
};
