interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function LoadingSpinner({
  size = "medium",
  color = "#FF69B4",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      class={`${sizeClasses[size]} animate-spin rounded-full border-3 border-t-transparent`}
      style={{
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
}