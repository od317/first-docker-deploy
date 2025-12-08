// app/actions/auth.ts
"use server"; // Required directive[citation:2][citation:4]

import { redirect } from "next/navigation";
import { z } from "zod"; // For validation[citation:1]
import { userApi } from "@/lib/api/users/route";
import type { LoginRequest } from "@/lib/api/users/types";

// Define the validation schema for the form
const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// Define the shape of the action's state (for error handling)
export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

// The Server Action function. 'prevState' is used with useActionState.
export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If validation fails, return errors early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // 2. Call your API service with validated credentials
    const loginRequest: LoginRequest = { email, password };
    const response = await userApi.login(loginRequest); // Uses your userApi client
    console.log(response);
    // 3. (Optional) Manage the user session
    // For example, set an HTTP-only authentication cookie
    // const cookies = await import('next/headers').then(mod => mod.cookies());
    // cookies().set('session_token', response.token, { ...options });
  } catch (error) {
    // Handle API errors (e.g., wrong credentials, network issues)
    console.error("Login failed:", error);
    return {
      message: "Invalid email or password. Please try again.",
    };
  }

  // 4. Redirect on successful login
  redirect("/"); // Throws an exception to redirect[citation:2]
}
