type Source = {
  src: string;
  x?: number;
  y?: number;
  opacity?: number;
};

export type ReturnDataType = "blob" | "dataURL";

type Options = {
  format: string;
  quality: number;
  width: number;
  height: number;
  crossOrigin?: string;
  rtn: ReturnDataType;
};

const defaultOptions: Options = {
  format: "image/png",
  quality: 0.92,
  width: 360,
  height: 360,
  crossOrigin: undefined,
  rtn: "dataURL",
};

// only for web
const mergeImages = (
  sources: Array<Source | string> = [],
  _options: Partial<Options> = {}
) => {
  return new Promise<Blob | null | string>((resolve) => {
    const options: Options = Object.assign({}, defaultOptions, _options);
    const canvas = window.document.createElement("canvas");

    // Get canvas context
    const ctx = canvas.getContext("2d");
    canvas.width = options.width;
    canvas.height = options.height;

    // Load sources
    const tasks = sources.map((source) => {
      return new Promise<Source & { img: HTMLImageElement }>(
        (resolve, reject) => {
          if (typeof source === "string") {
            source = { src: source } as Source;
          }

          const img = window.document.createElement('img');
          img.crossOrigin = options.crossOrigin || null;
          img.onerror = () =>
            reject(
              new Error(`Couldn't load image!\n${JSON.stringify(source)}`)
            );
          img.onload = () => {
            // reset the canvas size to be same with img
            canvas.width = img.width;
            canvas.height = img.height;
            return resolve(Object.assign({}, source, { img }));
          };

          img.src = source.src;
        }
      );
    });

    // When sources have loaded
    Promise.all(tasks).then((images) => {
      images.forEach((image) => {
        ctx.globalAlpha = image.opacity ? image.opacity : 1;
        ctx.drawImage(image.img, image.x || 0, image.y || 0);
      });

      if (options.rtn === "blob") {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          options.format,
          options.quality
        );
      } else {
        resolve(canvas.toDataURL(options.format, options.quality));
      }
    });
  });
};

export default mergeImages;
