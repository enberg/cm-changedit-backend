import { Request, Response } from 'express'
import mongoose from 'mongoose';

export const getImage = async (req: Request, res: Response) => {
    const conn = mongoose.connection;

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'photos'
    })

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    })

    downloadStream.on('error', () => {
        res.sendStatus(404);
    })

    downloadStream.on('end', () => {
        res.end();
    })
}