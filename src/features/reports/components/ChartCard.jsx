export function ChartCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div
      className={`bg-surface border border-default rounded-2xl p-5 shadow-card animate-fade-up ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-h3 text-primary">{title}</h3>
          {subtitle && <p className="text-caption text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
