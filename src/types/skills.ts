// スキルの基本情報
export interface Skill {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  cooldown: number; // ミリ秒
  duration?: number; // 持続時間（ミリ秒）
  skillType: SkillType;
  effects: SkillEffect[];
}

// スキルタイプ
export type SkillType = 'passive' | 'active' | 'ultimate';

// スキル効果
export interface SkillEffect {
  type: SkillEffectType;
  value: number;
  duration?: number;
}

// スキル効果タイプ
export type SkillEffectType = 
  | 'paddleSize'
  | 'paddleSpeed' 
  | 'ballSpeed'
  | 'ballDamage'
  | 'multiball'
  | 'penetrating'
  | 'criticalChance'
  | 'experienceBoost';

// アクティブなスキル効果
export interface ActiveSkillEffect extends SkillEffect {
  skillId: string;
  startTime: number;
  endTime?: number;
}

// スキルクールダウン情報
export interface SkillCooldown {
  skillId: string;
  lastUsed: number;
  isReady: boolean;
}