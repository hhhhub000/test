import { MonsterType } from '../../types';

// デフォルトのモンスタータイプ定義
export const MONSTER_TYPES: MonsterType[] = [
  {
    id: 'goblin',
    name: 'ゴブリン',
    maxHealth: 20,
    experienceValue: 15,
    color: '#16a34a',
  },
  {
    id: 'orc',
    name: 'オーク',
    color: '#dc2626',
    maxHealth: 35,
    experienceValue: 25,
  },
  {
    id: 'troll',
    name: 'トロール',
    maxHealth: 60,
    experienceValue: 40,
    color: '#7c3aed',
  },
  {
    id: 'dragon',
    name: 'ドラゴン',
    maxHealth: 100,
    experienceValue: 75,
    color: '#f59e0b',
    specialAbility: 'regeneration',
  },
];

export class MonsterSystem {
  // プレイヤーレベルに基づいてモンスタータイプを選択
  static selectMonsterType(playerLevel: number): MonsterType {
    // レベルが低いうちは弱いモンスターを優先
    const availableTypes = MONSTER_TYPES.filter(type => {
      if (playerLevel <= 3) return type.id === 'goblin';
      if (playerLevel <= 6) return ['goblin', 'orc'].includes(type.id);
      if (playerLevel <= 10) return ['goblin', 'orc', 'troll'].includes(type.id);
      return true; // 高レベルは全種類出現
    });

    // ランダムに選択（低レベルほど弱いモンスターが出やすい）
    const weights = availableTypes.map((_, index) => {
      return Math.pow(0.7, index); // 後ろの要素ほど出現率が低い
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableTypes[i];
      }
    }

    return availableTypes[availableTypes.length - 1];
  }

  // モンスターブロック出現確率を計算
  static getMonsterSpawnRate(playerLevel: number): number {
    // レベルが上がるほど出現率も上がる（最大30%）
    return Math.min(0.05 + (playerLevel - 1) * 0.02, 0.3);
  }

  // モンスタータイプをIDで取得
  static getMonsterTypeById(id: string): MonsterType | undefined {
    return MONSTER_TYPES.find(type => type.id === id);
  }

  // すべてのモンスタータイプを取得
  static getAllMonsterTypes(): MonsterType[] {
    return [...MONSTER_TYPES];
  }
}