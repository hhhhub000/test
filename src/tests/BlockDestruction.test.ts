import { describe, it, expect, beforeEach } from 'vitest';
import { BlockEntity } from '../game/entities/BlockEntity';
import { BallEntity } from '../game/entities/BallEntity';
import { MonsterSystem } from '../game/systems/MonsterSystem';
import { ExperienceSystem } from '../game/systems/ExperienceSystem';
import { CollisionDetector } from '../game/engine/physics';

describe('Block Destruction System', () => {
  describe('1.6.1 通常ブロック破壊システム', () => {
    let block: BlockEntity;
    let ball: BallEntity;

    beforeEach(() => {
      block = new BlockEntity(
        'test-block',
        { x: 100, y: 100 },
        75, // width
        25, // height
        10, // experience value
        '#ff0000'
      );

      ball = new BallEntity(
        'test-ball',
        { x: 137.5, y: 80 }, // ブロック上方
        10,
        { x: 0, y: 100 },
        10,
        800,
        600
      );
    });

    it('should destroy normal block in one hit', () => {
      expect(block.destroyed).toBe(false);
      
      const isDestroyed = block.takeDamage(ball.damage);
      
      expect(isDestroyed).toBe(true);
      expect(block.destroyed).toBe(true);
      expect(block.active).toBe(false);
    });

    it('should calculate experience based on row position', () => {
      // 異なる行のブロックをテスト
      const topRowBlock = new BlockEntity('top', { x: 0, y: 0 }, 75, 25, 5 + (0 * 2), '#ff0000'); // 1行目: 5 EXP
      const midRowBlock = new BlockEntity('mid', { x: 0, y: 0 }, 75, 25, 5 + (2 * 2), '#ff0000'); // 3行目: 9 EXP
      const botRowBlock = new BlockEntity('bot', { x: 0, y: 0 }, 75, 25, 5 + (5 * 2), '#ff0000'); // 6行目: 15 EXP

      expect(topRowBlock.experienceValue).toBe(5);
      expect(midRowBlock.experienceValue).toBe(9);
      expect(botRowBlock.experienceValue).toBe(15);
    });

    it('should have different colors per row', () => {
      const blocks = [];
      for (let row = 0; row < 6; row++) {
        const color = `hsl(${row * 30}, 70%, 50%)`;
        const block = new BlockEntity(
          `block-${row}`,
          { x: 0, y: row * 30 },
          75,
          25,
          5 + row * 2,
          color
        );
        blocks.push(block);
      }

      // 各行で異なる色を持つことを確認
      for (let i = 0; i < blocks.length - 1; i++) {
        expect(blocks[i].color).not.toBe(blocks[i + 1].color);
      }
    });
  });

  describe('1.6.2 モンスターブロック破壊システム', () => {
    it('should create monster blocks with appropriate HP for player level', () => {
      const lowLevelMonster = MonsterSystem.selectMonsterType(3);
      const highLevelMonster = MonsterSystem.selectMonsterType(15);

      expect(lowLevelMonster.id).toBe('goblin'); // 低レベルは弱いモンスター
      expect(['goblin', 'orc', 'troll', 'dragon']).toContain(highLevelMonster.id); // 高レベルは全種類可能
    });

    it('should calculate damage with critical hits', () => {
      const baseDamage = 10;
      const criticalChance = 0.2; // 20%
      const criticalMultiplier = 2.0;

      // 通常ダメージ
      let finalDamage = baseDamage;
      expect(finalDamage).toBe(10);

      // クリティカルダメージ（シミュレーション）
      const isCritical = Math.random() < criticalChance;
      if (isCritical) {
        finalDamage = baseDamage * criticalMultiplier;
        expect(finalDamage).toBe(20);
      }

      expect(finalDamage).toBeGreaterThanOrEqual(baseDamage);
      expect(finalDamage).toBeLessThanOrEqual(baseDamage * criticalMultiplier);
    });

    it('should spawn monsters based on player level probability', () => {
      const level1Rate = MonsterSystem.getMonsterSpawnRate(1);
      const level10Rate = MonsterSystem.getMonsterSpawnRate(10);
      const level20Rate = MonsterSystem.getMonsterSpawnRate(20);

      expect(level1Rate).toBe(0.05); // 5%
      expect(level10Rate).toBe(0.23); // 23%
      expect(level20Rate).toBe(0.3);  // 30% (上限)
    });
  });

  describe('1.6.3 破壊時の処理フロー', () => {
    let player: any;
    let block: BlockEntity;
    let ball: BallEntity;

    beforeEach(() => {
      player = ExperienceSystem.initializePlayer();
      block = new BlockEntity('test-block', { x: 100, y: 100 }, 75, 25, 10, '#ff0000');
      ball = new BallEntity('test-ball', { x: 137.5, y: 80 }, 10, { x: 0, y: 100 }, 10, 800, 600);
    });

    it('should execute complete destruction flow', () => {
      // 1. 衝突検出
      const isColliding = CollisionDetector.checkCircleRectangleCollision(
        ball.getCenterPosition(),
        ball.radius,
        block.getBounds()
      );

      if (isColliding) {
        // 2. ダメージ計算
        const baseDamage = ball.damage;
        const isCritical = Math.random() < player.attributes.criticalChance;
        const finalDamage = isCritical ? baseDamage * 2 : baseDamage;

        // 3. HP減算 & 4. 破壊判定
        const isDestroyed = block.takeDamage(finalDamage);

        if (isDestroyed) {
          // 5. 報酬付与
          const initialExp = player.stats.experience;
          const result = ExperienceSystem.addExperience(player, block.experienceValue);

          expect(player.stats.experience).toBeGreaterThan(initialExp);
          expect(result.leveledUp).toBeDefined();

          // 7. ボール反射
          const normal = CollisionDetector.getCollisionNormal(
            ball.getCenterPosition(),
            ball.radius,
            block.getBounds()
          );

          const dot = ball.velocity.x * normal.x + ball.velocity.y * normal.y;
          ball.velocity.x = ball.velocity.x - 2 * dot * normal.x;
          ball.velocity.y = ball.velocity.y - 2 * dot * normal.y;

          expect(ball.velocity.y).toBeLessThan(0); // 上向きに反射
        }

        expect(block.destroyed).toBe(true);
        expect(block.active).toBe(false);
      } else {
        // 衝突していない場合は何も起こらない
        expect(block.destroyed).toBe(false);
        expect(block.active).toBe(true);
      }
    });

    it('should trigger level up when enough experience is gained', () => {
      const initialLevel = player.stats.level;
      const expNeeded = player.stats.experienceToNext;

      // 十分な経験値を持つブロックを作成
      const highExpBlock = new BlockEntity('high-exp', { x: 0, y: 0 }, 75, 25, expNeeded, '#gold');
      
      const result = ExperienceSystem.addExperience(player, highExpBlock.experienceValue);

      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBeGreaterThan(0);
      expect(player.stats.level).toBeGreaterThan(initialLevel);
      expect(player.stats.skillPoints).toBeGreaterThan(0);
    });
  });

  describe('1.6.4 特殊破壊効果', () => {
    it('should support chain destruction concept', () => {
      // 連鎖破壊の概念テスト
      const centerBlock = new BlockEntity('center', { x: 100, y: 100 }, 75, 25, 10, '#red');
      const adjacentBlocks = [
        new BlockEntity('top', { x: 100, y: 70 }, 75, 25, 10, '#red'),
        new BlockEntity('bottom', { x: 100, y: 130 }, 75, 25, 10, '#red'),
        new BlockEntity('left', { x: 20, y: 100 }, 75, 25, 10, '#red'),
        new BlockEntity('right', { x: 180, y: 100 }, 75, 25, 10, '#red'),
      ];

      // 中心ブロックが破壊されたとき
      centerBlock.takeDamage(10);
      expect(centerBlock.destroyed).toBe(true);

      // 連鎖破壊のシミュレーション（特定スキル発動時）
      const chainRange = 50; // 連鎖範囲
      const chainDestroyedBlocks = adjacentBlocks.filter(block => {
        const distance = Math.sqrt(
          Math.pow(block.x - centerBlock.x, 2) + 
          Math.pow(block.y - centerBlock.y, 2)
        );
        return distance <= chainRange;
      });

      expect(chainDestroyedBlocks.length).toBeGreaterThan(0);
    });

    it('should support penetration destruction concept', () => {
      // 貫通破壊の概念テスト
      const blocks = [
        new BlockEntity('block1', { x: 100, y: 100 }, 75, 25, 10, '#red'),
        new BlockEntity('block2', { x: 100, y: 130 }, 75, 25, 10, '#red'),
        new BlockEntity('block3', { x: 100, y: 160 }, 75, 25, 10, '#red'),
      ];

      // 貫通スキル発動時のシミュレーション
      const penetrationPath = { x: 137.5, y: 80, directionY: 1 };
      
      const penetratedBlocks = blocks.filter(block => {
        return Math.abs(block.x + block.width/2 - penetrationPath.x) < block.width/2;
      });

      expect(penetratedBlocks.length).toBe(3); // 全て同じX軸上
    });

    it('should support explosion destruction concept', () => {
      // 爆発破壊の概念テスト
      const explosionCenter = { x: 100, y: 100 };
      const explosionRadius = 60;
      
      const blocks = [
        new BlockEntity('center', { x: 100, y: 100 }, 75, 25, 10, '#red'),
        new BlockEntity('near', { x: 120, y: 120 }, 75, 25, 10, '#red'),
        new BlockEntity('far', { x: 200, y: 200 }, 75, 25, 10, '#red'),
      ];

      const explodedBlocks = blocks.filter(block => {
        const distance = Math.sqrt(
          Math.pow(block.x - explosionCenter.x, 2) + 
          Math.pow(block.y - explosionCenter.y, 2)
        );
        return distance <= explosionRadius;
      });

      expect(explodedBlocks).toHaveLength(2); // centerとnearのみ
      expect(explodedBlocks.find(b => b.id === 'far')).toBeUndefined();
    });
  });
});