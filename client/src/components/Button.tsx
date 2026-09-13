type Props = {
  children: string;
  type?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  htmlType?: "button" | "submit";
  block?: boolean;
};

export function Button({
  children,
  type = "primary",
  onClick,
  disabled,
  htmlType = "button",
  block,
}: Props) {
  return (
    <button
      type={htmlType}
      className={`btn btn-${type}`}
      onClick={onClick}
      disabled={disabled}
      style={block ? { width: "100%" } : undefined}
    >
      {children}
    </button>
  );
}
