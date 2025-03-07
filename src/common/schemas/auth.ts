import { z } from "zod";

export const AuthUserInfoSchema = z.object({
  isAuthenticated: z.boolean(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  roles: z.array(z.string()),
});

export type AuthUserInfoVm = z.infer<typeof AuthUserInfoSchema>;
