import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // Link to auth user
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  bloodGroup: text("blood_group").notNull(),
  contactNumber: text("contact_number").notNull(),
  lastDonationDate: date("last_donation_date").notNull(),
  userType: text("user_type", { enum: ["donor", "receiver"] }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertDonorSchema = createInsertSchema(donors, {
  lastDonationDate: z.string().or(z.date()),
}).omit({ id: true, createdAt: true, userId: true, isVerified: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;

// Request types
export type CreateDonorRequest = InsertDonor;
export type UpdateDonorRequest = Partial<InsertDonor>;

// Response types
// Public donor info excludes contact number
export type PublicDonorInfo = Omit<Donor, "contactNumber" | "userId">;

export type DonorResponse = Donor;
export type DonorsListResponse = PublicDonorInfo[];

// Query params
export interface DonorsQueryParams {
  bloodGroup?: string;
  userType?: "donor" | "receiver";
  city?: string;
}
