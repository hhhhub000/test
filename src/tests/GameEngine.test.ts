import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../game/engine/GameEngine';
import { BallEntity } from '../game/entities/BallEntity';
import { PaddleEntity } from '../game/entities/PaddleEntity';
import { BlockEntity } from '../game/entities/BlockEntity';

describe('Game Engine Tests', () => {
  describe('3.1 ゲームループとフレーム制御', () => {
    let canvas: HTMLCanvasElement;
    let gameEngine: GameEngine;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      document.body.appendChild(canvas);
      
      const config = {
        canvas,
        targetFPS: 60,
        backgroundColor: '#000000'
      };
      gameEngine = new GameEngine(config);
    });

    it('should initialize game engine with correct canvas dimensions', () => {
      expect(gameEngine.canvas.width).toBe(800);
      expect(gameEngine.canvas.height).toBe(600);
    });

    it('should handle frame timing correctly', () => {
      // 60FPSでの1フレーム時間
      const targetFrameTime = 1000 / 60; // 16.67ms
      const tolerance = 2; // 2msの許容誤差
      
      const frameStartTime = performance.now();
      
      // フレーム処理をシミュレート（実際のゲームロジック相当の処理時間）
      const mockDeltaTime = 1/60;
      gameEngine.update(mockDeltaTime);
      
      const frameEndTime = performance.now();
      const actualFrameTime = frameEndTime - frameStartTime;
      
      // フレーム時間が過度に長くないことをチェック
      expect(actualFrameTime).toBeLessThan(targetFrameTime + tolerance);
    });

    it('should maintain consistent update cycle', () => {
      const updateTimes: number[] = [];
      const frameCount = 10;
      
      for (let i = 0; i < frameCount; i++) {
        const startTime = performance.now();
        gameEngine.update(1/60);
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }
      
      // 更新時間の分散を計算
      const avgTime = updateTimes.reduce((sum, time) => sum + time, 0) / frameCount;
      const variance = updateTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / frameCount;
      const standardDeviation = Math.sqrt(variance);
      
      // 標準偏差が平均時間の50%以下であることをチェック（一定性の確保）
      expect(standardDeviation).toBeLessThan(avgTime * 0.5);
    });

    it('should handle variable delta time correctly', () => {
      const ball = new BallEntity(400, 300, 10);
      ball.velocityX = 200; // 200px/s
      ball.velocityY = 150; // 150px/s
      
      const initialX = ball.x;
      const initialY = ball.y;
      
      // 異なるdeltaTimeでの更新テスト
      const deltaTime1 = 1/60; // 60FPS
      ball.update(deltaTime1);
      
      const expectedX1 = initialX + ball.velocityX * deltaTime1;
      const expectedY1 = initialY + ball.velocityY * deltaTime1;
      
      expect(ball.x).toBeCloseTo(expectedX1, 3);
      expect(ball.y).toBeCloseTo(expectedY1, 3);
      
      // より大きなdeltaTimeでのテスト
      const deltaTime2 = 1/30; // 30FPS
      const beforeX = ball.x;
      const beforeY = ball.y;
      
      ball.update(deltaTime2);
      
      const expectedX2 = beforeX + ball.velocityX * deltaTime2;
      const expectedY2 = beforeY + ball.velocityY * deltaTime2;
      
      expect(ball.x).toBeCloseTo(expectedX2, 3);
      expect(ball.y).toBeCloseTo(expectedY2, 3);
    });
  });

  describe('3.2 レンダリングシステム', () => {
    let canvas: HTMLCanvasElement;
    let gameEngine: GameEngine;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      ctx = canvas.getContext('2d')!;
      gameEngine = new GameEngine(canvas);
    });

    it('should clear canvas before each render', () => {
      // キャンバスに何かを描画
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
      
      // 描画前のピクセルデータを取得
      const imageDataBefore = ctx.getImageData(50, 50, 1, 1);
      const redPixel = imageDataBefore.data[0]; // R値
      expect(redPixel).toBeGreaterThan(0); // 赤い色が描画されている
      
      // レンダリング実行（内部でクリアが実行される）
      gameEngine.render();
      
      // 描画後のピクセルデータを取得
      const imageDataAfter = ctx.getImageData(50, 50, 1, 1);
      const clearedPixel = imageDataAfter.data[0]; // R値
      expect(clearedPixel).toBe(0); // クリアされている
    });

    it('should render all game entities', () => {
      const ball = new BallEntity(100, 100, 10);
      const paddle = new PaddleEntity(350, 550, 100, 20);
      const block = new BlockEntity('test', 200, 150, 80, 30, 1, 'normal');
      
      // スパイを設定してレンダリング呼び出しを監視
      const ballRenderSpy = vi.spyOn(ball, 'render');
      const paddleRenderSpy = vi.spyOn(paddle, 'render');
      const blockRenderSpy = vi.spyOn(block, 'render');
      
      // エンティティをエンジンに追加（実際の実装に応じて調整）
      gameEngine.entities = [ball, paddle, block];
      
      // レンダリング実行
      gameEngine.render();
      
      // 各エンティティのrenderメソッドが呼ばれたことを確認
      expect(ballRenderSpy).toHaveBeenCalled();
      expect(paddleRenderSpy).toHaveBeenCalled();
      expect(blockRenderSpy).toHaveBeenCalled();
    });

    it('should handle rendering with empty entity list', () => {
      // エンティティなしでレンダリング
      gameEngine.entities = [];
      
      // エラーが発生しないことを確認
      expect(() => gameEngine.render()).not.toThrow();
    });

    it('should maintain consistent render order', () => {
      const renderOrder: string[] = [];
      
      const ball = new BallEntity(100, 100, 10);
      const paddle = new PaddleEntity(350, 550, 100, 20);
      const block = new BlockEntity('test', 200, 150, 80, 30, 1, 'normal');
      
      // レンダリング順序を記録するためのスパイ
      ball.render = vi.fn().mockImplementation(() => renderOrder.push('ball'));
      paddle.render = vi.fn().mockImplementation(() => renderOrder.push('paddle'));
      block.render = vi.fn().mockImplementation(() => renderOrder.push('block'));
      
      gameEngine.entities = [ball, paddle, block];
      gameEngine.render();
      
      // レンダリング順序が一定であることを確認
      expect(renderOrder).toEqual(['ball', 'paddle', 'block']);
    });
  });

  describe('3.3 入力処理システム', () => {
    let canvas: HTMLCanvasElement;
    let gameEngine: GameEngine;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      document.body.appendChild(canvas);
      gameEngine = new GameEngine(canvas);
    });

    it('should handle keyboard input events', () => {
      let leftPressed = false;
      let rightPressed = false;
      
      // キーボードイベントハンドラーを設定
      gameEngine.onKeyDown = (key: string) => {
        if (key === 'ArrowLeft') leftPressed = true;
        if (key === 'ArrowRight') rightPressed = true;
      };
      
      // キーダウンイベントをシミュレート
      const leftKeyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const rightKeyEvent = new KeyboardEvent('keydown', { code: 'ArrowRight' });
      
      document.dispatchEvent(leftKeyEvent);
      document.dispatchEvent(rightKeyEvent);
      
      expect(leftPressed).toBe(true);
      expect(rightPressed).toBe(true);
    });

    it('should handle mouse/touch input for paddle control', () => {
      const paddle = new PaddleEntity(350, 550, 100, 20);
      gameEngine.paddle = paddle;
      
      const initialPaddleX = paddle.x;
      
      // マウス移動イベントをシミュレート
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 500, // マウスX座標
        clientY: 300
      });
      
      // キャンバスの境界情報をモック
      canvas.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      });
      
      // マウス移動ハンドラーを実行
      gameEngine.handleMouseMove(mouseEvent);
      
      // パドルがマウス位置に追従していることを確認
      expect(paddle.x).not.toBe(initialPaddleX);
      expect(paddle.x).toBeCloseTo(500 - paddle.width / 2, 1);
    });

    it('should clamp paddle position within canvas bounds', () => {
      const paddle = new PaddleEntity(350, 550, 100, 20);
      gameEngine.paddle = paddle;
      
      canvas.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      });
      
      // 左端を超える位置
      const leftMouseEvent = new MouseEvent('mousemove', {
        clientX: -50,
        clientY: 300
      });
      
      gameEngine.handleMouseMove(leftMouseEvent);
      expect(paddle.x).toBeGreaterThanOrEqual(0);
      
      // 右端を超える位置
      const rightMouseEvent = new MouseEvent('mousemove', {
        clientX: 900, // canvas幅(800)を超える
        clientY: 300
      });
      
      gameEngine.handleMouseMove(rightMouseEvent);
      expect(paddle.x + paddle.width).toBeLessThanOrEqual(800);
    });
  });

  describe('3.4 メモリ管理とパフォーマンス', () => {
    let canvas: HTMLCanvasElement;
    let gameEngine: GameEngine;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      gameEngine = new GameEngine(canvas);
    });

    it('should clean up destroyed entities efficiently', () => {
      // 多数のブロックを生成
      const initialBlockCount = 100;
      const blocks: BlockEntity[] = [];
      
      for (let i = 0; i < initialBlockCount; i++) {
        const block = new BlockEntity(`block-${i}`, i * 10, 100, 80, 30, 1, 'normal');
        blocks.push(block);
      }
      
      gameEngine.blocks = blocks;
      
      // 半分のブロックを破壊
      for (let i = 0; i < initialBlockCount / 2; i++) {
        blocks[i].destroy();
      }
      
      // クリーンアップ実行
      gameEngine.cleanupDestroyedEntities();
      
      // 破壊されたエンティティが削除されていることを確認
      const remainingBlocks = gameEngine.blocks.filter(block => !block.isDestroyed);
      expect(remainingBlocks.length).toBe(initialBlockCount / 2);
    });

    it('should handle memory usage during extended gameplay', () => {
      // メモリ使用量の基準値を取得
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // 大量の短命オブジェクトを生成・破棄
      for (let cycle = 0; cycle < 10; cycle++) {
        const tempBlocks: BlockEntity[] = [];
        
        // 大量生成
        for (let i = 0; i < 1000; i++) {
          tempBlocks.push(new BlockEntity(`temp-${cycle}-${i}`, 0, 0, 10, 10, 1, 'normal'));
        }
        
        // 即座に破棄
        tempBlocks.forEach(block => block.destroy());
        
        // ガベージコレクションを促進
        if (global.gc) {
          global.gc();
        }
      }
      
      // メモリ使用量の変化をチェック
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const maxAcceptableIncrease = 10 * 1024 * 1024; // 10MB
        
        expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease);
      }
    });

    it('should optimize collision detection for many entities', () => {
      const entityCount = 200;
      const entities: (BallEntity | BlockEntity)[] = [];
      
      // 多数のエンティティを作成
      for (let i = 0; i < entityCount; i++) {
        if (i % 2 === 0) {
          entities.push(new BallEntity(i * 5, 100, 5));
        } else {
          entities.push(new BlockEntity(`block-${i}`, i * 5, 150, 20, 20, 1, 'normal'));
        }
      }
      
      gameEngine.entities = entities;
      
      // 衝突検出の実行時間を測定
      const startTime = performance.now();
      
      gameEngine.checkAllCollisions();
      
      const endTime = performance.now();
      const collisionTime = endTime - startTime;
      
      // 衝突検出が合理的な時間内に完了することを確認（例：5ms以内）
      expect(collisionTime).toBeLessThan(5);
    });
  });
});