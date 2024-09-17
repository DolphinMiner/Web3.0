import { RELATIONSHIP } from "../../constants";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import {
  Inventory,
  Layer,
  Relationship,
  Restriction,
  Style,
} from "../../types";
import styles from "./RestrictionPanel.module.css";

export type RestrictionPanelProps = {
  layers: Array<Layer>;
  inventory: Inventory;
  restrictions: Array<Restriction>;
  onRestrictionsChange: (v: Array<Restriction>) => void;
};
type Rule = {
  layerA: string;
  styleA: string;
  layerB: string;
  styleB: string;
  relationship: Relationship;
};

const getLayerStyles = (layer: Layer, inventory: Inventory): Array<Style> =>
  Object.keys(inventory[layer] || {});

const relationshipOptions: Array<{ value: Relationship; text: string }> = [
  { value: RELATIONSHIP.DEPENDENT, text: "Dependent" },
  { value: RELATIONSHIP.EXCLUSIVE, text: "Exclusive" },
];

const createRule = (initRule?: Rule): Rule => ({
  layerA: "",
  styleA: "",
  layerB: "",
  styleB: "",
  relationship: RELATIONSHIP.DEPENDENT,
  ...(initRule || {}),
});

type SelectorProps<T extends string | Relationship = string> = {
  value: T;
  onChange: (v: string) => void;
  options: Array<{ text: string | Relationship; value: T }>;
  className?: string;
};
function Selector<T extends string | Relationship = string>({
  value,
  onChange,
  options,
  className,
}: SelectorProps<T>) {
  return (
    <div className={className}>
      <select
        name="selector"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        <option disabled selected value="">
          -- select an option --
        </option>
        {options.map(({ text, value: v }) => (
          <option selected={v === value} key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

const ruleToRestriction = ({
  layerA,
  styleA,
  layerB,
  styleB,
  relationship,
}: Rule): Restriction => {
  return [
    `${layerA || "-"}.${styleA || "-"}`,
    `${layerB || "-"}.${styleB || "-"}`,
    relationship,
  ];
};
const restrictionToRule = (restriction: Restriction): Rule => {
  const [r1, r2, relationship] = restriction;
  const [layerA, styleA] = r1.split(".");
  const [layerB, styleB] = r2.split(".");
  return createRule({
    layerA: layerA === "-" ? "" : layerA,
    styleA: styleA === "-" ? "" : styleA,
    layerB: layerB === "-" ? "" : layerB,
    styleB: styleB === "-" ? "" : styleB,
    relationship,
  });
};

export default function RestrictionPanel({
  layers,
  inventory,
  restrictions,
  onRestrictionsChange,
}: RestrictionPanelProps) {
  const [rules, setRules] = useState<Array<Rule>>(() => {
    return restrictions.map(restrictionToRule);
  });
  useEffect(() => {
    const nextRestrictions = rules.map(ruleToRestriction);
    onRestrictionsChange(nextRestrictions);
  }, [rules]);

  if (layers.length <= 1) {
    return (
      <div className={styles.container}>
        Restrictions can be added when there are at least 2 layers
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.combination}>
          <div className={classNames([styles.layer, styles.title])}>Layer</div>
          <div className={classNames([styles.dot, styles.title])}></div>
          <div className={classNames([styles.style, styles.title])}>Style</div>
        </div>

        <div className={classNames([styles.and, styles.title])}></div>

        <div className={styles.combination}>
          <div className={classNames([styles.layer, styles.title])}>Layer</div>
          <div className={classNames([styles.dot, styles.title])}></div>
          <div className={classNames([styles.style, styles.title])}>Style</div>
        </div>

        <div className={classNames([styles.relationship, styles.title])}>
          Relationship
        </div>
        <div className={styles.button}>
          <input
            type="button"
            onClick={() => {
              setRules([...rules, createRule()]);
            }}
            value="Create"
          />
        </div>
      </div>

      {rules.map(
        ({ layerA, styleA, layerB, styleB, relationship }, idxOfRule) => {
          return (
            <div key={idxOfRule} className={styles.item}>
              <div className={styles.combination}>
                <Selector
                  className={styles.layer}
                  value={layerA}
                  onChange={(v) => {
                    setRules(
                      rules.map((rule, idx) => {
                        if (idxOfRule === idx) {
                          return {
                            ...rule,
                            layerA: v,
                            // check if need to cleanup the related style
                            styleA: v === rule.layerA ? rule.styleA : "",
                          };
                        }
                        return rule;
                      })
                    );
                  }}
                  options={layers.map((v) => ({
                    text: v,
                    value: v,
                  }))}
                />
                <div className={styles.dot}>.</div>
                <Selector
                  className={styles.style}
                  value={styleA}
                  onChange={(v) => {
                    setRules(
                      rules.map((rule, idx) => {
                        if (idxOfRule === idx) {
                          return {
                            ...rule,
                            styleA: v,
                          };
                        }
                        return rule;
                      })
                    );
                  }}
                  options={Object.keys(inventory[layerA] || {}).map((v) => ({
                    text: v,
                    value: v,
                  }))}
                />
              </div>

              <div className={styles.and}>AND</div>
              <div className={styles.combination}>
                <Selector
                  className={styles.layer}
                  value={layerB}
                  onChange={(v) => {
                    setRules(
                      rules.map((rule, idx) => {
                        if (idxOfRule === idx) {
                          return {
                            ...rule,
                            layerB: v,
                            // check if need to cleanup the related style
                            styleB: v === rule.layerB ? rule.styleB : "",
                          };
                        }
                        return rule;
                      })
                    );
                  }}
                  options={layers.map((v) => ({
                    text: v,
                    value: v,
                  }))}
                />
                <div className={styles.dot}>.</div>
                <Selector
                  className={styles.style}
                  value={styleB}
                  onChange={(v) => {
                    setRules(
                      rules.map((rule, idx) => {
                        if (idxOfRule === idx) {
                          return {
                            ...rule,
                            styleB: v,
                          };
                        }
                        return rule;
                      })
                    );
                  }}
                  options={Object.keys(inventory[layerB] || {}).map((v) => ({
                    text: v,
                    value: v,
                  }))}
                />
              </div>

              <Selector<Relationship>
                className={styles.relationship}
                value={relationship}
                onChange={(v) => {
                  setRules(
                    rules.map((rule, idx) => {
                      if (idxOfRule === idx) {
                        return {
                          ...rule,
                          relationship: parseInt(v) as Relationship,
                        };
                      }
                      return rule;
                    })
                  );
                }}
                options={relationshipOptions}
              />
              <div className={styles.button}>
                <input
                  type="button"
                  onClick={() => {
                    setRules(rules.filter((v, idx) => idx !== idxOfRule));
                  }}
                  value="Delete"
                />
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
