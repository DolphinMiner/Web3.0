import { Entity, Inventory, Layer } from "../types";
import mergeImages, { ReturnDataType } from "./mergeImages";

const convertTo = (
  entity: Entity,
  layers: Array<Layer>,
  inventorySrc: Inventory<string>,
  rtn: ReturnDataType = "dataURL"
) => {
  const sources = layers
    .map((curLayer) => {
      const curStyle = entity[curLayer];
      const source = inventorySrc[curLayer][curStyle];
      return source;
    })
    .filter((v) => !!v);

  return mergeImages(sources, { rtn });
};

export default convertTo;
