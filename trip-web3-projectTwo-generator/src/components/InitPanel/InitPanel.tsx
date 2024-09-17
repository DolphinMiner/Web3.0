import { useState } from "react";
import styles from "./InitPanel.module.css";

export type InitPanelProps = {
  projectName: string;
  onProjectNameChange: (v: string) => void;
  projectDesc: string;
  onProjectDescChange: (v: string) => void;
  imageType: string;
  onImageTypeChange: (v: string) => void;
  totalSupply: number;
  onTotalSupplyChange: (v: number) => void;
  baseOffset: number;
  onBaseOffsetChange: (v: number) => void;
};

export default function InitPanel({
  projectName,
  onProjectNameChange,
  projectDesc,
  onProjectDescChange,
  imageType,
  onImageTypeChange,
  totalSupply,
  onTotalSupplyChange,
  baseOffset,
  onBaseOffsetChange,
}: InitPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <label className={styles.label} htmlFor="projectName">
          Project Name
        </label>
        <input
          className={styles.input}
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => {
            onProjectNameChange(e.target.value);
          }}
        />
      </div>
      <div className={styles.item}>
        <label className={styles.label} htmlFor="projectDesc">
          Project Description
        </label>
        <input
          className={styles.input}
          id="projectDesc"
          type="text"
          value={projectDesc}
          onChange={(e) => {
            onProjectDescChange(e.target.value);
          }}
        />
      </div>
      <div className={styles.item}>
        <label className={styles.label} htmlFor="totalSupply">
          Total Supply
        </label>
        <input
          className={styles.input}
          id="totalSupply"
          type="number"
          value={totalSupply}
          onChange={(e) => {
            onTotalSupplyChange(parseInt(e.target.value || "0"));
          }}
        />
      </div>
      <div className={styles.item}>
        <label className={styles.label} htmlFor="imageType">
          Image Type
        </label>
        <input
          className={styles.input}
          id="imageType"
          type="text"
          value={imageType}
          onChange={(e) => {
            onImageTypeChange(e.target.value);
          }}
        />
      </div>
      <div className={styles.item}>
        <label className={styles.label} htmlFor="baseOffset">
          Base Offset
        </label>
        <input
          className={styles.input}
          id="baseOffset"
          type="number"
          value={baseOffset}
          onChange={(e) => {
            onBaseOffsetChange(parseInt(e.target.value || "0"));
          }}
        />
      </div>
    </div>
  );
}
