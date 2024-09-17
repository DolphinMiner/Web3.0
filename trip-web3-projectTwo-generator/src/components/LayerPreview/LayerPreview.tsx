import classNames from "classnames";
import Image from "next/image";
import styles from "./LayerPreview.module.css";

export type LayerPreviewProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};
const LayerPreview = ({
  src,
  alt,
  width = 300,
  height = 300,
  className,
}: LayerPreviewProps) => (
  <div className={classNames([styles.container, className])}>
    <Image
      className={styles.preview}
      src={src}
      alt={alt}
      width={width}
      height={height}
    />
  </div>
);

export default LayerPreview;
