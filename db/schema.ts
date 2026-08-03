import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  country: text("country").notNull().default("Ecuador"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("America/Guayaquil"),
  status: text("status").notNull().default("Activo"),
  budget: real("budget").notNull().default(0),
  objective: text("objective").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const movements = sqliteTable("movements", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  type: text("type").notNull(),
  category: text("category").notNull(),
  concept: text("concept").notNull(),
  amount: real("amount").notNull().default(0),
  movementDate: text("movement_date").notNull(),
  status: text("status").notNull().default("Registrado"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partners = sqliteTable("partners", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  contribution: real("contribution").notNull().default(0),
  participation: real("participation").notNull().default(0),
  status: text("status").notNull().default("Activo"),
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  item: text("item").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unitCost: real("unit_cost").notNull().default(0),
  status: text("status").notNull().default("Disponible"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("Activo"),
  emailHash: text("email_hash"),
  projectId: text("project_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  actorRole: text("actor_role").notNull().default("Superadministrador"),
  projectId: text("project_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
