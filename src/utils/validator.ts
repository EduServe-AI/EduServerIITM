import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  onboarded: z.boolean().optional(),
  verified: z.boolean().optional(),
  level: z.enum(["foundation", "diploma", "bsc", "bs"]).optional(),
});
