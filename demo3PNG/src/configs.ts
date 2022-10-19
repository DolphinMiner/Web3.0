import pngSource from "./png";

export { default as pngSource } from "./png";

export const layers = [
  "skin",
  "accessory",
  "eye",
  "eyebrow",
  "mouth",
  "clothe",
  "hair",
  "eyeglass",
] as const;

type SuppliedAttributes = Record<string, Record<string, number>>;

export const attributes: SuppliedAttributes = {
  ...Object.keys(pngSource).reduce((layerAcc, layerName) => {
    const layerStyles = pngSource[layerName];
    return {
      ...layerAcc,
      [layerName]: Object.keys(layerStyles).reduce((styleAcc, styleName) => {
        return {
          ...styleAcc,
          [styleName]: 1,
        };
      }, {}),
    };
  }, {}),
};

const configs = {
  pngSource,
  layers,
  attributes,
};

export default configs;
