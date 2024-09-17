import { Inventory, Layer, Style } from "../types";

const getRemainedSupply = (inventory: Inventory): number => {
  const layers = Object.keys(inventory) as Array<Layer>;
  const curLayer = layers[0];
  const styleList = Object.keys(inventory[curLayer]) as Array<Style>;
  return styleList.reduce(
    (acc, curStyle) => acc + inventory[curLayer][curStyle],
    0
  );
};

export default getRemainedSupply;