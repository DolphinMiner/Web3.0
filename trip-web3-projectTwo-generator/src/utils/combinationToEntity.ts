import { Entity, Layer, LayerWithStyle } from "../types";
import createEntity from "./createEntity";

// input:  ['Background.black', 'Skin.eee', 'Eye.brown'] + ['Background', 'Skin']
// output: {Background: 'black', Skin: 'eee'}
const combinationToEntity = (
  combination: Array<LayerWithStyle>,
  layers: Array<Layer>
): Entity => {
  const initEntity = combination.reduce((acc, cur) => {
    const [layer, style] = cur.split(".");
    return {
      ...acc,
      [layer]: style,
    };
  }, {} as Entity);
  return createEntity(layers, initEntity);
};

export default combinationToEntity;
