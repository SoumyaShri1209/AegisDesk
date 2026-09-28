export default function TrendBars({ title, data }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-4">{title}</h3>

      <div className="flex items-end gap-1" style={{ height: 128 }}>
        {data.map((d) => {
          const barPx = d.count > 0 ? Math.max(8, Math.round((d.count / max) * 90)) : 3;
          const label = new Date(d.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center justify-end"
              title={`${label}: ${d.count}`}
            >
              <div className="text-[10px] text-white/40 mb-1">
                {d.count > 0 ? d.count : ""}
              </div>
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${barPx}px` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-white/30 mt-2">
        <span>{formatLabel(data[0]?.date)}</span>
        <span>{formatLabel(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function formatLabel(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}