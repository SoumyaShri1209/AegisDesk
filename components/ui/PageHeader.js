export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-white/50 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}