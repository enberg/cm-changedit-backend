import mongoose, { Types } from "mongoose";

const getBucket = () => {
  const dbConnection = mongoose.connection;

  return new mongoose.mongo.GridFSBucket(dbConnection.db, {
    bucketName: "images",
  });
};

export const uploadFile = (
  filename: string,
  content: Buffer,
  metadata?: { [key: string]: any },
): Promise<Types.ObjectId> => {
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(filename, {
    metadata,
  });

  const fileId = uploadStream.id;

  return new Promise((resolve, reject) => {
    uploadStream.once("finish", () => resolve(fileId));
    uploadStream.once("error", reject);

    uploadStream.end(content);
  });
};

export const getFile = async (id: string | Types.ObjectId) => {
  const bucket = getBucket();
  const fileId = typeof id === "string" ? new Types.ObjectId(id) : id;

  const file = await mongoose.connection
    .collection<mongoose.mongo.GridFSFile>("images.files")
    .findOne({ _id: fileId });

  if (!file) {
    return null;
  }

  const downloadStream = bucket.openDownloadStream(file._id);

  return {
    filename: file.filename,
    stream: downloadStream,
    metadata: file.metadata,
  };
};
