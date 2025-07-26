export interface UserAttributes {
    id: string;
    username: string | null;
    email: string;
    password: string | null;
    role: "student" | "instructor";
    onboarded: boolean;
    createdAt?: Date; 
    updatedAt?: Date;
}

