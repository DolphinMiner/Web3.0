import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import styles from "./ShufflePanel.module.css";
import useBatch from "../hooks/useBatch";
import Avatar from "./Avatar";
import configs, { attributes } from "../configs";
import { IconButton, Pagination, Stack, TextField } from "@mui/material";
import classnames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_TOTAL } from "../constants";
import DownloadIcon from "@mui/icons-material/Download";
import Image from "next/image";
import { batchDownload, convertTo } from "../utils";

const PAGE_SIZE = 120;

const ShufflePanel = () => {
  const [formedTotal, setFormedTotal] = useState(DEFAULT_TOTAL);
  const [total, setTotal] = useState(formedTotal);
  const { entities, updateEntity, shuffleEntities } = useBatch(total);
  const [curIdx, setCurIdx] = useState(-1);
  const [curPage, setCurPage] = useState(1);

  const [dataURL, setDataURL] = useState("");

  useEffect(() => {
    setCurIdx(-1);
    setCurPage(1);
    shuffleEntities(total);
  }, [total]);

  const pageCount = useMemo(() => {
    return Math.ceil(entities.length / PAGE_SIZE);
  }, [entities.length]);

  const [startIdx, endIdx] = useMemo(() => {
    const startIdx = (curPage - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    return [startIdx, endIdx];
  }, [curPage]);

  const onUpdate = () => {
    setTotal(formedTotal);
  };

  const onDownload = async () => {
    const isSuccess = await batchDownload(entities);
    console.log(isSuccess);
  };

  useEffect(() => {
    if (curIdx === -1) {
      setDataURL("");
    } else {
      convertTo(entities[curIdx]).then((_dataURL) => {
        if (typeof _dataURL === "string") {
          setDataURL(_dataURL);
        }
      });
    }
  }, [curIdx]);

  const renderTokenToolBar = () => {
    return (
      <div className={styles.infoBar}>
        <div className={styles.textContainer}>
          <span>{`Showing `}</span>
          <span className={styles.fontMedium}>{`${startIdx + 1} `}</span>
          <span>{`to `}</span>
          <span className={styles.fontMedium}>{`${endIdx} `}</span>
          <span>{`of `}</span>
          <span className={styles.fontMedium}>{`${total} `}</span>
          <span>{`tokens`}</span>
        </div>

        <div className={styles.downloadIconContainer}>
          <IconButton
            disabled={entities.length === 0}
            color="primary"
            aria-label="download tokens"
            component="label"
            onClick={onDownload}
          >
            <DownloadIcon />
          </IconButton>
        </div>
      </div>
    );
  };

  const renderTokenList = () => {
    return (
      <div className={styles.avatarListContainer}>
        <div className={styles.gridContainer}>
          {entities.slice(startIdx, endIdx).map((entity, idx) => {
            const actualIdx = idx + startIdx;
            return (
              <div key={actualIdx} className={styles.gridItem}>
                <div className={styles.innerContainer}>
                  <div
                    className={classnames({
                      [styles.avatarContainer]: true,
                      [styles.active]: actualIdx === curIdx,
                    })}
                  >
                    <Avatar
                      source={configs.pngSource}
                      layers={configs.layers}
                      attributes={entity}
                      className={styles.avatar}
                      onClick={() => {
                        setCurIdx(actualIdx === curIdx ? -1 : actualIdx);
                      }}
                    />
                  </div>
                  <div className={styles.description}>{`Token #${
                    actualIdx + 1
                  }`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTokenPagination = () => {
    return (
      <Stack className={styles.pageContainer} spacing={2} padding={"10px"}>
        <Pagination
          count={pageCount}
          page={curPage}
          onChange={(e, value) => {
            setCurPage(value);
          }}
          shape="rounded"
        />
      </Stack>
    );
  };

  const renderSupplyUpdateRow = () => {
    return (
      <>
        <Stack direction={"row"} spacing={2}>
          <TextField
            size={"small"}
            label="Tokens"
            focused
            value={formedTotal}
            onChange={(e) => setFormedTotal(parseInt(e.target.value || 0))}
          />
          <Button
            variant="contained"
            disabled={formedTotal === entities.length}
            onClick={onUpdate}
          >
            Update
          </Button>
        </Stack>
        {dataURL ? (
          <Image src={dataURL} width={360} height={360} alt="preview" />
        ) : null}
      </>
    );
  };

  return (
    <Grid className={styles.shufflePanelContainer} container spacing={0}>
      <Grid item xs={"auto"} className={styles.leftContainer}>
        {renderSupplyUpdateRow()}
        {/* TODO: more action */}
      </Grid>
      <Grid item xs className={styles.rightContainer}>
        {renderTokenToolBar()}
        {renderTokenList()}
        {renderTokenPagination()}
      </Grid>
    </Grid>
  );
};

export default ShufflePanel;
