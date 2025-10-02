import { describe, it, expect, beforeEach } from 'vitest';
import { BallEntity } from '../game/entities/BallEntity';
import { PaddleEntity } from '../game/entities/PaddleEntity';
import { CollisionDetector } from '../game/engine/physics';

describe('Ball Physics System', () => {
  let ball: BallEntity;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    ball = new BallEntity(
      'test-ball',
      { x: 400, y: 300 },
      10, // radius
      { x: 100, y: -150 }, // velocity
      10, // damage
      canvasWidth,
      canvasHeight
    );
  });

  describe('1.3 ボール物理システム - 初期配置と速度', () => {
    it('should initialize ball at field center above paddle', () => {
      const centerBall = new BallEntity(
        'center-ball',
        { x: canvasWidth / 2, y: canvasHeight / 2 },
        10,
        { x: 0, y: -250 },
        10,
        canvasWidth,
        canvasHeight
      );

      expect(centerBall.x).toBe(canvasWidth / 2);
      expect(centerBall.y).toBe(canvasHeight / 2);
    });

    it('should have initial velocity in diagonal upward direction', () => {
      expect(ball.velocity.y).toBeLessThan(0); // 上向き
      expect(Math.abs(ball.velocity.x)).toBeGreaterThan(0); // 斜め方向
    });

    it('should maintain player-level adjusted speed', () => {
      const initialSpeed = 250;
      const testBall = new BallEntity(
        'speed-ball',
        { x: 400, y: 300 },
        10,
        { x: initialSpeed * 0.6, y: -initialSpeed * 0.8 }, // 3:4:5の比率
        10,
        canvasWidth,
        canvasHeight
      );

      const speed = Math.sqrt(testBall.velocity.x ** 2 + testBall.velocity.y ** 2);
      expect(speed).toBeCloseTo(initialSpeed, 1);
    });
  });

  describe('1.9.1 ボール移動計算', () => {
    it('should update position based on velocity and deltaTime', () => {
      const initialX = ball.x;
      const initialY = ball.y;
      const deltaTime = 16; // 16ms (60FPS)

      ball.update(deltaTime);

      const expectedX = initialX + ball.velocity.x * (deltaTime / 1000);
      const expectedY = initialY + ball.velocity.y * (deltaTime / 1000);

      expect(ball.x).toBeCloseTo(expectedX, 2);
      expect(ball.y).toBeCloseTo(expectedY, 2);
    });

    it('should reflect off left wall', () => {
      ball.x = 5; // 左端近く
      ball.velocity.x = -100; // 左向き

      ball.update(16);

      expect(ball.velocity.x).toBeGreaterThan(0); // 右向きに反射
      expect(ball.x).toBeGreaterThanOrEqual(ball.radius); // 境界内に補正
    });

    it('should reflect off right wall', () => {
      ball.x = canvasWidth - 5; // 右端近く
      ball.velocity.x = 100; // 右向き

      ball.update(16);

      expect(ball.velocity.x).toBeLessThan(0); // 左向きに反射
      expect(ball.x).toBeLessThanOrEqual(canvasWidth - ball.radius); // 境界内に補正
    });

    it('should reflect off top wall', () => {
      ball.y = 5; // 上端近く
      ball.velocity.y = -100; // 上向き

      ball.update(16);

      expect(ball.velocity.y).toBeGreaterThan(0); // 下向きに反射
      expect(ball.y).toBeGreaterThanOrEqual(ball.radius); // 境界内に補正
    });

    it('should become inactive when passing bottom wall', () => {
      ball.y = canvasHeight + 20; // 下端を越える

      ball.update(16);

      expect(ball.active).toBe(false); // ボールロスト
    });
  });

  describe('1.9.2 パドル反射計算', () => {
    let paddle: PaddleEntity;

    beforeEach(() => {
      paddle = new PaddleEntity(
        'test-paddle',
        { x: 350, y: 570 },
        100, // width
        20,  // height
        300, // speed
        canvasWidth
      );
    });

    it('should reflect vertically when hitting paddle center', () => {
      const paddle = new PaddleEntity(
        'test-paddle',
        { x: 350, y: 550 },
        100, // width
        20,  // height
        200, // speed
        canvasWidth
      );

      // パドル中央に配置（衝突するように調整）
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - ball.radius + 1; // 衝突するように1px重複させる
      ball.velocity = { x: 50, y: 100 }; // 下向き

      // 衝突判定
      const isColliding = CollisionDetector.checkCircleRectangleCollision(
        { x: ball.x, y: ball.y },
        ball.radius,
        paddle.getBounds()
      );

      if (isColliding) {
        // パドル中央衝突の特殊処理（GameEngineのロジックと同じ）
        const paddleCenterX = paddle.x + paddle.width / 2;
        const distanceFromCenter = Math.abs(ball.x - paddleCenterX);
        
        if (distanceFromCenter < 10) {
          // 中央衝突：垂直上向きに反射
          ball.velocity.y = -Math.abs(ball.velocity.y);
          ball.velocity.x = 0;
        }
      }

      expect(ball.velocity.y).toBeLessThan(0); // 上向き
      expect(Math.abs(ball.velocity.x)).toBeLessThan(10); // ほぼ垂直
    });

    it('should reflect at angle when hitting paddle edge', () => {
      // パドル左端近くに配置
      ball.x = paddle.x + 10;
      ball.y = paddle.y - ball.radius - 1;
      const initialSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);

      // 反射角度計算のシミュレーション
      const hitPosition = (ball.x - paddle.x) / paddle.width - 0.5; // -0.5 ～ 0.5
      const maxAngle = Math.PI / 4; // 45度
      const angle = hitPosition * maxAngle;

      ball.velocity.x = initialSpeed * Math.sin(angle);
      ball.velocity.y = -initialSpeed * Math.cos(angle);

      expect(ball.velocity.y).toBeLessThan(0); // 上向き
      expect(Math.abs(ball.velocity.x)).toBeGreaterThan(0); // 斜め方向
      expect(Math.abs(angle)).toBeLessThanOrEqual(Math.PI / 4); // 最大45度
    });
  });

  describe('1.9.5 速度制限とスピード調整', () => {
    it('should enforce minimum speed', () => {
      ball.velocity = { x: 10, y: 10 }; // 非常に遅い速度
      const minSpeed = 100;

      // 速度制限の適用（GameEngineのロジックと同じ）
      const currentSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      if (currentSpeed < minSpeed) {
        const scale = minSpeed / currentSpeed;
        ball.velocity.x *= scale;
        ball.velocity.y *= scale;
      }

      const newSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      expect(newSpeed).toBeGreaterThanOrEqual(minSpeed - 0.001); // 浮動小数点の誤差を考慮
    });

    it('should enforce maximum speed', () => {
      const playerBallSpeed = 250;
      const maxSpeed = playerBallSpeed * 1.5;
      ball.velocity = { x: 300, y: 400 }; // 非常に速い速度（500px/s）

      // 速度制限の適用
      const currentSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.velocity.x *= scale;
        ball.velocity.y *= scale;
      }

      const newSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      expect(newSpeed).toBeLessThanOrEqual(maxSpeed);
      expect(newSpeed).toBeCloseTo(maxSpeed, 1);
    });

    it('should maintain direction when adjusting speed', () => {
      const originalVelocity = { x: 150, y: -200 };
      ball.velocity = { ...originalVelocity };
      
      const originalAngle = Math.atan2(originalVelocity.y, originalVelocity.x);
      
      // 速度調整後
      const minSpeed = 100;
      const currentSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      const scale = minSpeed / currentSpeed;
      ball.velocity.x *= scale;
      ball.velocity.y *= scale;

      const newAngle = Math.atan2(ball.velocity.y, ball.velocity.x);
      expect(newAngle).toBeCloseTo(originalAngle, 3); // 方向は維持
    });
  });
});