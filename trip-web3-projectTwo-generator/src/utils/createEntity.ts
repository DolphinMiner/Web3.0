import { ENTITY_EMPTY_VALUE } from "../constants";
import { Entity, Layer } from "../types";

const createEntity = (
  layers: Array<Layer>,
  initEntity: Entity = {}
): Entity => {
  return layers.reduce((entity, layer) => {
    return {
      ...entity,
      [layer]: initEntity[layer] || ENTITY_EMPTY_VALUE,
    };
  }, {} as Entity);
};

export default createEntity;
