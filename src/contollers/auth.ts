import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        if (await User.findOne({userName: username})) {
            return res.status(400).json({ message: "Username taken" });
        }

        const user = new User({ userName: username, password })
        await user.save()

        res.status(201).json({ username, id: user._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logIn = async (req: Request, res: Response) => {
    try {
        // Ta in användarnamn och lösen
        const { username, password } = req.body;
        // Hitta en användare och hämta ut lösenordet
        const user = await User.findOne({userName: username}, '+password');

        // Kolla att vi har en användare och om lösenordet matchar det i databasen.
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Wrong username or password' });
        }
        
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw Error('Missing JWT_SECRET');
        }
        
        // Returnera JWT
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
        
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshTokenSecret ) {
            throw Error('Missing REFRESH_TOKEN_SECRET');
        }
        // Returnera refreshtoekn
        const refreshToken = jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: '1d' });


        res.status(200).json({token, refreshToken, username: user.userName})
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({
            message: "Something blew up"
        })
    }
}

export const refreshJWT = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret ) {
        throw Error('Missing REFRESH_TOKEN_SECRET');
    }

    try {
    // Returnera refreshtoekn
    const decodedPayload = await jwt.verify(refreshToken, refreshTokenSecret) as {userId: string};  

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error('Missing JWT_SECRET');
    }
    
    // Returnera JWT
    const token = jwt.sign({ userId: decodedPayload.userId }, secret, { expiresIn: '1h' });

    return res.status(200).json({
        token
    })
    } catch(error) {
        console.log(error)
        return res.status(403).json({message: 'invalid token'})
    }
    
}

export const profile = async (req: Request, res: Response) => {
    const { userId } = req

    const user = await User.findById(userId);

    if (!user) {
        console.log("User not found with id: ", userId)
        return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({
        userName: user.userName
    })
}