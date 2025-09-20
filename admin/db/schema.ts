import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: varchar("role", { length: 20 }).notNull(), // "citizen" | "admin" | "officer"
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaintsTable = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending | assigned | resolved
  createdBy: uuid("created_by")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // images: text("image_urls"),
});

export const assignmentsTable = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  complaintId: uuid("complaint_id")
    .references(() => complaintsTable.id, { onDelete: "cascade" })
    .notNull(),
  officerId: uuid("officer_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  assignedBy: uuid("assigned_by")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  complaints: many(complaintsTable),
  assignments: many(assignmentsTable),
}));

export const complaintsRelations = relations(
  complaintsTable,
  ({ one, many }) => ({
    createdBy: one(usersTable, {
      fields: [complaintsTable.createdBy],
      references: [usersTable.id],
    }),
    assignments: many(assignmentsTable),
  })
);

export const assignmentsRelations = relations(assignmentsTable, ({ one }) => ({
  complaint: one(complaintsTable, {
    fields: [assignmentsTable.complaintId],
    references: [complaintsTable.id],
  }),
  officer: one(usersTable, {
    fields: [assignmentsTable.officerId],
    references: [usersTable.id],
  }),
  assignedBy: one(usersTable, {
    fields: [assignmentsTable.assignedBy],
    references: [usersTable.id],
  }),
}));
