import type { Inventory, Layer, Restriction } from "./types";

export const DEPENDENT = 1 as const;
export const EXCLUSIVE = 0 as const;
export const RELATIONSHIP = {
  DEPENDENT,
  EXCLUSIVE,
};

export const TO_DRAFT = "TO_DRAFT" as const;
export const TO_LOCKED = "TO_LOCKED" as const;
export const ENTITY_ACTION = {
  TO_DRAFT,
  TO_LOCKED,
};

// 初始化: 1. projectName; 2. totalSupply; 3. add layers and styles;
export const INIT = "INIT";
// 添加图层: 1. add layers and styles within totalSupply
export const LAYER = "LAYER";
// 添加限制: 1. add restrictions
export const RESTRICTION = "RESTRICTION";
// 手动拼接
export const MANUAL = "MANUAL";
// 批量随机
export const BATCH = "BATCH";
// 总览及导出
export const OVERVIEW = "OVERVIEW";
// 操作步骤
export const STEPS = [
  { code: INIT, text: "初始化" },
  { code: LAYER, text: "添加图层" },
  { code: RESTRICTION, text: "添加限制" },
  { code: MANUAL, text: "手动拼接" },
  { code: BATCH, text: "自动随机" },
  { code: OVERVIEW, text: "总览" },
] as const;

// keys of localStorage
export const LSK = {
  UUID: "UUID",
  CURRENT_STEP: "CURRENT_STEP",
  PROJECT_NAME: "PROJECT_NAME",
  PROJECT_DESC: "PROJECT_DESC",
  TOTAL_SUPPLY: "TOTAL_SUPPLY",
  IMAGE_TYPE: "IMAGE_TYPE",
  LAYERS: "LAYERS",
  INVENTORY: "INVENTORY",
  INVENTORY_SRC: "INVENTORY_SRC",
  RESTRICTIONS: "RESTRICTIONS",
  LOCKED_ENTITIES: "LOCKED_ENTITIES",
};

export const ENTITY_EMPTY_VALUE = "";
