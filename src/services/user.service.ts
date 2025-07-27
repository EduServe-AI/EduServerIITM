import User from "../models/user.model";
import bcrypt from "bcryptjs"

export const findUserByEmail = async (email : string) => {
    return await User.findOne({ where : { email}})
}

export const createStudent = async(username : string , email : string , password : string) => {
    const hashedPassword = await bcrypt.hash(password , 10);

    const user = await User.create({
        username , 
        email , 
        password : hashedPassword, 
        role : "student",
        onboarded : false
    })

    return user; 
       
}

export const checkPassword = async (password : string , hashedPassword : string) => {

    const isMatch = await bcrypt.compare(password , hashedPassword)

    return isMatch

}