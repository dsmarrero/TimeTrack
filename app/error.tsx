"use client";

interface ErrorProps{
  error: Error & {digest?: string};
  unstable_retry: () => void;
}
export default function Error({ error, unstable_retry }: ErrorProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 text-zinc-600">Ha ocurrido un error inesperado.</p>
      <button type="button" onClick={() => unstable_retry()} className="mt-4 underline">
        Reintentar
      </button>
    </div>
  );
}
