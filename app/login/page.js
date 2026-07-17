'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData) {
    setError(null);
    setIsPending(true);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const result = await login(idToken);
      if (result.error) {
        setError(result.error);
        setIsPending(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Email o contraseña incorrectos");
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        action={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm"
      >
        <h1 className="mb-1 text-2xl font-semibold text-foreground">TimeTrack</h1>
        <p className="mb-6 text-sm text-foreground/60">Inicia sesión para registrar tu tiempo</p>

        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-md bg-brand py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
