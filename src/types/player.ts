import { GameObject, Position, Velocity } from './game';

// プレイヤー（パドル + ボール）の統計情報
export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  skillPoints: number;
}

// プレイヤーの能力値
export interface PlayerAttributes {
  paddleSize: number;
  paddleSpeed: number;
  ballSpeed: number;
  ballDamage: number;
  criticalChance: number;
  experienceMultiplier: number;
}

// プレイヤー全体の情報
export interface Player {
  stats: PlayerStats;
  attributes: PlayerAttributes;
  unlockedSkills: string[];
  activeSkills: string[];
}

// パドルオブジェクト
export interface Paddle extends GameObject {
  speed: number;
  moveLeft(): void;
  moveRight(): void;
  stop(): void;
}

// ボールオブジェクト
export interface Ball extends GameObject {
  velocity: Velocity;
  damage: number;
  radius: number;
  setVelocity(velocity: Velocity): void;
  bounce(normal: Position): void;
  resetPosition(position: Position): void;
}