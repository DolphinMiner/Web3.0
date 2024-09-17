import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Entity, Inventory, Layer } from "../types";
import convertTo from "./convertTo";

const formatMetadata = (
  description: string,
  imageType: string,
  entity: Entity,
  index: number
) => {
  return {
    attributes: Object.keys(entity).map((key) => {
      return {
        trait_type: key,
        value: entity[key],
      };
    }),
    description,
    image: `ipfs://YourImageURI/${index}.${imageType}`,
    name: `#${index}`,
  };
};

export type DownloadSource = {
  entities: Array<Entity>;
  layers: Array<Layer>;
  inventorySrc: Inventory<string>;
};
export type DownloadConfig = {
  projectName: string;
  description: string;
  imageType: string;
  baseOffset: number; // 从 0 + initOffset 开始命名文件
  zipOffset: number; // 分批下载时候多个zip包的偏移量
};
const download = (
  source: DownloadSource,
  config: DownloadConfig
): Promise<boolean> => {
  const { entities, layers, inventorySrc } = source;
  const { projectName, description, imageType, baseOffset, zipOffset } = config;
  const tasks = entities.map((entity) => {
    return convertTo(entity, layers, inventorySrc, "blob") as Promise<Blob>;
  });
  return Promise.all(tasks)
    .then((imageBlobs) => {
      const zip = new JSZip();
      imageBlobs.forEach((imageBlob, index) => {
        const jsonBlob = new Blob(
          [
            JSON.stringify(
              formatMetadata(
                description,
                imageType,
                entities[index],
                baseOffset + zipOffset + index
              )
            ),
          ],
          {
            type: "text/plain;charset=utf-8",
          }
        );
        zip.file(`/image/${baseOffset + zipOffset + index}.png`, imageBlob);
        zip.file(`/json/${baseOffset + zipOffset + index}.json`, jsonBlob);
      });

      return zip
        .generateAsync({ type: "blob" })
        .then((zipBlob) => {
          saveAs(zipBlob, `${projectName}.${baseOffset + zipOffset}.zip`);
        })
        .then(() => {
          return true;
        });
    })
    .catch((err) => {
      return false;
    });
};

export default download;
