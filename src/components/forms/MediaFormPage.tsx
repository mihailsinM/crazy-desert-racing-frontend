import type { ReactNode } from "react";

type MediaFormPageProps = {
  children: ReactNode;
};

function MediaFormPage({ children }: MediaFormPageProps) {
  return (
    <section className="du-page du-viewport-page">
      <section className="du-form-panel du-form-panel-media du-panel">
        <div className="du-form-content-scroll du-scroll-large">{children}</div>
      </section>
    </section>
  );
}

export default MediaFormPage;
