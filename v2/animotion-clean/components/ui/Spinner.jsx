export default function Spinner({ size = 10 }) {
  return (
    <div
      className="rounded-full border-4 border-primary-light border-t-primary animate-spin"
      style={{ width: size * 4, height: size * 4 }}
      role="status"
      aria-label="Loading"
    />
  );
}
