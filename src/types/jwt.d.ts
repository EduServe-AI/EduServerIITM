// JWT token payload structure
export interface JwtPayload {
  userId: string;
  role: "admin" | "student" | "instructor";
  iat?: number;
  exp?: number;
}

// Token types
export type TokenType = "access" | "refresh";
