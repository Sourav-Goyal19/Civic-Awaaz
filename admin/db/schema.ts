import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: varchar("role", { length: 20 }).notNull(), // "citizen" | "admin" | "officer"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending | assigned | resolved
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  complaintId: uuid("complaint_id")
    .references(() => complaints.id, { onDelete: "cascade" })
    .notNull(),
  officerId: uuid("officer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assignedBy: uuid("assigned_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
  assignments: many(assignments),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [complaints.createdBy],
    references: [users.id],
  }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  complaint: one(complaints, {
    fields: [assignments.complaintId],
    references: [complaints.id],
  }),
  officer: one(users, {
    fields: [assignments.officerId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [assignments.assignedBy],
    references: [users.id],
  }),
}));
