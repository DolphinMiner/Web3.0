import { Layer, Restriction, Style } from "../types";
import { RELATIONSHIP } from "../constants";

const createOptions = (
  layer: Layer,
  existCombination: Array<string>,
  restrictions: Array<Restriction>,
  originOptions: Array<Style>
): Array<Style> => {
  const validRestrictions = restrictions
    .map<Restriction>(([v1, v2, condition]) => {
      // 将规则中的当前layer前置
      if (v2.startsWith(layer + ".")) return [v2, v1, condition];
      return [v1, v2, condition];
    })
    .filter(([v1]) => {
      // 过滤只保留与当前layer相关的规则
      if (v1.startsWith(layer + ".")) {
        return true;
      }
      return false;
    });

  // 互斥的条件集和
  const excludeRestrictions = validRestrictions.filter(
    (r) => r[2] === RELATIONSHIP.EXCLUSIVE
  );
  // 先遍历exclude规则,剔除不需要的值
  const rulesFromExclude = excludeRestrictions.reduce(
    (acc, [v1, v2]) => {
      // 判断当前规则是否需要生效
      const [curLayer, curLayerValue] = v1.split(".");
      if (existCombination.includes(v2)) {
        return {
          ...acc,
          mustNotHave: [...acc.mustNotHave, curLayerValue],
        };
      }
      return acc;
    },
    { mustNotHave: [] } as { mustNotHave: string[] }
  );

  // 依赖的条件集和
  const dependRestrictions = validRestrictions.filter(
    (r) => r[2] === RELATIONSHIP.DEPENDENT
  );
  // depend规则分两部分
  // 1. 如果existLayer中有值在规则中，则必选
  // 2. 如果existLayer中没有值在规则中，则看有没有对应layer
  // 2.1 如果有layer，则必不选
  // 2.2 如果没有layer，则可选
  const rulesFromDepend = dependRestrictions.reduce(
    (acc, [v1, v2]) => {
      const [depLayer, depLayerValue] = v2.split(".");
      const [curLayer, curLayerValue] = v1.split(".");
      if (existCombination.includes(v2)) {
        return {
          ...acc,
          mustHave: [...acc.mustHave, curLayerValue],
        };
      }

      const depLayerExist = existCombination.reduce((isDepLayerExist, cur) => {
        if (isDepLayerExist === true) return isDepLayerExist;
        return cur.startsWith(depLayer + ".");
      }, false);
      if (depLayerExist) {
        return {
          ...acc,
          mustNotHave: [...acc.mustNotHave, curLayerValue],
        };
      }

      return acc;
    },
    {
      // 因为前置条件满足必须要规定的选项
      mustHave: [],
      // 因为前置条件肯定不满足必须要排除的选项
      mustNotHave: [],
    } as { mustHave: string[]; mustNotHave: string[] }
  );

  if (rulesFromDepend.mustHave.length !== 0) {
    return rulesFromDepend.mustHave.filter((option) => {
      return (
        originOptions.includes(option) &&
        !rulesFromExclude.mustNotHave.includes(option)
      );
    });
  } else {
    return originOptions.filter((option) => {
      return (
        !rulesFromDepend.mustNotHave.includes(option) &&
        !rulesFromExclude.mustNotHave.includes(option)
      );
    });
  }
};
export default createOptions;
