import { v4 as uuidV4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import {
  BatchPanel,
  InitPanel,
  LayerPanel,
  ManualPanel,
  OverviewPanel,
  RestrictionPanel,
  StepBar,
} from "./components";
import {
  BATCH,
  ENTITY_ACTION,
  INIT,
  LAYER,
  LSK,
  MANUAL,
  OVERVIEW,
  RESTRICTION,
  STEPS,
} from "./constants";
import { Entity, Inventory, Layer, Restriction, Style, Supply } from "./types";
import createDNA from "./utils/createDNA";
import styles from "./App.module.css";

const getInitState = () => {
  return {
    currentStep: parseInt(
      window.localStorage.getItem(LSK.CURRENT_STEP) || JSON.stringify(0)
    ),
    projectName: window.localStorage.getItem(LSK.PROJECT_NAME) || "",
    projectDesc: window.localStorage.getItem(LSK.PROJECT_DESC) || "",
    imageType: window.localStorage.getItem(LSK.IMAGE_TYPE) || "png",
    totalSupply: parseInt(
      window.localStorage.getItem(LSK.TOTAL_SUPPLY) || JSON.stringify(10)
    ),
    layers: JSON.parse(
      window.localStorage.getItem(LSK.LAYERS) || JSON.stringify(["Background"])
    ) as Array<Layer>,
    inventory: JSON.parse(
      window.localStorage.getItem(LSK.INVENTORY) || JSON.stringify({})
    ) as Inventory,
    inventorySrc: JSON.parse(
      window.localStorage.getItem(LSK.INVENTORY_SRC) || JSON.stringify({})
    ) as Inventory<string>,
    restrictions: JSON.parse(
      window.localStorage.getItem(LSK.RESTRICTIONS) || JSON.stringify([])
    ) as Array<Restriction>,
    lockedEntities: JSON.parse(
      window.localStorage.getItem(LSK.LOCKED_ENTITIES) || JSON.stringify([])
    ) as Array<Entity>,
  };
};

function syncInventoryFromLayers<T = Supply>(
  layers: Array<Layer>,
  defaultInventory: Inventory<T>
) {
  return layers.reduce((acc, curLayer) => {
    return {
      ...acc,
      [curLayer]: defaultInventory[curLayer] || {},
    };
  }, {} as Inventory<T>);
}

export default function App() {
  // ----- State for App
  // 当前阶段
  const [currentStep, setCurrentStep] = useState(getInitState().currentStep);
  // 当前阶段对应code
  const currentStepCode = useMemo(() => {
    return STEPS[currentStep].code;
  }, [currentStep]);
  // ----- State for InitPanel
  // 项目名
  const [projectName, setProjectName] = useState(getInitState().projectName);
  // 项目描述
  const [projectDesc, setProjectDesc] = useState(getInitState().projectDesc);
  // 偏移量，关系到图片起始值
  const [baseOffset, setBaseOffset] = useState(0);
  // 期望总NFT数量
  const [totalSupply, setTotalSupply] = useState(getInitState().totalSupply);
  // ----- State for LayerPanel
  // 自定义图层集和,关联图层渲染顺序,最靠前的图层最先渲染
  const [layers, setLayers] = useState<Array<Layer>>(getInitState().layers);
  // 图片类型
  const [imageType, setImageType] = useState<string>(getInitState().imageType);
  // 树: 图层-样式-库存
  const [inventory, setInventory] = useState<Inventory>(() => {
    return syncInventoryFromLayers(layers, getInitState().inventory);
  });
  // 树: 图层-样式-样式资源链接
  const [inventorySrc, setInventorySrc] = useState<Inventory<string>>(() => {
    return syncInventoryFromLayers<string>(layers, getInitState().inventorySrc);
  });
  // ----- State for RestrictionPanel
  // 自定义约束关系集和
  const [restrictions, setRestrictions] = useState<Array<Restriction>>(
    getInitState().restrictions
  );
  // ----- State for ManualPanel
  const [lockedEntities, setLockedEntities] = useState<Array<Entity>>(
    getInitState().lockedEntities
  );
  const lockedEntityDNAs = useMemo(() => {
    return lockedEntities.map((lockedEntity) => createDNA(lockedEntity));
  }, [lockedEntities]);
  const dynamicInventory = useMemo<Inventory>(() => {
    const bakInventory = JSON.parse(JSON.stringify(inventory)) as Inventory;
    return lockedEntities.reduce((_bakInventory, entity) => {
      const entityLayers = Object.keys(entity) as Array<Layer>;
      entityLayers.forEach((entityLayer) => {
        const entityLayerStyle = entity[entityLayer];
        _bakInventory[entityLayer][entityLayerStyle] -= 1;
      });

      return _bakInventory;
    }, bakInventory);
  }, [lockedEntities]);

  // TODO: State for BatchPanel

  // ----- Action: init uuid
  useEffect(() => {
    const uuid = window.localStorage.getItem(LSK.UUID);
    if (!uuid) {
      window.localStorage.setItem(LSK.UUID, uuidV4());
    }
  }, []);
  // ----- Action for App
  useEffect(() => {
    window.localStorage.setItem(LSK.CURRENT_STEP, JSON.stringify(currentStep));
  }, [currentStep]);
  // ----- Action for InitPanel
  useEffect(() => {
    window.localStorage.setItem(LSK.PROJECT_NAME, projectName);
  }, [projectName]);
  useEffect(() => {
    window.localStorage.setItem(LSK.IMAGE_TYPE, imageType);
  }, [imageType]);
  useEffect(() => {
    window.localStorage.setItem(LSK.PROJECT_DESC, projectDesc);
  }, [projectDesc]);
  useEffect(() => {
    window.localStorage.setItem(LSK.TOTAL_SUPPLY, JSON.stringify(totalSupply));
  }, [totalSupply]);
  // ----- Action for LayerPanel
  useEffect(() => {
    window.localStorage.setItem(LSK.LAYERS, JSON.stringify(layers));

    setInventory(syncInventoryFromLayers(layers, inventory));
    setInventorySrc(syncInventoryFromLayers<string>(layers, inventorySrc));
    const nextRestrictions = restrictions.filter(([r1, r2]) => {
      const [layerA] = r1.split(".");
      const [layerB] = r2.split(".");
      if (layerA !== "-" && layers.indexOf(layerA) === -1) {
        return false;
      }
      if (layerB !== "-" && layers.indexOf(layerB) === -1) {
        return false;
      }
      return true;
    });
    if (nextRestrictions.length !== restrictions.length) {
      setRestrictions(nextRestrictions);
    }
  }, [layers]);
  useEffect(() => {
    window.localStorage.setItem(LSK.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    window.localStorage.setItem(
      LSK.INVENTORY_SRC,
      JSON.stringify(inventorySrc)
    );
  }, [inventorySrc]);
  // ----- Action for RestrictionPanel
  useEffect(() => {
    window.localStorage.setItem(LSK.RESTRICTIONS, JSON.stringify(restrictions));
  }, [restrictions]);
  // ----- Action for ManualPanel
  useEffect(() => {
    window.localStorage.setItem(
      LSK.LOCKED_ENTITIES,
      JSON.stringify(lockedEntities)
    );
  }, [lockedEntities]);

  const handleStepChange = (nextStep: number) => {
    if (nextStep < currentStep) {
      console.log("rollback and refresh");
    }

    // INIT -> LAYER
    if (STEPS[currentStep].code === INIT && STEPS[nextStep].code === LAYER) {
      // 检查项目名
      if (!projectName) {
        alert("Project name should not be empty!");
        return;
      }
      // 检查项目描述
      if (!projectDesc) {
        alert("Project description should not be empty!");
        return;
      }
      // 检查库存总量
      if (!(totalSupply > 0)) {
        alert("Total supply should be larger than 0!");
        return;
      }
    }

    // LAYER -> RESTRICTION
    if (
      STEPS[currentStep].code === LAYER &&
      STEPS[nextStep].code === RESTRICTION
    ) {
      // 检查层级数量
      if (!(layers.length > 0)) {
        alert("Should have at least 1 layer!");
        return;
      }
      // 检查每个layer样式库存是否都有效:大于等于0 + 和为库存总量
      const { isValid, msg } = layers.reduce(
        (acc, curLayer) => {
          if (acc.isValid !== true) return acc;

          const curLayerStyles = Object.keys(
            inventory[curLayer] || {}
          ) as Array<Style>;
          if (curLayerStyles.length <= 0) {
            return {
              isValid: false,
              msg: `Layer - ${curLayer} has no styles!`,
            };
          }
          const { allValid, curLayerTotalSupply } = curLayerStyles.reduce(
            (acc2, curLayerStyle) => {
              const curLayerStyleSupply = inventory[curLayer][curLayerStyle];
              return {
                ...acc2,
                allValid: acc2.allValid && curLayerStyleSupply >= 0,
                curLayerTotalSupply:
                  acc2.curLayerTotalSupply + curLayerStyleSupply,
              };

              return acc2;
            },
            { allValid: true, curLayerTotalSupply: 0 }
          );
          if (!allValid) {
            return {
              isValid: false,
              msg: `The styles in Layer - ${curLayer} should all be valid! (e.g. >= 0)`,
            };
          }
          if (totalSupply !== curLayerTotalSupply) {
            return {
              isValid: false,
              msg: `The total supply in Layer - ${curLayer} should be equal to totalSupply - ${totalSupply}!`,
            };
          }
          return acc;
        },
        { isValid: true, msg: "" } as {
          isValid: boolean;
          msg: string;
        }
      );
      if (!isValid) {
        alert(msg);
        return;
      }
    }

    // RESTRICTION -> MANUAL
    if (
      STEPS[currentStep].code === RESTRICTION &&
      STEPS[nextStep].code === MANUAL
    ) {
      // 检查restriction是否都有效
      const { isValid, targetIndex } = restrictions.reduce(
        (acc, cur, index) => {
          if (acc.isValid !== true) return acc;

          if (cur.join("").indexOf("-") !== -1) {
            return {
              ...acc,
              isValid: false,
              targetIndex: index,
            };
          }
          return acc;
        },
        {
          isValid: true,
          targetIndex: -1,
        } as { isValid: boolean; targetIndex: number }
      );
      if (!isValid) {
        alert(`Please complete or delete No.${targetIndex + 1} restriction!`);
        return;
      }
    }

    // TODO:
    setCurrentStep(nextStep);
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <StepBar onStepChange={handleStepChange} currentStep={currentStep} />
      </div>
      <div className={styles.content}>
        {/* 项目初始化,设置项目及总数 */}
        {INIT === currentStepCode ? (
          <InitPanel
            projectName={projectName}
            onProjectNameChange={(v) => {
              setProjectName(v);
            }}
            projectDesc={projectDesc}
            onProjectDescChange={(v) => {
              setProjectDesc(v);
            }}
            imageType={imageType}
            onImageTypeChange={(v) => {
              setImageType(v);
            }}
            totalSupply={totalSupply}
            onTotalSupplyChange={(v) => {
              setTotalSupply(v);
              setLockedEntities([]);
            }}
            baseOffset={baseOffset}
            onBaseOffsetChange={(v) => {
              setBaseOffset(v);
            }}
          />
        ) : null}

        {/* 配置图层及对应样式的数量 */}
        {LAYER === currentStepCode ? (
          <LayerPanel
            projectName={projectName}
            layers={layers}
            onLayersChange={(v) => {
              setLayers(v);
              setLockedEntities([]);
            }}
            inventory={inventory}
            onInventoryChange={(v) => {
              setInventory(v);
              setLockedEntities([]);
            }}
            inventorySrc={inventorySrc}
            onInventorySrcChange={(v) => {
              setInventorySrc(v);
            }}
            imageType={imageType}
            onImageTypeChange={(v) => {
              setImageType(v);
            }}
          />
        ) : null}

        {/* 配置限制条件,包括依赖与互斥 */}
        {RESTRICTION === currentStepCode ? (
          <RestrictionPanel
            layers={layers}
            inventory={inventory}
            restrictions={restrictions}
            onRestrictionsChange={(v) => {
              setRestrictions(v);
              setLockedEntities([]);
            }}
          />
        ) : null}

        {/* 手动拼接 */}
        {MANUAL === currentStepCode ? (
          <ManualPanel
            layers={layers}
            lockedEntities={lockedEntities}
            dynamicInventory={dynamicInventory}
            inventorySrc={inventorySrc}
            restrictions={restrictions}
            lockedEntityDNAs={lockedEntityDNAs}
            onLock={(entity) => {
              setLockedEntities([...lockedEntities, entity]);
            }}
            onLockRelease={(entity, index) => {
              setLockedEntities(
                lockedEntities.filter((entity, idx) => idx !== index)
              );
            }}
          />
        ) : null}

        {/* 批量生成 */}
        {BATCH === currentStepCode ? (
          <BatchPanel
            layers={layers}
            lockedEntities={lockedEntities}
            dynamicInventory={dynamicInventory}
            inventorySrc={inventorySrc}
            restrictions={restrictions}
            lockedEntityDNAs={lockedEntityDNAs}
            onBatchLock={(entities) => {
              setLockedEntities([...lockedEntities, ...entities]);
            }}
            onLockRelease={(entity, index) => {
              setLockedEntities(
                lockedEntities.filter((entity, idx) => idx !== index)
              );
            }}
          />
        ) : null}

        {/* 总览及下载 */}
        {OVERVIEW === currentStepCode ? (
          <OverviewPanel
            layers={layers}
            projectName={projectName}
            projectDesc={projectDesc}
            imageType={imageType}
            baseOffset={baseOffset}
            lockedEntities={lockedEntities}
            inventorySrc={inventorySrc}
            onRelease={(from, to) => {
              if (from > lockedEntities.length - 1) {
                // 如果起始位置超过了总长度,则认为本次release无效
                return;
              }
              if (to !== undefined && to < from) {
                // 如果设置了终点位置,但是终点位置小于起始位置,则认为本次release无效
                return;
              }
              if (to === undefined) {
                // 如果没有设置终点位置,则从起始位置开始的所有元素被release
                setLockedEntities(
                  lockedEntities.filter((lockedEntity, index) => {
                    return index < from;
                  })
                );
                return;
              }
              // 如果设置了有效的终点位置,则从起始位置到终点位置的元素被release
              setLockedEntities(
                lockedEntities.filter((lockedEntity, index) => {
                  return index < from || index > to;
                })
              );
              return;
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
