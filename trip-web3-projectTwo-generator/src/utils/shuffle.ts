import { RELATIONSHIP } from "../constants";
import type {
  Inventory,
  Layer,
  LayerWithStyle,
  Restriction,
  Style,
} from "../types";
import createOptions from "./createOptions";

function random(total: number) {
  return Math.floor(Math.random() * total);
}
const shuffle = (
  layers: Array<Layer>,
  restrictions: Array<Restriction>,
  inventory: Inventory,
  preferDependent?: boolean
) => {
  const dependentCollection = restrictions.reduce(
    (acc, [r1, r2, relationship]) => {
      if (relationship === RELATIONSHIP.DEPENDENT) {
        const [layer1, style1] = r1.split(".");
        const [layer2, style2] = r2.split(".");
        return {
          ...acc,
          [layer1]: acc[layer1] ? [...acc[layer1], style1] : [style1],
          [layer2]: acc[layer2] ? [...acc[layer2], style2] : [style2],
        };
      }
      return acc;
    },
    {} as Record<Layer, Array<Style>>
  );
  const { isValid, combination } = layers.reduce(
    (acc, curLayer) => {
      if (acc.isValid !== true) return acc;

      const layerInventory = inventory[curLayer];
      const optionsWithSupply = Object.keys(layerInventory).filter(
        (style) => layerInventory[style] > 0
      );
      let originOptions: Array<Style> = optionsWithSupply;
      // TODO: 如果存在多个纬度的限制条件,那么只生效一个纬度, 否则会集中在前期批次
      // e.g.
      // 有两个规则 [Clothe.King, Body.gold, 1] 和 [Ornament.K6, Face.Empty, 1]
      // 如果已经优先过一组,如存在了Clothe.King,那么Ornament和Face不考虑优先
      const hasPreferDependent = acc.combination.reduce(
        (_hasPreferDependent, value) => {
          if (_hasPreferDependent) return _hasPreferDependent;
          const [existLayer, existLayerStyle] = value.split(".");
          return (
            !!dependentCollection[existLayer] &&
            dependentCollection[existLayer].includes(existLayerStyle)
          );
        },
        false
      );
      if (
        !hasPreferDependent &&
        preferDependent &&
        dependentCollection[curLayer]
      ) {
        // 需要依赖优先且当前layer存在依赖限制
        originOptions = optionsWithSupply.filter((option) =>
          dependentCollection[curLayer].includes(option)
        );
        if (originOptions.length === 0) {
          // 基于依赖优先的可选项已经全部消耗完,使用基于库存的选项
          originOptions = optionsWithSupply;
        }
      }
      const options = createOptions(
        curLayer,
        acc.combination,
        restrictions,
        originOptions
      );
      if (options.length === 0) {
        return {
          ...acc,
          isValid: false,
        };
      }
      // TODO: 基于库存的随机
      // 1. 获取所有options对应库存总和total
      // 2. 从total中随机一个数n(0~total-1)
      // 3. 判断
      const supplyInfo = options.reduce(
        (acc, curStyle) => {
          const curStyleSupply = inventory[curLayer][curStyle];
          return {
            ...acc,
            total: acc.total + curStyleSupply,
            scope: {
              ...acc.scope,
              [curStyle]: [acc.total, acc.total + curStyleSupply - 1] as [
                number,
                number
              ],
            },
          };
        },
        {
          total: 0,
          scope: {},
        } as { total: number; scope: Record<Style, [number, number]> }
      );
      const randomIndex = random(supplyInfo.total);
      const curStyle = options.reduce((acc, curOption) => {
        if (acc !== null) return acc;
        if (
          randomIndex >= supplyInfo.scope[curOption][0] &&
          randomIndex <= supplyInfo.scope[curOption][1]
        ) {
          return curOption;
        }
        return acc;
      }, null);
      return {
        ...acc,
        combination: [...acc.combination, `${curLayer}.${curStyle}`],
      };
    },
    { isValid: true, combination: [] } as {
      isValid: boolean;
      combination: Array<LayerWithStyle>;
    }
  );
  const nextInventory: Inventory = JSON.parse(JSON.stringify(inventory));
  if (isValid) {
    // e.g. [['hair', 'gold'], ['skin', 'black']]
    const layerWithStyleList = combination.map((layerWithStyle) => {
      return layerWithStyle.split(".");
    });
    layerWithStyleList.forEach(([layer, style]) => {
      nextInventory[layer][style] = nextInventory[layer][style] - 1;
    });
  }
  return {
    isValid,
    combination,
    nextInventory,
  };
};

export default shuffle;
