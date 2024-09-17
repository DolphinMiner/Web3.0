import getRemainedSupply from "@/src/utils/getRemainedSupply";
import isValidEntity from "@/src/utils/isValidEntity";
import retryBatchShuffle from "@/src/utils/retryBatchShuffle";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { ENTITY_EMPTY_VALUE } from "../../constants";
import type {
  DNA,
  Entity,
  Inventory,
  Layer,
  LayerWithStyle,
  Restriction,
  Style,
} from "../../types";
import createDNA from "../../utils/createDNA";
import createOptions from "../../utils/createOptions";
import Avatar from "../Avatar";
import EntityDrawer from "../EntityDrawer";
import LayerPreview from "../LayerPreview";
import Selector from "../Selector";
import StyleSelector from "../StyleSelector";
import styles from "./BatchPanel.module.css";

export type BatchPanelProps = {
  layers: Array<Layer>;
  lockedEntities: Array<Entity>;
  dynamicInventory: Inventory;
  inventorySrc: Inventory<string>;
  restrictions: Array<Restriction>;
  lockedEntityDNAs: Array<DNA>;
  onBatchLock: (entities: Array<Entity>) => void;
  onLockRelease: (entity: Entity, index: number) => void;
};

export default function BatchPanel({
  layers,
  lockedEntities,
  dynamicInventory,
  inventorySrc,
  restrictions,
  lockedEntityDNAs,
  onBatchLock,
  onLockRelease,
}: BatchPanelProps) {
  // for Shuffle
  const [isLoading, setIsLoading] = useState(false);
  const [shuffleTotal, setShuffleTotal] = useState(10);

  // for LockedDrawer
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // for ManualPanel itself
  const [draftEntities, setDraftEntities] = useState<Array<Entity>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const draftEntity = useMemo<Entity | undefined>(() => {
    return draftEntities[selectedIndex];
  }, [draftEntities, selectedIndex]);

  const draftEntityCombination = useMemo(() => {
    if (!draftEntity) return [];

    return Object.keys(draftEntity)
      .filter((entityLayer) => draftEntity[entityLayer] !== ENTITY_EMPTY_VALUE)
      .reduce((acc, entityLayer) => {
        return [...acc, `${entityLayer}.${draftEntity[entityLayer]}`];
      }, [] as Array<LayerWithStyle>);
  }, [draftEntity]);

  const { allInvalid, allValid } = useMemo(() => {
    if (!draftEntity) {
      return {
        allInvalid: true,
        allValid: false,
      };
    }
    return Object.keys(draftEntity).reduce(
      (acc, entityLayer) => {
        const isValid = draftEntity[entityLayer] !== ENTITY_EMPTY_VALUE;
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
    const newDraftEntities = [...draftEntities, { ...targetEntity }];
    setDraftEntities(newDraftEntities);
    setSelectedIndex(newDraftEntities.length - 1);
    onLockRelease(targetEntity, index);
    setIsOpen(false);
  };

  const remainedSupply = useMemo(
    () => getRemainedSupply(dynamicInventory),
    [dynamicInventory]
  );

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        retryBatchShuffle(
          {
            layers,
            restrictions,
            inventory: dynamicInventory,
            existedDNAs: lockedEntityDNAs,
          },
          {
            isFirst: true,
            timeout: 10000,
            total: shuffleTotal,
            preferDependent: true,
          }
        )
          .then((nextDraftEntities) => {
            setDraftEntities(nextDraftEntities);
            setSelectedIndex(-1);
          })
          .catch((e) => {
            console.log("retryBatchShuffle.e", e);
            alert(
              `Failed to shuffle! Please check the supply and restrictions!`
            );
          })
          .then(() => {
            setIsLoading(false);
          });
      }, 0);
    }
  }, [isLoading]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.previewContainer}>
            {draftEntities[selectedIndex] ? (
              <Avatar
                entity={draftEntities[selectedIndex]}
                layers={layers}
                inventorySrc={inventorySrc}
                className={styles.avatar}
              />
            ) : (
              <LayerPreview
                className={styles.avatar}
                width={200}
                height={200}
                alt="No preview"
                src={"/unknown.png"}
              />
            )}
          </div>
          {draftEntity
            ? layers.map((layer, index) => {
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
                        setDraftEntities(
                          draftEntities.map((draftEntity, index) => {
                            if (index === selectedIndex) {
                              return {
                                ...draftEntity,
                                [layer]: v,
                              };
                            }
                            return draftEntity;
                          })
                        );
                      }}
                      onClear={() => {
                        setDraftEntities(
                          draftEntities.map((draftEntity, index) => {
                            if (index === selectedIndex) {
                              return {
                                ...draftEntity,
                                [layer]: ENTITY_EMPTY_VALUE,
                              };
                            }
                            return draftEntity;
                          })
                        );
                      }}
                      options={allLayerStyles.map((layerStyle) => ({
                        text: `${layerStyle} (${dynamicInventory[layer][layerStyle]})`,
                        value: layerStyle,
                        disabled: !validLayerStyles.includes(layerStyle),
                      }))}
                    />
                  </div>
                );
              })
            : null}
        </div>
        <div className={styles.right}>
          <div className={styles.toolbar}>
            <Selector<number>
              className={classNames([styles.selector, styles.shuffleTotal])}
              value={shuffleTotal}
              onChange={(v) => {
                setShuffleTotal(v);
              }}
              options={[1, 5, 10, 20, 50, 100].map((v) => ({
                label: v + "",
                value: v,
              }))}
              usePresetOption={false}
            />
            <div className={classNames([styles.button, styles.shuffle])}>
              <input
                type="button"
                value="Shuffle"
                disabled={remainedSupply === 0 || isLoading}
                className={classNames({
                  [styles.disabled]: remainedSupply === 0 || isLoading,
                })}
                onClick={() => {
                  setIsLoading(true);
                }}
              />
            </div>
            <div className={classNames([styles.button, styles.singleLock])}>
              <input
                type="button"
                value="Single Lock"
                disabled={
                  isLoading || !draftEntity || !isValidEntity(draftEntity)
                }
                className={classNames({
                  [styles.disabled]:
                    isLoading || !draftEntity || !isValidEntity(draftEntity),
                })}
                onClick={() => {
                  // 校验当前是否存在选中entity
                  if (!draftEntity) {
                    alert("Please select one entity first!");
                    return;
                  }
                  // 校验单个entity是否valid
                  if (!isValidEntity(draftEntity)) {
                    alert(
                      "The selected entity is invalid, please complete the style selection!"
                    );
                    return;
                  }
                  // 校验当前entity是否和lockedEntities中DNA存在重合
                  const curDNA = createDNA(draftEntity);
                  const curIndex = lockedEntityDNAs.indexOf(curDNA);
                  if (curIndex !== -1) {
                    alert(
                      `The selected entity is duplicate to No.${curIndex} lockedEntity!`
                    );
                    return;
                  }

                  onBatchLock([{ ...draftEntity }]);
                  setDraftEntities(
                    draftEntities.filter((entity) => entity !== draftEntity)
                  );
                  setSelectedIndex(-1);
                }}
              />
            </div>
            <div className={classNames([styles.button, styles.batchLock])}>
              <input
                type="button"
                value="Batch Lock"
                disabled={isLoading || draftEntities.length === 0}
                className={classNames({
                  [styles.disabled]: isLoading || draftEntities.length === 0,
                })}
                onClick={() => {
                  // check all entities are valid
                  const validResult = draftEntities.reduce(
                    (acc, curEntity, index) => {
                      if (!acc.isValid) return acc;
                      if (!isValidEntity(curEntity)) {
                        return {
                          ...acc,
                          isValid: false,
                          invalidIndex: index,
                        };
                      }
                      return acc;
                    },
                    {
                      isValid: true,
                      invalidIndex: -1,
                    } as { isValid: boolean; invalidIndex: number }
                  );
                  if (!validResult.isValid) {
                    alert(
                      `No.${
                        validResult.invalidIndex + 1
                      } draft entity is invalid, please complete selection.`
                    );
                    return;
                  }

                  // check all draftEntities are unique
                  const dnaCollection: Record<DNA, number> = {};
                  const uniqueDraftResult = draftEntities.reduce(
                    (acc, curEntity, index) => {
                      if (!acc.isValid) return acc;
                      const curDNA = createDNA(curEntity);
                      if (dnaCollection[curDNA] !== undefined) {
                        return {
                          ...acc,
                          isValid: false,
                          invalidIndexes: [dnaCollection[curDNA], index],
                        };
                      }
                      dnaCollection[curDNA] = index;
                      return acc;
                    },
                    {
                      isValid: true,
                      invalidIndexes: [],
                    } as {
                      isValid: boolean;
                      invalidIndexes: number[];
                    }
                  );
                  if (!uniqueDraftResult.isValid) {
                    alert(
                      `No.${
                        uniqueDraftResult.invalidIndexes[0] + 1
                      } draftEntity is duplicate to No.${
                        uniqueDraftResult.invalidIndexes[1] + 1
                      } draftEntity!`
                    );
                    return;
                  }

                  // check all draftEntities are unique with lockedEntities
                  const uniqueResult = draftEntities.reduce(
                    (acc, curEntity, index) => {
                      if (!acc.isValid) return acc;
                      const curDNA = createDNA(curEntity);
                      const targetIndex = lockedEntityDNAs.indexOf(curDNA);
                      if (targetIndex !== -1) {
                        return {
                          ...acc,
                          isValid: false,
                          invalidIndexes: [index, targetIndex],
                        };
                      }
                      return acc;
                    },
                    { isValid: true, invalidIndexes: [] } as {
                      isValid: boolean;
                      invalidIndexes: number[];
                    }
                  );
                  if (!uniqueResult.isValid) {
                    alert(
                      `No.${
                        uniqueResult.invalidIndexes[0] + 1
                      } draftEntity is duplicate to No.${
                        uniqueResult.invalidIndexes[1] + 1
                      } lockedEntity!`
                    );
                    return;
                  }

                  onBatchLock([...draftEntities]);
                  setDraftEntities([]);
                  setSelectedIndex(-1);
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
              {isLoading ? <div>Loading...</div> : null}

              {!isLoading && draftEntities.length === 0 ? (
                <div>Try to click Shuffle button!</div>
              ) : null}

              {!isLoading &&
                draftEntities.map((entity, index) => {
                  return (
                    <div
                      key={createDNA(entity) + index}
                      className={classNames([
                        styles.previewContainer,
                        { [styles.selected]: selectedIndex === index },
                      ])}
                      onClick={() => {
                        if (index !== selectedIndex) {
                          setSelectedIndex(index);
                        } else {
                          setSelectedIndex(-1);
                        }
                      }}
                    >
                      <Avatar
                        entity={entity}
                        layers={layers}
                        inventorySrc={inventorySrc}
                        className={styles.avatar}
                      />
                    </div>
                  );
                })}
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
