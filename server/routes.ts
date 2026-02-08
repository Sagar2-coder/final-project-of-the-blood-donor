import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, verifyToken, isAdmin } from "./auth";
import { insertDonorSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);

  // Donors API
  app.get("/api/donors", async (req, res) => {
    try {
      const filters = {
        bloodGroup: req.query.bloodGroup as string,
        userType: req.query.userType as "donor" | "receiver",
        city: req.query.city as string,
      };

      const donors = await storage.getDonors(filters);

      // Eligibility & Privacy Logic:
      // 1. Storage already filters out donors who donated < 3 months ago.
      // 2. Hide contact numbers for unauthenticated users.
      const isAuthenticated = !!req.headers.authorization;

      const publicDonors = donors.map(donor => {
        const { contactNumber, userId, ...rest } = donor;
        return {
          ...rest,
          contactNumber: isAuthenticated ? contactNumber : "Login to view",
          isAvailable: true // Simplified status badge logic
        };
      });

      res.json(publicDonors);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/donors", verifyToken, async (req, res) => {
    try {
      const input = insertDonorSchema.parse(req.body);
      const userId = (req.user as any).id;

      const normalizedInput = {
        ...input,
        lastDonationDate: input.lastDonationDate instanceof Date
          ? input.lastDonationDate.toISOString().split('T')[0]
          : input.lastDonationDate
      };

      const existing = await storage.getDonorByUserId(userId);
      if (existing) {
        const updated = await storage.updateDonor(existing.id, normalizedInput);
        return res.json(updated);
      }

      const donor = await storage.createDonor({ ...normalizedInput, userId });
      res.status(201).json(donor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get("/api/donors/me", verifyToken, async (req, res) => {
    const userId = (req.user as any).id;
    const donor = await storage.getDonorByUserId(userId);
    if (!donor) return res.status(404).json({ message: "Profile not found" });
    res.json(donor);
  });

  // Admin APIs
  app.patch("/api/donors/:id/verify", verifyToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateDonor(id, { isVerified: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to verify donor" });
    }
  });

  app.delete("/api/donors/:id", verifyToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDonor(id);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete donor" });
    }
  });

  return httpServer;
}
