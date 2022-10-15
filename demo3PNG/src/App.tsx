import Image from "next/image";
import React, { useEffect, useReducer, useRef, useState } from "react";
import styles from "./App.module.css";
import { toBlob, toPng } from "html-to-image";
import Avatar from "./components/Avatar";
import { Attributes, LayerName } from "./types";
import { shuffle } from "./utils";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import configs from "./configs";
import useAvatar from "./hooks/useAvatar";

const App = () => {
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const { attributes, setAttributes } = useAvatar();

  const onShuffle = () => {
    const payload = shuffle();
    setAttributes(payload);
    console.log(payload);
  };

  const onDownload = () => {
    if (!window || !avatarRef.current) {
      return;
    }
    toBlob(avatarRef.current)
      .then((pngBlob) => {
        if (!pngBlob) throw Error("Failed to toBlob");

        const jsonBlob = new Blob([JSON.stringify(attributes)], {
          type: "text/plain;charset=utf-8",
        });

        const zip = new JSZip();
        zip.file("/png/avatar.png", pngBlob);
        zip.file("/json/metadata.json", jsonBlob);
        zip
          .generateAsync({ type: "blob" })
          .then((blob) => {
            saveAs(blob, "avatar.zip");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log("Failed to download", err);
      });
  };

  useEffect(() => {
    onShuffle();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container} ref={avatarRef}>
        <Avatar
          source={configs.pngSource}
          layers={configs.layers}
          attributes={attributes}
        />
      </div>
      <div className={styles.btnContainer}>
        <button onClick={onShuffle}>Shuffle</button>
        <button onClick={onDownload}>Download</button>
      </div>
    </main>
  );
};

export default App;
