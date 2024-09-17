const fs = require("fs");
const path = require("path");
const DATA = require("./data.js");

// 总量
const TOTAL = 1800;
// 波动率
const RANDOM_RATE = 10;

const writeFile = (field, content) => {
  const filename = path.join(__dirname, `${field}.json`);
  fs.writeFileSync(filename, JSON.stringify(content));
};

const getRandom = (max) => {
  const x = Math.floor(Math.random() * max);
  return x;
};

const getRandomSupply = (supply, rate) => {
  const random = getRandom(rate * 2) - rate;
  const randomSupply = supply + random;
  return randomSupply;
};

const baseHandler = ({ fields, average, randomRate, max }) => {
  return fields.reduce(
    (acc, cur, curIndex) => {
      if (max !== undefined && curIndex === fields.length - 1) {
        return {
          attributes: {
            ...acc.attributes,
            [cur]: max - acc.total,
          },
          total: max,
        };
      }

      const randomSupply = getRandomSupply(average, randomRate);
      return {
        attributes: {
          ...acc.attributes,
          [cur]: randomSupply,
        },
        total: acc.total + randomSupply,
      };
    },
    { attributes: {}, total: 0 }
  );
};

const skinHandler = ({ total, attributeName, preset }) => {
  const skinLv1 = {
    fields: ["Flame"],
    randomRate: RANDOM_RATE,
    totalRate: 1,
  };
  const skinLv2 = {
    fields: [
      "BluePlushToy",
      "Golden",
      "Liquid",
      "Metal",
      "Stone",
      "Wood",
      "YellowPlushToy",
    ],
    randomRate: RANDOM_RATE,
    totalRate: 9,
  };
  const skinLv3 = {
    fields: [
      "AlwaysBlue",
      "AnotherFlavor",
      "Khaki",
      "KillerWhale",
      "RedPineForest",
      "ToughGuy",
      "Wild",
      "WildMushroom",
    ],
    randomRate: RANDOM_RATE,
    totalRate: 90,
  };

  const supplyLv1 = baseHandler({
    ...skinLv1,
    average: Math.floor(
      (total * skinLv1.totalRate) / 100 / skinLv1.fields.length
    ),
  });
  const supplyLv2 = baseHandler({
    ...skinLv2,
    average: Math.floor(
      (total * skinLv2.totalRate) / 100 / skinLv2.fields.length
    ),
  });
  const specialSupply = supplyLv1.total + supplyLv2.total;
  const normalSupply = total - specialSupply;

  const supplyLv3 = baseHandler({
    ...skinLv3,
    average: Math.floor(normalSupply / skinLv3.fields.length),
    max: normalSupply,
  });
  return {
    attributes: {
      ...supplyLv1.attributes,
      ...supplyLv2.attributes,
      ...supplyLv3.attributes,
    },
    total: {
      special: supplyLv1.total + supplyLv2.total,
      normal: supplyLv3.total,
    },
  };
};

const emojiHandler = ({ total, preset, attributeName }) => {
  const presetFields = Object.keys(preset);
  const remainFields = Object.keys(DATA[attributeName]).filter(
    (v) => !presetFields.includes(v)
  );

  const presetSupply = presetFields.reduce((acc, cur) => {
    return acc + preset[cur];
  }, 0);
  const remainSupply = total - presetSupply;
  console.log(presetFields);
  console.log(remainFields);
  console.log(presetSupply);
  console.log(remainSupply);
  const result = baseHandler({
    fields: remainFields,
    randomRate: RANDOM_RATE,
    average: Math.floor(remainSupply / remainFields.length),
    max: remainSupply,
  });

  return {
    attributes: {
      ...preset,
      ...result.attributes,
    },
    total: total,
  };
};

const normalHandler = ({ total, attributeName, preset }) => {
  const fields = Object.keys(DATA[attributeName]);
  const result = baseHandler({
    fields,
    randomRate: RANDOM_RATE,
    average: Math.floor(total / fields.length),
    max: total,
  });
  return result;
};

const HANDLER_MAP = {
  Background: normalHandler,
  Body: normalHandler,
  Head: normalHandler,
  Item: normalHandler,
  Skin: skinHandler,
  Emoji: emojiHandler,
};
const handler = (total, attributeName, preset = {}) => {
  const result = HANDLER_MAP[attributeName]({ total, attributeName, preset });
  writeFile(attributeName, result.attributes);
  console.log(attributeName, result);
  return result;
};

handler(TOTAL, "Background");
// handler(TOTAL, "Body");
// handler(TOTAL, "Item");
// handler(TOTAL, "Head");
// const skinResult = handler(TOTAL, "Skin");
// handler(TOTAL, "Emoji", {
//   None: skinResult.total.special,
// });
