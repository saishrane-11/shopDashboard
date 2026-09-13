type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

export function Field({ label, value, onChange, type = "text", placeholder, required }: Props) {
  return (
    <label className="stack">
      <span>{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
