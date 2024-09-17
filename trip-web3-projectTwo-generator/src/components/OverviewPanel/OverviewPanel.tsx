import { Entity, Inventory, Layer } from "@/src/types";
import download, { DownloadConfig, DownloadSource } from "@/src/utils/download";
import classNames from "classnames";
import promiseList from "promise-limit";
import { useMemo, useState } from "react";
import styles from "./OverviewPanel.module.css";

const limit = promiseList<boolean>(1);

export type OverviewPanelProps = {
  projectName: string;
  projectDesc: string;
  imageType: string;
  baseOffset: number;
  layers: Array<Layer>;
  lockedEntities: Array<Entity>;
  inventorySrc: Inventory<string>;
  onRelease?: (from: number, to?: number) => void;
};

const PER_BATCH = 100;
const OverviewPanel = ({
  projectName,
  projectDesc,
  imageType,
  baseOffset,
  layers,
  lockedEntities,
  inventorySrc,
  onRelease,
}: OverviewPanelProps) => {
  const total = useMemo(() => {
    return lockedEntities.length;
  }, [lockedEntities]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const isInvalidImageType = useMemo(() => {
    const entityNames = Object.keys(inventorySrc);
    const styleNames = Object.keys(inventorySrc[entityNames[0]]);
    const [, imgType] = inventorySrc[entityNames[0]][styleNames[0]].split(".");
    return imageType !== imgType;
  }, [imageType, inventorySrc]);

  const batchDownload = () => {
    if (imageType === undefined) {
      return;
    }
    const paramsList: Array<[DownloadSource, DownloadConfig]> = [];
    for (let zipOffset = 0; zipOffset < total; ) {
      paramsList.push([
        {
          entities: lockedEntities.slice(zipOffset, zipOffset + PER_BATCH),
          layers,
          inventorySrc,
        },
        {
          projectName,
          description: projectDesc,
          imageType,
          baseOffset,
          zipOffset,
        },
      ]);
      zipOffset = zipOffset + PER_BATCH;
    }

    Promise.all(
      paramsList.map((params): Promise<boolean> => {
        return limit(() => {
          return download(...params).then((isSuccess) => {
            setCurrentIndex((prevState) => prevState + 1);
            return isSuccess;
          });
        });
      })
    ).then((areAllSuccess) => {
      setIsDownloading(false);
      console.log(areAllSuccess);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}></div>
      <div className={styles.right}>
        <div className={styles.toolbar}>
          <div className={classNames([styles.button, styles.singleRelease])}>
            <input
              type="button"
              value="Single Release"
              disabled={isInvalidImageType || true}
              className={classNames({
                [styles.disabled]: isInvalidImageType || true,
              })}
              onClick={() => {
                // TODO:
                console.log("single release");
              }}
            />
          </div>
          <div className={classNames([styles.button, styles.batchRelease])}>
            <input
              type="button"
              value="Batch Release"
              disabled={
                isInvalidImageType || isDownloading || lockedEntities.length < 1
              }
              className={classNames({
                [styles.disabled]:
                  isInvalidImageType ||
                  isDownloading ||
                  lockedEntities.length < 1,
              })}
              onClick={() => {
                onRelease && onRelease(0);
                // const to = lockedEntities.length - 1;
                // const from = to - 1000 < 0 ? 0 : to - 1000;
                // onRelease && onRelease(from, to);
              }}
            />
          </div>
          <div className={classNames([styles.button, styles.singleDownload])}>
            <input
              type="button"
              value="Single Download"
              disabled={isInvalidImageType || true}
              className={classNames({
                [styles.disabled]: isInvalidImageType || true,
              })}
              onClick={() => {
                // TODO:
                console.log("single download");
              }}
            />
          </div>
          <div className={classNames([styles.button, styles.batchDownload])}>
            <input
              type="button"
              value="Batch Download"
              disabled={
                isInvalidImageType || isDownloading || lockedEntities.length < 1
              }
              className={classNames({
                [styles.disabled]:
                  isInvalidImageType ||
                  isDownloading ||
                  lockedEntities.length < 1,
              })}
              onClick={() => {
                setIsDownloading(true);
                setCurrentIndex(1);
                setTimeout(() => {
                  batchDownload();
                }, 0);
              }}
            />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.innerContainer}>
            {isDownloading ? (
              <div>{`${currentIndex}/${Math.ceil(
                total / PER_BATCH
              )} downloading ... `}</div>
            ) : currentIndex === Math.ceil(total / PER_BATCH) + 1 ? (
              <div>Done</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
