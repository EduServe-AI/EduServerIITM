import User from "./user.model";


export const syncModels = async () => {
    await User.sync({ alter : true })
}