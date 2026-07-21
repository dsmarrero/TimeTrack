import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-zinc-600">No existe lo que buscas.</p>
      <Link href="/dashboard" className="mt-4 inline-block underline">
        Volver al dashboard
      </Link>
    </div>
  );
}
