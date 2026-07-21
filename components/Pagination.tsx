import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string>;
}

export default function Pagination({ page, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-2 text-sm">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={`rounded-md border border-border px-3 py-1.5 ${
          page <= 1
            ? "pointer-events-none text-foreground/30"
            : "text-foreground/70 hover:border-brand hover:text-brand"
        }`}
      >
        Anterior
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-foreground/40">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`rounded-md border px-3 py-1.5 ${
              p === page
                ? "border-brand bg-brand/10 font-medium text-brand"
                : "border-border text-foreground/70 hover:border-brand hover:text-brand"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        className={`rounded-md border border-border px-3 py-1.5 ${
          page >= totalPages
            ? "pointer-events-none text-foreground/30"
            : "text-foreground/70 hover:border-brand hover:text-brand"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
