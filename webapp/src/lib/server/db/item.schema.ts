import { relations } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  int,
} from "drizzle-orm/mysql-core";

export const item = mysqlTable("item", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  state: varchar("state", { length: 30 }).notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  meat: varchar("meat", { length: 30 }),
  seafood: varchar("seafood", { length: 30 }),
  quantity: int("quantity"),
  barcodePrefix: varchar("barcode_prefix", { length: 30 }).notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => [
    index("item_name_idx").on(table.name), 
    index("item_barcode_prefix_idx").on(table.barcodePrefix)
  ],
);

export const barcode = mysqlTable("barcode", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  consumed: boolean("consumed").default(false),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  itemId: int('item_id').references(() => item.id, { onDelete: "cascade" })
});



export const itemRelation = relations(item, ({ many }) => ({
  sessions: many(barcode),
}));

export const barcodeRelation = relations(barcode, ({ one }) => ({
  item: one(item, {
    fields: [barcode.itemId],
    references: [item.id],
  }),
}));

export type Item = typeof item.$inferSelect;
export type NewItem = typeof item.$inferInsert;
export type Barcode = typeof barcode.$inferSelect;
export type NewBarcode = typeof barcode.$inferInsert;