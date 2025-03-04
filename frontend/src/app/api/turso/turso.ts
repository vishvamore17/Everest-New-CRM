import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/turso";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "POST") {
            const { name, email } = req.body;
            if (!name || !email) {
                return res.status(400).json({ message: "Name and email are required" });
            }

            await db.prepare("INSERT INTO users (name, email) VALUES (?, ?)").run(name, email);
            return res.status(200).json({ message: "User added successfully!" });
        }

        if (req.method === "GET") {
            const users = await db.prepare("SELECT * FROM users").all();
            return res.status(200).json(users);
        }

        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
}
