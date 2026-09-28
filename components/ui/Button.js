export default function Button({
  variant = "primary",
  size = "md",
  as: As = "button",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white",
    secondary: "border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/80",
    ghost: "hover:bg-white/5 text-white/70 hover:text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
  };

  return (
    <As
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}