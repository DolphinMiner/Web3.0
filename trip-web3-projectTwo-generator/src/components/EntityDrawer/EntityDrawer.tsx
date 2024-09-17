import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { Entity, Inventory, Layer } from "../../types";
import createDNA from "../../utils/createDNA";
import Avatar from "../Avatar";
import styles from "./EntityDrawer.module.css";

export type EntityDrawerProps = {
  open: boolean;
  onClose: () => void;
  entities: Array<Entity>;
  onSelectEntity: (index: number) => void;
  layers: Array<Layer>;
  inventorySrc: Inventory<string>;
};

const EntityDrawer = ({
  open,
  onClose,
  entities,
  onSelectEntity,
  layers,
  inventorySrc,
}: EntityDrawerProps) => {
  const itemsPerPage = 20;
  const [hasMore, setHasMore] = useState(entities.length > itemsPerPage);
  const [records, setRecords] = useState(
    entities.length > itemsPerPage ? itemsPerPage : entities.length
  );
  const total = useMemo(() => {
    return entities.length;
  }, [entities]);
  const showItems = (posts: Entity[]) => {
    const items = [];
    for (let i = 0; i < records; i++) {
      const entity = posts[i];
      items.push(
        <div
          key={createDNA(entity) + "_" + i}
          className={styles.item}
          onClick={() => {
            onSelectEntity(i);
          }}
        >
          <Avatar
            entity={entity}
            layers={layers}
            inventorySrc={inventorySrc}
            className={styles.avatar}
          />
        </div>
      );
    }
    return items;
  };
  const loadMore = () => {
    if (records === total) {
      setHasMore(false);
    } else {
      setTimeout(() => {
        const draftRecords = records + itemsPerPage;
        const nextRecords = draftRecords > total ? total : draftRecords;
        setRecords(nextRecords);
      }, 2000);
    }
  };

  useEffect(() => {
    if (total > itemsPerPage) {
      setHasMore(true);
      setRecords(itemsPerPage);
    }
  }, [total]);

  return (
    <Drawer open={open} onClose={onClose} direction="right">
      <div className={styles.container}>
        {entities.length <= itemsPerPage ? (
          <div className={styles.innerContainer}>
            {entities.map((entity, index) => (
              <div
                key={createDNA(entity)}
                className={styles.item}
                onClick={() => {
                  onSelectEntity(index);
                }}
              >
                <Avatar
                  entity={entity}
                  layers={layers}
                  inventorySrc={inventorySrc}
                  className={styles.avatar}
                />
              </div>
            ))}
          </div>
        ) : (
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={hasMore}
            loader={
              <h4 key="loader" className="loader">
                Loading...
              </h4>
            }
            useWindow={false}
          >
            {showItems(entities)}
          </InfiniteScroll>
        )}
        {total === 0 ? <div>There is no locked entities.</div> : null}
      </div>
    </Drawer>
  );
};

export default EntityDrawer;
