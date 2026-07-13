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
    <form action={handleSubmit}>
      <input type="email" name="email" placeholder="Email" />
      <input type="password" name="password" placeholder="Contraseña" />
      <button type="submit" disabled={isPending}>Entrar</button>
      {error && <p>{error}</p>}
    </form>
  );
}
