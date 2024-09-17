import classnames from "classnames";
import type { Entity, Inventory, Layer } from "../../types";
import styles from "./Avatar.module.css";
import LayerPreview from "../LayerPreview";

export type AvatarProps = {
  entity: Entity;
  layers: Array<Layer>;
  inventorySrc: Inventory<string>;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

const Avatar = ({
  entity,
  layers,
  inventorySrc,
  className,
  onClick,
}: AvatarProps) => {
  return (
    <div
      onClick={onClick}
      className={classnames([styles.container, className ? className : null])}
    >
      {layers.map((layer) => {
        const layerStyle = entity[layer];
        return entity[layer] &&
          inventorySrc[layer] &&
          inventorySrc[layer][layerStyle] ? (
          <LayerPreview
            key={layer}
            alt={layer}
            src={inventorySrc[layer][layerStyle]}
          />
        ) : null;
      })}
    </div>
  );
};

export default Avatar;
