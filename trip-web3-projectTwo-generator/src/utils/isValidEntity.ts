import { ENTITY_EMPTY_VALUE } from "../constants";
import { Entity, Layer } from "../types";

const isValidEntity = (entity: Entity, layers?: Array<Layer>) => {
  return (layers || Object.keys(entity)).reduce((acc, curLayer) => {
    if (!acc) return acc;
    return entity[curLayer] !== ENTITY_EMPTY_VALUE;
  }, true);
};

export default isValidEntity;
