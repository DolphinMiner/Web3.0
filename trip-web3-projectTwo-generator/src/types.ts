import { DEPENDENT, EXCLUSIVE, TO_DRAFT, TO_LOCKED } from "./constants";

// e.g. 'hair'
export type Layer = string;
// e.g. 'gold'
export type Style = string;
// e.g. 20
export type Supply = number;
export type Inventory<T = Supply> = Record<Layer, Record<Style, T>>;

// e.g. 'hair.gold'
export type LayerWithStyle = string;
export type Relationship = typeof DEPENDENT | typeof EXCLUSIVE;
export type Restriction = [LayerWithStyle, LayerWithStyle, Relationship];
export type DNA = string;

export type Entity = Record<Layer, Style>;
export type EntityAction = typeof TO_DRAFT | typeof TO_LOCKED;
