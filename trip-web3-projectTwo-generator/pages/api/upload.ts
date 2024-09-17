import formidable, { IncomingForm } from "formidable";
import * as fs from "fs";
import JSZip from "jszip";
import { NextApiRequest, NextApiResponse } from "next";

const toString = <T>(v: T) => Object.prototype.toString.call(v);

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};
type Data = {
  message: string;
  data?: {
    srcObj: Record<string, string>;
    imgType: string;
  };
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(500).json({ message: "invalid method" });
    return;
  }
  // parse form with a Promise wrapper
  const data = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  try {
    // .file because I named it in client side by that name:
    // data.append('file', f);
    // data.append('project', 'projectName')
    const zipFile = Array.isArray(data.files.file)
      ? data.files.file[0]
      : data.files.file;
    const { project, uuid } = data.fields;
    const { originalFilename } = zipFile;
    if (!originalFilename) {
      res
        .status(500)
        .json({ message: "Invalid filename! (e.g. 'Background.zip')" });
      return;
    }

    // e.g. 'Background.zip'
    const [layerName] = originalFilename.split(".");

    const zip = new JSZip();
    const zipData = await zip.loadAsync(fs.readFileSync(zipFile.filepath));
    if (!zipData.files || Object.keys(zipData.files).length <= 0) {
      res.status(500).json({ message: "No valid images in zip!" });
      return;
    }

    const targetFolder = uuid
      ? `public/upload/${uuid}/${project}/${layerName}`
      : `public/upload/temp/${project}/${layerName}`;
    if (fs.existsSync(targetFolder)) {
      fs.rmSync(targetFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(targetFolder, { recursive: true });

    const tasks = Object.keys(zipData.files).map((filename) => {
      const [styleName, imageType] = filename.split(".");
      // @ts-ignore
      return zip
        .file(filename)
        .async("nodebuffer")
        .then(function (content) {
          const src = `${targetFolder}/${filename}`;
          fs.writeFileSync(src, content);
          return {
            styleName,
            // remove 'public' prefix
            stylePath: src.slice(6),
            imageType,
          };
        });
    });

    let imgType: string | undefined = undefined;
    const srcObj = await Promise.all(tasks).then((list) => {
      return list.reduce((acc, { styleName, stylePath, imageType }) => {
        if (typeof imageType !== "string") {
          throw new Error("Missing image type");
        } else if (imgType !== undefined && imgType !== imageType) {
          throw new Error("Multi image types");
        } else {
          imgType = imageType;
        }

        return {
          ...acc,
          [styleName]: stylePath,
        };
      }, {} as Record<string, string>);
    });

    if (imgType === undefined) {
      throw new Error("Invalid image type");
    }

    res.status(200).json({
      message: "File uploaded!",
      data: { srcObj, imgType },
    });
    return;
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ message: error.message });
    return;
  }
}
