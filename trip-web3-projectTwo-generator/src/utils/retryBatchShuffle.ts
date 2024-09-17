import {
  DNA,
  Entity,
  Inventory,
  Layer,
  LayerWithStyle,
  Restriction,
} from "../types";
import combinationToEntity from "./combinationToEntity";
import createDNA from "./createDNA";
import getRemainedSupply from "./getRemainedSupply";
import shuffle from "./shuffle";

const CACHE = {
  start: 0,
  end: 0,
  results: [],
  timeout: 0,
  remained: 0,
  preferDependent: false,
} as {
  start: number;
  end: number;
  results: Array<Entity>;
  timeout: number;
  remained: number;
  preferDependent: boolean;
  total?: number;
};

type Payload = {
  layers: Array<Layer>;
  restrictions: Array<Restriction>;
  inventory: Inventory;
  existedDNAs: Array<DNA>;
};

type Option = {
  isFirst: boolean;
  timeout: number; // 超时时间 ms
  total?: number; // 期望生成数量
  preferDependent?: boolean; // 依赖优先
};

const loop = (
  { layers, restrictions, inventory, existedDNAs }: Payload,
  preferDependent?: boolean
) => {
  const { isValid, combination, nextInventory } = shuffle(
    layers,
    restrictions,
    inventory,
    preferDependent
  );
  // 当前生成成功
  if (isValid) {
    const entity = combinationToEntity(combination, layers);
    const dna = createDNA(entity);
    // 校验DNA有效
    const dnaIsExist = existedDNAs.includes(dna);
    if (!dnaIsExist) {
      const nextExistedDNAs = [...existedDNAs, dna];
      CACHE.results.push(entity);
      if (
        CACHE.total !== undefined &&
        CACHE.total !== CACHE.results.length &&
        CACHE.remained !== CACHE.results.length
      ) {
        loop(
          {
            layers,
            restrictions,
            inventory: nextInventory,
            existedDNAs: nextExistedDNAs,
          },
          preferDependent
        );
      }
    }
  }

  return CACHE.results;
};

const retryBatchShuffle = (
  payload: Payload,
  option?: Option
): Promise<Array<Entity>> => {
  if (option && option.isFirst) {
    CACHE.remained = getRemainedSupply(payload.inventory);
    CACHE.results = [];
    CACHE.timeout = option.timeout;
    CACHE.start = new Date().getTime();
    CACHE.preferDependent = !!option.preferDependent;
    if (option.total !== undefined) {
      CACHE.total = option.total;
    }
  }
  return new Promise<Array<Entity>>((resolve) => {
    return resolve(loop(payload, CACHE.preferDependent));
  }).then((results) => {
    const end = new Date().getTime();
    if (end - CACHE.start > CACHE.timeout) {
      return Promise.reject("Timeout");
    }

    if (CACHE.remained === results.length) {
      return Promise.resolve(results);
    }

    if (CACHE.total !== undefined && CACHE.total === results.length) {
      return Promise.resolve(results);
    }

    // Retry
    CACHE.results = [];
    return retryBatchShuffle(payload);
  });
};

export default retryBatchShuffle;
