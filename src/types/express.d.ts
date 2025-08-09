declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: "admin" | "student" | "instructor";
  }
}

export {};
