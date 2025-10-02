import { describe, it, expect, beforeEach } from 'vitest';
import { PaddleEntity } from '../game/entities/PaddleEntity';

describe('Paddle Control System', () => {
  let paddle: PaddleEntity;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    paddle = new PaddleEntity(
      'test-paddle',
      { x: 350, y: 570 },
      100, // width (初期値)
      20,  // height
      300, // speed (初期値)
      canvasWidth
    );
  });

  describe('1.2 パドル操作システム', () => {
    it('should initialize with correct default values', () => {
      expect(paddle.width).toBe(100); // 初期サイズ
      expect(paddle.height).toBe(20);
      expect(paddle.speed).toBe(300); // 初期速度 300px/秒
      expect(paddle.x).toBe(350);
      expect(paddle.y).toBe(570);
    });

    it('should move left when moveLeft is called', () => {
      const initialX = paddle.x;
      
      paddle.moveLeft();
      paddle.update(16); // 16ms更新
      
      expect(paddle.x).toBeLessThan(initialX);
    });

    it('should move right when moveRight is called', () => {
      const initialX = paddle.x;
      
      paddle.moveRight();
      paddle.update(16); // 16ms更新
      
      expect(paddle.x).toBeGreaterThan(initialX);
    });

    it('should stop when stop is called', () => {
      paddle.moveLeft();
      paddle.stop();
      
      const xBeforeUpdate = paddle.x;
      paddle.update(16);
      
      expect(paddle.x).toBe(xBeforeUpdate); // 位置が変わらない
    });

    it('should provide smooth continuous movement', () => {
      paddle.moveRight();
      
      const positions = [];
      for (let i = 0; i < 5; i++) {
        paddle.update(16);
        positions.push(paddle.x);
      }
      
      // 各フレームで位置が滑らかに変化
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
        
        // フレーム間の移動量が一定
        if (i > 1) {
          const delta1 = positions[i] - positions[i - 1];
          const delta2 = positions[i - 1] - positions[i - 2];
          expect(Math.abs(delta1 - delta2)).toBeLessThan(0.1);
        }
      }
    });

    it('should respect field boundaries', () => {
      // 左境界テスト
      paddle.x = 10;
      paddle.moveLeft();
      paddle.update(100); // 長時間更新
      
      expect(paddle.x).toBeGreaterThanOrEqual(0); // 左端を越えない
      
      // 右境界テスト
      paddle.x = canvasWidth - paddle.width - 10;
      paddle.moveRight();
      paddle.update(100); // 長時間更新
      
      expect(paddle.x).toBeLessThanOrEqual(canvasWidth - paddle.width); // 右端を越えない
    });

    it('should calculate movement based on deltaTime', () => {
      paddle.moveRight();
      
      // 異なるdeltaTimeでの移動距離をテスト
      const startX = paddle.x;
      paddle.update(32); // 32ms (30FPS相当)
      const distance32ms = paddle.x - startX;
      
      paddle.x = startX; // リセット
      paddle.update(16); // 16ms (60FPS相当)
      const distance16ms = paddle.x - startX;
      
      // 時間に比例した移動距離
      expect(distance32ms / distance16ms).toBeCloseTo(2, 1);
    });
  });

  describe('Player Level Scaling', () => {
    it('should adjust size based on player level', () => {
      const level1Size = 100;
      const level5Size = 100 + (5 - 1) * 5; // レベル×5の増加
      
      paddle.setSize(level5Size, 20);
      
      expect(paddle.width).toBe(level5Size);
      expect(level5Size).toBeGreaterThan(level1Size);
    });

    it('should adjust speed based on player level', () => {
      const level1Speed = 300;
      const level5Speed = 300 + (5 - 1) * 10; // レベル×10の増加
      
      paddle.setSpeed(level5Speed);
      
      expect(paddle.speed).toBe(level5Speed);
      expect(level5Speed).toBeGreaterThan(level1Speed);
    });

    it('should maintain proportional movement with increased speed', () => {
      const originalSpeed = paddle.speed;
      const newSpeed = originalSpeed * 1.5;
      
      paddle.setSpeed(newSpeed);
      paddle.moveRight();
      
      const startX = paddle.x;
      paddle.update(16);
      const distance = paddle.x - startX;
      
      const expectedDistance = newSpeed * (16 / 1000);
      expect(distance).toBeCloseTo(expectedDistance, 2);
    });
  });

  describe('Boundary Collision Detection', () => {
    it('should clamp position to valid range during update', () => {
      // 左境界越えをシミュレート
      paddle.x = -50; // 境界外
      paddle.update(16);
      
      expect(paddle.x).toBe(0); // 左端に補正
      
      // 右境界越えをシミュレート
      paddle.x = canvasWidth; // 境界外
      paddle.update(16);
      
      expect(paddle.x).toBe(canvasWidth - paddle.width); // 右端に補正
    });

    it('should handle size changes with boundary adjustment', () => {
      // パドルを右端近くに配置
      paddle.x = canvasWidth - paddle.width - 10;
      
      // サイズを大きくする
      const newWidth = paddle.width * 2;
      paddle.setSize(newWidth, paddle.height);
      paddle.update(16);
      
      // 新しいサイズで境界内に調整される
      expect(paddle.x + paddle.width).toBeLessThanOrEqual(canvasWidth);
    });
  });

  describe('Input Response', () => {
    it('should respond immediately to input changes', () => {
      paddle.moveLeft();
      const leftVelocity = paddle.velocity?.x || 0;
      
      paddle.moveRight();
      const rightVelocity = paddle.velocity?.x || 0;
      
      paddle.stop();
      const stopVelocity = paddle.velocity?.x || 0;
      
      expect(leftVelocity).toBeLessThan(0);
      expect(rightVelocity).toBeGreaterThan(0);
      expect(stopVelocity).toBe(0);
    });

    it('should handle rapid input changes', () => {
      // 高速な入力変更をシミュレート
      paddle.moveLeft();
      paddle.stop();
      paddle.moveRight();
      paddle.stop();
      paddle.moveLeft();
      
      // 最終状態が正しく反映される
      const finalX = paddle.x;
      paddle.update(16);
      
      expect(paddle.x).toBeLessThan(finalX); // 左移動が適用
    });
  });
});