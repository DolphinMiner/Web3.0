import JSZip from "jszip";
import { v4 as uuidV4 } from "uuid";
import classNames from "classnames";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Inventory, Layer, Style } from "../../types";
import styles from "./LayerPanel.module.css";
import Image from "next/image";
import { LSK } from "@/src/constants";

export type LayerPanelProps = {
  projectName: string;
  layers: Array<Layer>;
  onLayersChange: (v: Array<Layer>) => void;
  inventory: Inventory;
  onInventoryChange: (v: Inventory) => void;
  inventorySrc: Inventory<string>;
  onInventorySrcChange: (v: Inventory<string>) => void;
  imageType: string;
  onImageTypeChange: (v: string) => void;
};
export default function LayerPanel({
  projectName,
  layers,
  onLayersChange,
  inventory,
  onInventoryChange,
  inventorySrc,
  onInventorySrcChange,
  imageType,
  onImageTypeChange,
}: LayerPanelProps) {
  const uuid = window.localStorage.getItem(LSK.UUID) || "";
  const [layer, setLayer] = useState("");
  const [currentLayer, setCurrentLayer] = useState("");
  const [currentLayerStyle, setCurrentLayerStyle] = useState("");
  const currentLayerStyles = useMemo<Array<Style>>(() => {
    return Object.keys(inventory[currentLayer] || {});
  }, [inventory[currentLayer]]);
  const currentLayerHasStyles = useMemo<boolean>(() => {
    return currentLayerStyles.length > 0;
  }, [currentLayerStyles]);

  const handleUpload = (evt: ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files;
    if (!files || files.length < 1) {
      alert("Should upload a zip file including images!");
      return;
    }
    const f = files[0];
    const [fileName, fileSuffix] = f.name.split(".");
    if (fileSuffix !== "zip") {
      alert("Should upload a zip file!");
      return;
    }

    if (fileName !== currentLayer) {
      alert(
        'The zip file should be named with layer name! (e.g."Background.zip")'
      );
      return;
    }

    // upload zip file
    const data = new FormData();
    data.append("uuid", uuid);
    data.append("project", projectName);
    data.append("file", f);
    fetch("/api/upload", {
      method: "POST",
      // headers: {
      //   "Content-Type": "multipart/form-data"
      // },
      body: data,
    })
      .then((response) => response.json())
      .then(
        (res: {
          msg: string;
          data?: {
            srcObj: Record<string, string>;
            imgType: string;
          };
        }) => {
          if (res.data === undefined) {
            throw new Error("Upload failed!");
          }

          const { srcObj = {}, imgType } = res.data;
          // 判断此次上传图片类型是否存在
          if (!imgType) {
            throw new Error("Upload failed!");
          }
          // 判断每次上传图片类型是否相同
          if (imageType !== imgType) {
            throw new Error("Multi image types");
          }

          if (Object.keys(srcObj).length <= 0) {
            throw new Error("Upload failed!");
          }

          onImageTypeChange(imgType);
          const styleList = Object.keys(srcObj);
          onInventoryChange({
            ...inventory,
            [currentLayer]: styleList.reduce((acc, cur) => {
              return {
                ...acc,
                [cur]: 0,
              };
            }, {} as Record<string, number>),
          });
          onInventorySrcChange({
            ...inventorySrc,
            [currentLayer]: styleList.reduce((acc, cur) => {
              return {
                ...acc,
                [cur]: srcObj[cur],
              };
            }, {} as Record<string, string>),
          });
        }
      )
      .catch((error) => {
        alert("Upload failed");
        console.error(error);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={classNames([styles.item, styles.input])}>
          <input
            className={styles.layer}
            id="layer"
            placeholder="Add a new layer"
            type="text"
            value={layer}
            onChange={(e) => {
              setLayer(e.target.value);
            }}
          />
          <input
            className={classNames([
              styles.btn,
              { [styles.disable]: !layer || layers.includes(layer) },
            ])}
            type="button"
            disabled={!layer || layers.includes(layer)}
            onClick={() => {
              console.log(layer);
              onLayersChange([...layers, layer]);
              setLayer("");
            }}
            value="Add"
          />
        </div>

        {layers.map((layerName, index) => (
          <div className={styles.item} key={layerName + index}>
            <div
              className={classNames([
                styles.layer,
                {
                  [styles.active]: layerName === currentLayer,
                },
              ])}
              onClick={() => {
                if (layerName !== currentLayer) {
                  setCurrentLayerStyle("");
                }
                setCurrentLayer(layerName);
              }}
            >
              <span>{`${index + 1}. `}</span>
              <span>{`${layerName}`}</span>
            </div>
            <input
              type="button"
              disabled={layers.length <= 1}
              className={classNames([
                styles.btn,
                { [styles.disable]: layers.length <= 1 },
              ])}
              onClick={() => {
                if (currentLayer === layerName) {
                  setCurrentLayer("");
                }
                onLayersChange(layers.filter((v) => v !== layerName));
              }}
              value="Delete"
            />
          </div>
        ))}
      </div>
      {currentLayer ? (
        <>
          <div className={styles.middle}>
            <div className={classNames([styles.item, styles.upload])}>
              <input
                type="file"
                name="file"
                accept=".zip"
                onChange={handleUpload}
              />
            </div>
            {currentLayerStyles.map((layerStyle, index) => (
              <div className={styles.item} key={layerStyle + index}>
                <div
                  className={classNames([
                    styles.style,
                    { [styles.active]: layerStyle === currentLayerStyle },
                  ])}
                  onClick={() => {
                    setCurrentLayerStyle(layerStyle);
                  }}
                >
                  {layerStyle}
                </div>
                <div className={styles.supply}>
                  <input
                    type="number"
                    value={inventory[currentLayer][layerStyle]}
                    onChange={(e) => {
                      onInventoryChange({
                        ...inventory,
                        [currentLayer]: {
                          ...inventory[currentLayer],
                          [layerStyle]: parseInt(e.target.value || "0"),
                        },
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.right}>
            {currentLayer && currentLayerStyle ? (
              <Image
                alt={`Preview of ${currentLayer}.${currentLayerStyle}`}
                src={inventorySrc[currentLayer][currentLayerStyle]}
                width={300}
                height={300}
                className={styles.preview}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
