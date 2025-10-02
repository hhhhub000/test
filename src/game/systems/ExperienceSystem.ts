import { Player, PlayerStats, PlayerAttributes } from '../../types';

export class ExperienceSystem {
  // レベルアップに必要な経験値を計算
  static calculateExperienceRequired(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // 総経験値からレベルを計算
  static calculateLevelFromTotalExperience(totalExperience: number): number {
    let level = 1;
    let requiredExp = 0;
    
    while (requiredExp <= totalExperience) {
      level++;
      requiredExp += this.calculateExperienceRequired(level - 1);
    }
    
    return level - 1;
  }

  // 経験値を追加してレベルアップ判定
  static addExperience(player: Player, experienceGain: number): {
    leveledUp: boolean;
    levelsGained: number;
    newLevel: number;
  } {
    player.stats.totalExperience += experienceGain;
    player.stats.experience += experienceGain;

    let leveledUp = false;
    let levelsGained = 0;

    // レベルアップ判定
    while (player.stats.experience >= player.stats.experienceToNext) {
      player.stats.experience -= player.stats.experienceToNext;
      player.stats.level++;
      player.stats.skillPoints++;
      levelsGained++;
      leveledUp = true;

      // 次のレベルに必要な経験値を更新
      player.stats.experienceToNext = this.calculateExperienceRequired(player.stats.level);
    }

    return {
      leveledUp,
      levelsGained,
      newLevel: player.stats.level,
    };
  }

  // プレイヤーの初期化
  static initializePlayer(): Player {
    const initialStats: PlayerStats = {
      level: 1,
      experience: 0,
      experienceToNext: this.calculateExperienceRequired(1),
      totalExperience: 0,
      skillPoints: 0,
    };

    const initialAttributes: PlayerAttributes = {
      paddleSize: 100,
      paddleSpeed: 300,
      ballSpeed: 250,
      ballDamage: 10,
      criticalChance: 0.05,
      experienceMultiplier: 1.0,
    };

    return {
      stats: initialStats,
      attributes: initialAttributes,
      unlockedSkills: [],
      activeSkills: [],
    };
  }

  // レベルアップ時の能力値自動強化
  static applyLevelUpBonuses(player: Player): void {
    const level = player.stats.level;
    
    // レベルごとの基本能力値を計算
    player.attributes.paddleSize = Math.floor(100 + (level - 1) * 5);
    player.attributes.paddleSpeed = Math.floor(300 + (level - 1) * 10);
    player.attributes.ballSpeed = Math.floor(250 + (level - 1) * 8);
    player.attributes.ballDamage = Math.floor(10 + (level - 1) * 2);
    player.attributes.criticalChance = Math.min(0.05 + (level - 1) * 0.02, 0.5);
    player.attributes.experienceMultiplier = 1.0 + (level - 1) * 0.1;
  }
}