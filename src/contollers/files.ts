import { Request, Response } from "express";
import { OutgoingHttpHeaders } from "http";
import { getFile } from "../util/gridFs";

export const getFileById = async (req: Request, res: Response) => {
  const file = await getFile(req.params.id);

  if (!file) {
    return res.sendStatus(404);
  }

  // Tillåt nedladdning genom att lägga till ?download=1 i url:en
  const disposition = req.query.download ? "attachment" : "inline";

  const headers: OutgoingHttpHeaders = {
    "Content-Disposition": `${disposition}; filename="${file.filename}"`,
  };

  if (file.metadata?.mimeType) {
    headers["Content-Type"] = file.metadata.mimeType;
  }

  if (file.metadata?.size) {
    headers["Content-Length"] = file.metadata.size;
  }

  res.writeHead(200, headers);

  file.stream.on("data", (chunk) => {
    res.write(chunk);
  });

  file.stream.on("error", (error) => {
    console.log(error);
    res.sendStatus(500);
  });

  file.stream.on("end", () => {
    res.end();
  });
};
