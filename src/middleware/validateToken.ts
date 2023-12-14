import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/User";

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    // Söker efter en Authorization header
    const authHeader = req.headers['authorization'];

    // authorization ser ut såhär : Bearer asdoögijSADF23faefawe2332

    // Läser ut JWT
    // skriv kort vad det här är
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({message: 'Not authenticated'});
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error('Missing JWT_SECRET');
    }
    // Kolla att JWTn är giltig

    // Läsa ut användar id från token
    jwt.verify(token, secret, async (error, decodedPayload) => {
        // Kolla att vi inte har fått ett error
        // Kolla att vi verkligen fick något ur vår JWT
        // Kolla att det inte är en sträng (vi skickade ju in ett objekt när vi skapade den)
        if (error || !decodedPayload || typeof decodedPayload === 'string') {
            return res.status(403).json({message: 'Not authorized'});
        }

        if (!await User.exists({_id: decodedPayload.userId})) {
            return res.status(403).json({message: 'Not authorized'});
        }

        // Lägga till userId på req 
        req.userId = decodedPayload.userId
        next()
    })
}

export default validateToken;