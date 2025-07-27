import { Request , Response } from "express";
import { findUserByEmail , createStudent, checkPassword } from "../services/user.service";
import { generateToken , verifyToken } from "../utils/jwt";
import  Responder from "../utils/responder"

export const registerStudent = async (req : Request , res : Response) => {
    try {
        
        const { username , email , password } = req.body;

        // checking for student existence
        const existingStudent = await findUserByEmail(email);
        if (existingStudent) {
          return res.status(400).json({ message: "Email already exists" });
        } 
        

        const newStudent = await createStudent(username , email , password);

        const {accessToken , refreshToken} = generateToken(newStudent.id , newStudent.role) 

        res.cookie('refreshToken' , refreshToken , {
            httpOnly : true,
            secure : false,
            sameSite : "lax" , 
            maxAge : 7 * 24 * 60 * 60 * 1000 ,
            path : '/',
            
        })
 
        newStudent.password = null

        return Responder(res , {
            message : "Student registered successfully",
            data : {
                user : newStudent,
                accessToken
            },
            httpCode : 200
        })

    } catch (error : any) {
        console.error("Signup error:" , error)
        Responder(res , {
            error : error,
            message : "Internal Server Error",
            httpCode : 500
        })
    }
}


export const refreshToken = (req : Request , res : Response) => {
    try {

        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return Responder(res, {
                message: "No refresh token provided",
                httpCode: 401
            });
        }

        // Verify the refresh token
        const decoded = verifyToken(refreshToken, 'refresh') as any;
        
        // Generating new access token 
        const accessToken = generateToken(decoded.userId , decoded.role)

        return Responder(res, {
            message: "Access token refreshed successfully",
            data: { accessToken },
            httpCode: 200
        });
        
    } catch (error : any) {
        console.error("Refresh Token Error: ", error)
        return Responder(res , {
            error : error,
            message : "Refresh Token Error",
            httpCode : 500
        })
    }
}

export const loginStudent = async (req : Request , res : Response) => {
    try {

        const { email , password } = req.body

        // checking for student existence
        const student = await findUserByEmail(email);
        if (!student) {
          return res.status(404).json({ message: "User not found" });
        } 
        
        // checking for password hash
        const isMatch = await checkPassword(password, student.password!);

        // validating
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generating tokens
        const {accessToken , refreshToken} = generateToken(student.id , student.role) 

        res.cookie('refreshToken' , refreshToken , {
            httpOnly : true,
            secure : false,
            sameSite : "lax" , 
            maxAge : 7 * 24 * 60 * 60 * 1000 ,
            path : '/',
        })
 
        const { password: _, ...studentWithoutPassword } = student;

        return Responder(res , {
            message : "Student logged-in successfully",
            data : {
                user : student,
                accessToken
            },
            httpCode : 200
        })


    } catch (error:any) {
        console.error("Login error:" , error)
        Responder(res , {
            error : error,
            message : "Internal Server Error",
            httpCode : 500
        })
    }
}