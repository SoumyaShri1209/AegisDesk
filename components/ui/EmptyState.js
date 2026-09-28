export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-10 text-center">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-brand-300" />
        </div>
      )}
      <h2 className="font-medium">{title}</h2>
      {description && (
        <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}