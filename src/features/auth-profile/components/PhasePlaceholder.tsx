import type { ReactNode } from 'react';

interface PhasePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  actions?: ReactNode;
  children?: ReactNode;
}

// Shared phase summary shell.
export default function PhasePlaceholder({
  eyebrow,
  title,
  description,
  items,
  actions,
  children,
}: PhasePlaceholderProps) {
  return (
    <section className="phase-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            {eyebrow}
          </p>

          <h1>{title}</h1>

          <p className="page-description">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="page-actions">
            {actions}
          </div>
        ) : null}
      </div>

      {children}

      <div className="phase-checklist-card">
        <div
          className="phase-checklist-icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <h2>
            
          </h2>

          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}