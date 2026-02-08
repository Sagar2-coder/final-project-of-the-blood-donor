import { donors, type Donor, type InsertDonor, users, type User, type DonorsQueryParams } from "@shared/schema";
import { db } from "./db";
import { eq, lte, and, sql, desc } from "drizzle-orm";
import { subMonths } from "date-fns";

export interface IStorage {
  createDonor(donor: InsertDonor & { userId: string }): Promise<Donor>;
  getDonors(filters?: DonorsQueryParams): Promise<Donor[]>;
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByUserId(userId: string): Promise<Donor | undefined>;
  updateDonor(id: number, data: Partial<Donor>): Promise<Donor>;
  deleteDonor(id: number): Promise<void>;

  // Auth operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async createDonor(insertDonor: InsertDonor & { userId: string }): Promise<Donor> {
    const [donor] = await db.insert(donors).values({
      ...insertDonor,
      isVerified: false
    }).returning();
    return donor;
  }

  async getDonor(id: number): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.id, id));
    return donor;
  }

  async getDonors(filters?: DonorsQueryParams): Promise<Donor[]> {
    const threeMonthsAgo = subMonths(new Date(), 3);
    let conditions = [];

    if (filters?.bloodGroup) {
      conditions.push(eq(donors.bloodGroup, filters.bloodGroup));
    }

    if (filters?.userType) {
      conditions.push(eq(donors.userType, filters.userType));
    }

    if (filters?.city) {
      conditions.push(eq(donors.city, filters.city));
    }

    // Eligibility check: donated more than 3 months ago
    conditions.push(lte(donors.lastDonationDate, threeMonthsAgo.toISOString().split('T')[0]));

    if (conditions.length === 0) {
      return await db.select().from(donors).orderBy(desc(donors.createdAt));
    }

    return await db.select().from(donors).where(and(...conditions)).orderBy(desc(donors.createdAt));
  }

  async getDonorByUserId(userId: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.userId, userId));
    return donor;
  }

  async updateDonor(id: number, data: Partial<Donor>): Promise<Donor> {
    const [donor] = await db.update(donors).set(data).where(eq(donors.id, id)).returning();
    return donor;
  }

  async deleteDonor(id: number): Promise<void> {
    await db.delete(donors).where(eq(donors.id, id));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private donors: Map<number, Donor>;
  private currentDonorId: number = 1;

  constructor() {
    this.users = new Map();
    this.donors = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<User> {
    const id = insertUser.id || Math.random().toString(36).substring(2, 9);
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null
    };
    this.users.set(id, user);
    return user;
  }

  async createDonor(insertDonor: InsertDonor & { userId: string }): Promise<Donor> {
    const id = this.currentDonorId++;
    const donor: Donor = {
      ...insertDonor,
      lastDonationDate: insertDonor.lastDonationDate instanceof Date
        ? insertDonor.lastDonationDate.toISOString().split('T')[0]
        : insertDonor.lastDonationDate,
      id,
      isVerified: false,
      createdAt: new Date(),
    };
    this.donors.set(id, donor);
    return donor;
  }

  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonors(filters?: DonorsQueryParams): Promise<Donor[]> {
    const threeMonthsAgo = subMonths(new Date(), 3);
    const dateLimit = threeMonthsAgo.toISOString().split('T')[0];

    return Array.from(this.donors.values())
      .filter((donor) => {
        if (filters?.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
        if (filters?.userType && donor.userType !== filters.userType) return false;
        if (filters?.city && !donor.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
        return donor.lastDonationDate <= dateLimit;
      })
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getDonorByUserId(userId: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find((d) => d.userId === userId);
  }

  async updateDonor(id: number, data: Partial<Donor>): Promise<Donor> {
    const existing = this.donors.get(id);
    if (!existing) throw new Error("Donor not found");
    const updated = { ...existing, ...data };
    this.donors.set(id, updated);
    return updated;
  }

  async deleteDonor(id: number): Promise<void> {
    this.donors.delete(id);
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();
