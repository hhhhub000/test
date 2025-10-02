import { Skill, SkillEffectType, ActiveSkillEffect, SkillCooldown } from '../../types';

// デフォルトスキル定義
export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'power_shot',
    name: 'パワーショット',
    description: 'ボールの威力が一時的に2倍になる',
    requiredLevel: 3,
    cooldown: 10000, // 10秒
    duration: 5000, // 5秒
    skillType: 'active',
    effects: [
      { type: 'ballDamage', value: 2, duration: 5000 }
    ]
  },
  {
    id: 'speed_boost',
    name: 'スピードブースト',
    description: 'パドルの移動速度が一時的に1.5倍になる',
    requiredLevel: 5,
    cooldown: 15000, // 15秒
    duration: 6000, // 6秒
    skillType: 'active',
    effects: [
      { type: 'paddleSpeed', value: 1.5, duration: 6000 }
    ]
  },
  {
    id: 'critical_master',
    name: 'クリティカルマスター',
    description: 'クリティカル率が永続的に10%上昇',
    requiredLevel: 7,
    cooldown: 0,
    skillType: 'passive',
    effects: [
      { type: 'criticalChance', value: 0.1 }
    ]
  },
  {
    id: 'experience_boost',
    name: '経験値ブースト',
    description: '獲得経験値が永続的に25%上昇',
    requiredLevel: 10,
    cooldown: 0,
    skillType: 'passive',
    effects: [
      { type: 'experienceBoost', value: 0.25 }
    ]
  }
];

export class SkillSystem {
  private activeEffects: ActiveSkillEffect[] = [];
  private cooldowns: Map<string, SkillCooldown> = new Map();

  // スキルを使用する
  useSkill(skill: Skill): boolean {
    const cooldown = this.cooldowns.get(skill.id);
    const now = Date.now();

    // クールダウン中かチェック
    if (cooldown && now < cooldown.lastUsed + skill.cooldown) {
      return false;
    }

    // パッシブスキルは即座に効果適用
    if (skill.skillType === 'passive') {
      return true;
    }

    // アクティブスキルの効果を追加
    for (const effect of skill.effects) {
      const activeEffect: ActiveSkillEffect = {
        ...effect,
        skillId: skill.id,
        startTime: now,
        endTime: effect.duration ? now + effect.duration : undefined,
      };
      this.activeEffects.push(activeEffect);
    }

    // クールダウンを設定
    this.cooldowns.set(skill.id, {
      skillId: skill.id,
      lastUsed: now,
      isReady: false,
    });

    return true;
  }

  // アクティブ効果を更新（期限切れの効果を削除）
  updateActiveEffects(): void {
    const now = Date.now();
    this.activeEffects = this.activeEffects.filter(effect => {
      return !effect.endTime || now < effect.endTime;
    });

    // クールダウンの更新
    for (const [skillId, cooldown] of this.cooldowns) {
      const skill = DEFAULT_SKILLS.find(s => s.id === skillId);
      if (skill) {
        cooldown.isReady = now >= cooldown.lastUsed + skill.cooldown;
      }
    }
  }

  // 特定の効果タイプの現在の値を取得
  getEffectValue(effectType: SkillEffectType): number {
    let totalValue = 0;
    for (const effect of this.activeEffects) {
      if (effect.type === effectType) {
        totalValue += effect.value;
      }
    }
    return totalValue;
  }

  // スキルがクールダウン中かどうか
  isSkillOnCooldown(skillId: string): boolean {
    const cooldown = this.cooldowns.get(skillId);
    return cooldown ? !cooldown.isReady : false;
  }

  // スキルの残りクールダウン時間を取得
  getSkillCooldownRemaining(skillId: string): number {
    const cooldown = this.cooldowns.get(skillId);
    const skill = DEFAULT_SKILLS.find(s => s.id === skillId);
    
    if (!cooldown || !skill) return 0;
    
    const now = Date.now();
    const remaining = (cooldown.lastUsed + skill.cooldown) - now;
    return Math.max(0, remaining);
  }

  // プレイヤーレベルに基づいて利用可能なスキルを取得
  getAvailableSkills(playerLevel: number): Skill[] {
    return DEFAULT_SKILLS.filter(skill => skill.requiredLevel <= playerLevel);
  }

  // アクティブな効果を全て取得
  getActiveEffects(): ActiveSkillEffect[] {
    return [...this.activeEffects];
  }

  // すべての効果をクリア
  clearAllEffects(): void {
    this.activeEffects = [];
    this.cooldowns.clear();
  }
}