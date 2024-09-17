import CryptoJS from "crypto-js";
import { DNA, Entity } from "../types";

const createDNA = (entity: Entity): DNA => {
  const hash = CryptoJS.SHA1(JSON.stringify(entity));
  const dna = hash.toString(CryptoJS.enc.Hex);
  return dna;
};

export default createDNA;
