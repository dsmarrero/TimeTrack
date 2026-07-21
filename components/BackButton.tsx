"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(): void => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-brand"
    >
      <IconArrowLeft size={16} stroke={2.5} />
      Volver
    </button>
  );
}