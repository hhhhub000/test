import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game-specific types
export type Player = 1 | 2;

export interface GamePiece {
  id: string;
  player: Player;
  activationTurns: number;
  expirationTurns: number;
  isActive: boolean;
  turnsRemaining: number;
}

export interface BoardCell {
  piece: GamePiece | null;
}

export interface HandPiece {
  id: string;
  player: Player;
  activationTurns: number;
  expirationTurns: number;
}

export interface GameState {
  board: BoardCell[][];
  currentPlayer: Player;
  turnCount: number;
  playerHands: {
    1: HandPiece[];
    2: HandPiece[];
  };
  winner: Player | null;
  gameOver: boolean;
}
