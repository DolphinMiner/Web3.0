import shuffle from "./shuffle";
import type {
  Restriction,
  Inventory as InventoryCollection,
  LayerWithStyle,
  Layer,
  Inventory,
  DNA,
} from "../types";

const batchShuffle = (
  layers: Array<Layer>,
  restrictions: Array<Restriction>,
  inventory: Inventory,
  existedDNAs: Array<DNA>
) => {
  const combinationList: Array<Array<LayerWithStyle>> = [];
  const loop = (
    layers: Array<Layer>,
    restrictions: Array<Restriction>,
    inventory: Inventory
  ) => {
    const { isValid, combination, nextInventory } = shuffle(
      layers,
      restrictions,
      inventory
    );
    if (isValid) {
      combinationList.push(combination);
      loop(layers, restrictions, nextInventory);
    }
  };

  loop(layers, restrictions, inventory);

  return combinationList;
};

export default batchShuffle;
