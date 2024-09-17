import classNames from "classnames";
import { STEPS } from "../../constants";
import styles from "./StepBar.module.css";

export type StepBarProps = {
  currentStep: number;
  onStepChange: (nextStep: number) => void;
};

export default function StepBar({ currentStep, onStepChange }: StepBarProps) {
  return (
    <div className={styles.container}>
      {STEPS.map(({ code, text }, index) => {
        const isActive = index <= currentStep;
        const isDisable = index > currentStep + 1;
        return (
          <div
            key={code}
            onClick={() => {
              if (isDisable) {
                return;
              }
              onStepChange(index);
            }}
            className={classNames([
              styles.item,
              {
                [styles.active]: isActive,
                [styles.disable]: isDisable,
              },
            ])}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
