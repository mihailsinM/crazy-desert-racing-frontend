import type { ReactNode } from "react";

type CatalogPageProps = {
  children: ReactNode;
};

// Shared viewport shell for searchable directories and activity feeds.
function CatalogPage({ children }: CatalogPageProps) {
  return (
    <section className="du-page du-viewport-page du-catalog-page">
      {children}
    </section>
  );
}

export default CatalogPage;
