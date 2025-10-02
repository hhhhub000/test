import { GameObject } from './game';

// 通常ブロック
export interface Block extends GameObject {
  type: 'normal' | 'monster';
  destroyed: boolean;
  experienceValue: number;
  color: string;
  takeDamage(damage: number): boolean; // 破壊されたらtrue
}

// モンスターブロック
export interface MonsterBlock extends Block {
  type: 'monster';
  maxHealth: number;
  currentHealth: number;
  monsterType: MonsterType;
  dropRewards: Reward[];
}

// モンスタータイプ
export interface MonsterType {
  id: string;
  name: string;
  maxHealth: number;
  experienceValue: number;
  color: string;
  specialAbility?: string;
}

// 報酬アイテム
export interface Reward {
  type: 'experience' | 'skillPoint' | 'powerUp';
  value: number;
  description: string;
}