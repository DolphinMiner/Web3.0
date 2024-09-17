import { Style } from "@/src/types";
import classNames from "classnames";
import styles from "./StyleSelector.module.css";

export type StyleSelectorProps = {
  value: Style;
  onChange: (value: Style) => void;
  onClear?: () => void;
  options: Array<{
    text: string;
    value: Style;
    disabled?: boolean;
  }>;
  className?: string;
};
function StyleSelector({
  value,
  onChange,
  onClear,
  options,
  className,
}: StyleSelectorProps) {
  return (
    <div className={classNames([styles.selector, className])}>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        <option disabled selected value="">
          -- select an option --
        </option>
        {options.map(({ text, value, disabled }) => (
          <option key={value} disabled={!!disabled} value={value}>
            {text}
          </option>
        ))}
      </select>
      {value && onClear ? (
        <div
          className={styles.clear}
          onClick={() => {
            onClear();
          }}
        >
          x
        </div>
      ) : null}
    </div>
  );
}

export default StyleSelector;
