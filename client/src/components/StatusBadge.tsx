export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "OUT_OF_STOCK" || status === "CANCELLED"
      ? "badge badge-danger"
      : status === "LOW_STOCK"
        ? "badge badge-warn"
        : "badge badge-ok";
  const label =
    status === "OUT_OF_STOCK"
      ? "Out of Stock"
      : status === "LOW_STOCK"
        ? "Low Stock"
        : status === "CANCELLED"
          ? "Cancelled"
          : status === "COMPLETED"
            ? "Completed"
            : "In Stock";
  return <span className={cls}>{label}</span>;
}
