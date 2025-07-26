import jwt , {SignOptions} from "jsonwebtoken"
import config from "../config/constants";

export const generateToken = (userId : string , role : string) => {
   const payload  = { userId , role};

   const accessTokenOptions: SignOptions = {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };

   const refreshTokenOptions: SignOptions = {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
   };

   const accessToken = jwt.sign({ ...payload, type: 'access' }, config.JWT_SECRET_KEY as jwt.Secret , accessTokenOptions)
   const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, config.JWT_SECRET_KEY as jwt.Secret, refreshTokenOptions)

   return {
      accessToken , 
      refreshToken
   }
} 


export const verifyToken = (token : string, type : 'access' | 'refresh') => {
   try {
      
      const decoded = jwt.verify(token , config.JWT_SECRET_KEY as jwt.Secret);

      return decoded;

   } catch (error : any) {
      if (error.name === "TokenExpredError"){
         throw new Error('Token has expired!')
      }
      if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
      }
      throw error;
   }
}