// app/ui/login-form.tsx
"use client";

import { LoginFormState, login } from "@/actions/auth";
import { useActionState } from "react";

export default function LoginForm() {
  // useActionState passes the form state and handles submission
  const [state, formAction, isPending] = useActionState<
    LoginFormState,
    FormData
  >(login, {
    errors: {},
    message: "",
  });

  return (
    <form className="flex flex-col items-center justify-center  bg-blue-500" action={formAction}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        {state?.errors?.email && <p className="error">{state.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        {state?.errors?.password && (
          <p className="error">{state.errors.password}</p>
        )}
      </div>

      {/* Display a generic error message */}
      {state?.message && <p className="error">{state.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
