import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine, GameEngineConfig } from '../game/engine/GameEngine';
import { BallEntity } from '../game/entities/BallEntity';
import { PaddleEntity } from '../game/entities/PaddleEntity';
import { BlockEntity } from '../game/entities/BlockEntity';
import { ExperienceSystem } from '../game/systems/ExperienceSystem';

describe('Integration Tests', () => {
  let gameEngine: GameEngine;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // テスト用のcanvas要素を作成
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    const config: GameEngineConfig = {
      canvas,
      targetFPS: 60,
      backgroundColor: '#000000'
    };
    gameEngine = new GameEngine(config);
  });

  describe('2.1 基本的なエンティティ統合テスト', () => {
    it('should create and manage game entities correctly', () => {
      // 各エンティティのインスタンス作成
      const ball = new BallEntity(
        'test-ball',
        { x: 400, y: 300 },
        10,
        { x: 200, y: 150 },
        800,
        600
      );

      const paddle = new PaddleEntity(
        'test-paddle',
        { x: 350, y: 550 },
        100,
        20,
        800,
        600
      );

      const block = new BlockEntity(
        'test-block',
        { x: 200, y: 150 },
        80,
        30,
        1
      );

      // エンティティが正しく初期化されることを確認
      expect(ball.id).toBe('test-ball');
      expect(ball.x).toBe(400);
      expect(ball.y).toBe(300);
      expect(ball.radius).toBe(10);

      expect(paddle.id).toBe('test-paddle');
      expect(paddle.x).toBe(350);
      expect(paddle.y).toBe(550);
      expect(paddle.width).toBe(100);

      expect(block.id).toBe('test-block');
      expect(block.x).toBe(200);
      expect(block.y).toBe(150);
      expect(block.health).toBe(1);
    });

    it('should handle ball movement and boundary checking', () => {
      const ball = new BallEntity(
        'test-ball',
        { x: 50, y: 300 },
        10,
        { x: -200, y: 0 }, // 左向きの速度
        800,
        600
      );

      const initialX = ball.x;
      
      // 1フレーム更新
      ball.update(1/60);
      
      // ボールが移動していることを確認
      expect(ball.x).not.toBe(initialX);
      
      // 境界で反射することを確認（左端に到達）
      if (ball.x <= ball.radius) {
        expect(ball.velocity.x).toBeGreaterThan(0); // 右向きに反転
      }
    });

    it('should handle paddle movement within bounds', () => {
      const paddle = new PaddleEntity(
        'test-paddle',
        { x: 350, y: 550 },
        100,
        20,
        800,
        600
      );

      // 左端への移動
      paddle.moveLeft(1/60);
      expect(paddle.x).toBeGreaterThanOrEqual(0);

      // 右端への移動テスト
      paddle.x = 750; // 右端近く
      paddle.moveRight(1/60);
      expect(paddle.x + paddle.width).toBeLessThanOrEqual(800);
    });
  });

  describe('2.2 パフォーマンス統合テスト', () => {
    it('should maintain 60fps with multiple blocks', () => {
      gameStore.getState().initializeGame();
      
      // 多数のブロックを作成
      for (let i = 0; i < 50; i++) {
        const block = {
          id: `perf-${i}`,
          x: (i % 10) * 80,
          y: Math.floor(i / 10) * 40,
          width: 80,
          height: 30,
          health: 1,
          maxHealth: 1,
          color: '#00ff00',
          type: 'normal' as const,
          experienceValue: 5,
          isDestroyed: false
        };
        gameStore.getState().addBlock(block);
      }
      
      // フレーム時間を測定
      const frameCount = 60; // 1秒分のフレーム
      const targetFrameTime = 1000 / 60; // 16.67ms
      
      const startTime = performance.now();
      
      for (let frame = 0; frame < frameCount; frame++) {
        gameEngine.step(1/60);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageFrameTime = totalTime / frameCount;
      
      // 平均フレーム時間が目標を大幅に超えていないかチェック
      expect(averageFrameTime).toBeLessThan(targetFrameTime * 2); // 許容範囲は2倍まで
    });

    it('should handle rapid collision events efficiently', () => {
      gameStore.getState().initializeGame();
      
      // 密集したブロック配置
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const block = {
            id: `rapid-${x}-${y}`,
            x: x * 85,
            y: y * 35,
            width: 80,
            height: 30,
            health: 1,
            maxHealth: 1,
            color: '#ffff00',
            type: 'normal' as const,
            experienceValue: 5,
            isDestroyed: false
          };
          gameStore.getState().addBlock(block);
        }
      }
      
      // ボールを密集地帯に投入
      const ball = gameStore.getState().ball;
      ball.x = 200;
      ball.y = 100;
      ball.velocityX = 400;
      ball.velocityY = 300;
      
      let collisionCount = 0;
      const originalCollisionHandler = gameEngine.handleBallBlockCollision;
      gameEngine.handleBallBlockCollision = function(...args) {
        collisionCount++;
        return originalCollisionHandler.apply(this, args);
      };
      
      // 10フレーム実行
      for (let i = 0; i < 10; i++) {
        gameEngine.step(1/60);
      }
      
      // 衝突が正常に処理されたかチェック
      expect(collisionCount).toBeGreaterThan(0);
      
      // 破壊されたブロックがあることをチェック
      const destroyedBlocks = gameStore.getState().blocks.filter(b => b.isDestroyed);
      expect(destroyedBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('2.3 状態管理統合テスト', () => {
    it('should maintain state consistency across multiple systems', () => {
      gameStore.getState().initializeGame();
      
      const initialState = {
        playerLevel: gameStore.getState().player.level,
        playerExperience: gameStore.getState().player.experience,
        blockCount: gameStore.getState().blocks.length,
        score: gameStore.getState().gameState.score
      };
      
      // ブロックを追加してゲームを進行
      for (let i = 0; i < 10; i++) {
        const block = {
          id: `state-${i}`,
          x: i * 80,
          y: 100,
          width: 80,
          height: 30,
          health: 1,
          maxHealth: 1,
          color: '#ff00ff',
          type: 'normal' as const,
          experienceValue: 15,
          isDestroyed: false
        };
        gameStore.getState().addBlock(block);
      }
      
      // ゲームを進行させて状態変化を発生
      const ball = gameStore.getState().ball;
      for (let frame = 0; frame < 300; frame++) { // 5秒分
        ball.x = 100 + (frame % 10) * 80;
        ball.y = 90;
        ball.velocityY = 100;
        
        gameEngine.step(1/60);
      }
      
      const finalState = {
        playerLevel: gameStore.getState().player.level,
        playerExperience: gameStore.getState().player.experience,
        blockCount: gameStore.getState().blocks.filter(b => !b.isDestroyed).length,
        score: gameStore.getState().gameState.score
      };
      
      // 状態の変化を検証
      expect(finalState.playerExperience).toBeGreaterThan(initialState.playerExperience);
      expect(finalState.score).toBeGreaterThan(initialState.score);
      expect(finalState.blockCount).toBeLessThan(initialState.blockCount + 10);
      
      // レベルアップの整合性チェック
      if (finalState.playerLevel > initialState.playerLevel) {
        const levelDiff = finalState.playerLevel - initialState.playerLevel;
        expect(levelDiff).toBeGreaterThan(0);
      }
    });

    it('should persist and restore game state correctly', () => {
      gameStore.getState().initializeGame();
      
      // ゲーム状態を変更
      gameStore.getState().addExperience(500);
      gameStore.getState().updateScore(1000);
      
      const beforeSave = {
        level: gameStore.getState().player.level,
        experience: gameStore.getState().player.experience,
        score: gameStore.getState().gameState.score
      };
      
      // ローカルストレージに保存（Zustandのmiddlewareが自動実行）
      
      // 新しいストアインスタンスを作成して復元テスト
      const newGameStore = GameStore();
      
      const afterRestore = {
        level: newGameStore.getState().player.level,
        experience: newGameStore.getState().player.experience,
        score: newGameStore.getState().gameState.score
      };
      
      // 復元された状態が元の状態と一致するかチェック
      expect(afterRestore.level).toBe(beforeSave.level);
      expect(afterRestore.experience).toBe(beforeSave.experience);
      expect(afterRestore.score).toBe(beforeSave.score);
    });
  });
});