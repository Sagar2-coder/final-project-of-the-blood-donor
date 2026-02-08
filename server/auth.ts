import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { type User as SelectUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePasswords(supplied: string, stored: string) {
    return await bcrypt.compare(supplied, stored);
}

export const generateToken = (user: SelectUser) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; isAdmin: boolean };
        req.user = { id: decoded.id, isAdmin: decoded.isAdmin } as any;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user as any).isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Admin access required" });
    }
};

export async function setupAuth(app: Express) {
    app.post("/api/register", async (req, res) => {
        try {
            const { username, password, email } = req.body;
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await hashPassword(password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
            });

            const token = generateToken(user);
            res.status(201).json({ user, token });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post("/api/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await storage.getUserByUsername(username);
            if (!user || !(await comparePasswords(password, user.password))) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const token = generateToken(user);
            res.status(200).json({ user, token });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/me", verifyToken, async (req, res) => {
        const user = await storage.getUser((req.user as any).id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    });
}
