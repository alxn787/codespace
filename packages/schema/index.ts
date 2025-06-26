import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(5,"Password must be at least 5 characters long").max(20,"Password must be at most 20 characters long"),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5,"Password must be at least 5 characters long").max(20,"Password must be at most 20 characters long"),
})

export const PlaygroundSchema = z.object({
  name: z.string().min(3).max(20),
  containerPort: z.number().min(1).max(65535),
  containerImage: z.string().min(3).max(20),
});