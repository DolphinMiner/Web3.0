import classNames from "classnames";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  Layer,
  Entity,
  EntityAction,
  Inventory,
  Style,
  LayerWithStyle,
  Restriction,
  DNA,
} from "../../types";
import Avatar from "../Avatar";
import LayerPreview from "../LayerPreview";
import { ENTITY_ACTION } from "../../constants";
import createOptions from "../../utils/createOptions";
import createDNA from "../../utils/createDNA";
import styles from "./ManualPanel.module.css";
import EntityDrawer from "../EntityDrawer";
import createEntity from "@/src/utils/createEntity";
import StyleSelector from "../StyleSelector";

export type ManualPanelProps = {
  layers: Array<Layer>;
  lockedEntities: Array<Entity>;
  dynamicInventory: Inventory;
  inventorySrc: Inventory<string>;
  restrictions: Array<Restriction>;
  lockedEntityDNAs: Array<DNA>;
  onLock: (entity: Entity) => void;
  onLockRelease: (entity: Entity, index: number) => void;
};

export default function ManualPanel({
  layers,
  lockedEntities,
  dynamicInventory,
  inventorySrc,
  restrictions,
  lockedEntityDNAs,
  onLock,
  onLockRelease,
}: ManualPanelProps) {
  // for LockedDrawer
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // for ManualPanel itself
  const [draftEntity, setDraftEntity] = useState<Entity>(() => {
    return createEntity(layers);
  });
  const draftEntityCombination = useMemo(() => {
    return Object.keys(draftEntity)
      .filter((entityLayer) => draftEntity[entityLayer] !== "")
      .reduce((acc, entityLayer) => {
        return [...acc, `${entityLayer}.${draftEntity[entityLayer]}`];
      }, [] as Array<LayerWithStyle>);
  }, [draftEntity]);

  const { allInvalid, allValid } = useMemo(() => {
    return Object.keys(draftEntity).reduce(
      (acc, entityLayer) => {
        const isValid = draftEntity[entityLayer] !== "";
        return {
          ...acc,
          allValid: acc.allValid && isValid,
          allInvalid: acc.allInvalid ? !isValid : acc.allInvalid,
        };
      },
      {
        allValid: true,
        allInvalid: true,
      } as {
        allValid: boolean;
        allInvalid: boolean;
      }
    );
  }, [draftEntity]);

  const handleSelectLockedEntity = (index: number) => {
    const targetEntity = lockedEntities[index];
    setDraftEntity({ ...targetEntity });
    onLockRelease(targetEntity, index);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          {layers.map((layer, index) => {
            // 所有style
            const allLayerStyles = Object.keys(
              dynamicInventory[layer]
            ) as Array<Style>;
            // 有库存的style
            const remainedLayerStyles = allLayerStyles.filter(
              (layerStyle) => dynamicInventory[layer][layerStyle] >= 1
            );
            // 基于限制条件的有库存的style
            const validLayerStyles = createOptions(
              layer,
              draftEntityCombination,
              restrictions,
              remainedLayerStyles
            );

            return (
              <div key={layer} className={styles.item}>
                <div className={styles.label}>{layer}</div>
                <StyleSelector
                  value={draftEntity[layer]}
                  onChange={(v) => {
                    setDraftEntity({ ...draftEntity, [layer]: v });
                  }}
                  onClear={() => {
                    setDraftEntity({ ...draftEntity, [layer]: "" });
                  }}
                  options={allLayerStyles.map((layerStyle) => ({
                    text: `${layerStyle} (${dynamicInventory[layer][layerStyle]})`,
                    value: layerStyle,
                    disabled: !validLayerStyles.includes(layerStyle),
                  }))}
                />
              </div>
            );
          })}
        </div>
        <div className={styles.right}>
          <div className={styles.toolbar}>
            <div className={classNames([styles.button, styles.lock])}>
              <input
                type="button"
                value="Lock"
                disabled={!allValid}
                className={classNames({ [styles.disabled]: !allValid })}
                onClick={() => {
                  const draftEntityDNA = createDNA(draftEntity);
                  const idx = lockedEntityDNAs.indexOf(draftEntityDNA);
                  if (idx !== -1) {
                    alert(`Same as No.${idx + 1} Entity in the lock area`);
                    return;
                  }
                  onLock({ ...draftEntity });
                  setDraftEntity(createEntity(layers));
                }}
              />
            </div>
            <div className={classNames([styles.button, styles.overview])}>
              <input
                type="button"
                value="Overview"
                onClick={() => {
                  setIsOpen(true);
                }}
              />
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.innerContainer}>
              <div className={styles.previewContainer}>
                {allInvalid ? (
                  <LayerPreview
                    className={styles.avatar}
                    alt="No preview"
                    src={"/unknown.png"}
                  />
                ) : (
                  <Avatar
                    className={styles.avatar}
                    entity={draftEntity}
                    layers={layers}
                    inventorySrc={inventorySrc}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <EntityDrawer
        open={isOpen}
        onClose={toggleDrawer}
        entities={lockedEntities}
        onSelectEntity={(index) => {
          if (
            confirm("Are you sure you need to edit this locked entity?") ===
            true
          ) {
            handleSelectLockedEntity(index);
          }
        }}
        layers={layers}
        inventorySrc={inventorySrc}
      />
    </>
  );
}
