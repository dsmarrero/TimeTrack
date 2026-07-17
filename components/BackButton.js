"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm font-medium text-foreground/70 transition-colors hover:text-brand"
    >
      ← Volver
    </button>
  );
}
