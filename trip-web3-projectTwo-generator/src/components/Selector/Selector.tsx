import { Style } from "@/src/types";
import classNames from "classnames";
import { ChangeEvent, useEffect } from "react";
import styles from "./Selector.module.css";

const presetOptionValue = "";

type OptionValue = string | number;
type Option<T extends OptionValue> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SelectorProps<T extends OptionValue> = {
  value: T | undefined;
  onChange: (value: T) => void;
  onClear?: () => void;
  options: Array<Option<T>>;
  className?: string;
  usePresetOption?: boolean;
};

function Selector<T extends OptionValue>({
  value,
  onChange,
  onClear,
  options,
  className,
  usePresetOption = true,
}: SelectorProps<T>) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { selectedIndex } = e.currentTarget;
    const index = usePresetOption ? selectedIndex - 1 : selectedIndex;
    onChange(options[index].value);
  };

  return (
    <div className={classNames([styles.selector, className])}>
      <select
        value={value === undefined ? presetOptionValue : value}
        onChange={handleChange}
      >
        {usePresetOption ? (
          <option disabled selected value={presetOptionValue}>
            -- select an option --
          </option>
        ) : null}

        {options.map(({ label, value, disabled }, index) => (
          <option key={value + "_" + index} disabled={!!disabled} value={value}>
            {label}
          </option>
        ))}
      </select>

      {usePresetOption && value !== undefined ? (
        <div
          className={styles.clear}
          onClick={() => {
            onClear && onClear();
          }}
        >
          x
        </div>
      ) : null}
    </div>
  );
}

export default Selector;
