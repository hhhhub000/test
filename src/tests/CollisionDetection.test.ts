import { describe, it, expect } from 'vitest';
import { CollisionDetector, MathUtils } from '../game/engine/physics';

describe('Collision Detection System', () => {
  describe('1.4 衝突判定システム', () => {
    describe('Rectangle vs Rectangle Collision', () => {
      it('should detect overlapping rectangles', () => {
        const rect1 = { x: 0, y: 0, width: 50, height: 50 };
        const rect2 = { x: 25, y: 25, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
        expect(collision).toBe(true);
      });

      it('should not detect separated rectangles', () => {
        const rect1 = { x: 0, y: 0, width: 50, height: 50 };
        const rect2 = { x: 100, y: 100, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
        expect(collision).toBe(false);
      });

      it('should not detect edge-touching rectangles', () => {
        const rect1 = { x: 0, y: 0, width: 50, height: 50 };
        const rect2 = { x: 50, y: 0, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
        expect(collision).toBe(false);
      });
    });

    describe('Circle vs Rectangle Collision (Ball vs Block/Paddle)', () => {
      it('should detect ball overlapping with block center', () => {
        const ballPos = { x: 50, y: 50 };
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkCircleRectangleCollision(
          ballPos, ballRadius, block
        );
        expect(collision).toBe(true);
      });

      it('should detect ball hitting block corner', () => {
        const ballPos = { x: 20, y: 20 }; // 左上角近く
        const ballRadius = 15;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkCircleRectangleCollision(
          ballPos, ballRadius, block
        );
        expect(collision).toBe(true);
      });

      it('should not detect ball far from block', () => {
        const ballPos = { x: 200, y: 200 };
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkCircleRectangleCollision(
          ballPos, ballRadius, block
        );
        expect(collision).toBe(false);
      });

      it('should detect ball touching block edge exactly', () => {
        const ballPos = { x: 50, y: 15 }; // ブロック上端にちょうど接触
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const collision = CollisionDetector.checkCircleRectangleCollision(
          ballPos, ballRadius, block
        );
        expect(collision).toBe(true);
      });
    });

    describe('1.9.3 ブロック反射計算 - Collision Normal Calculation', () => {
      it('should return correct normal for top collision', () => {
        const ballPos = { x: 50, y: 15 }; // ブロック上方
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
        expect(normal.x).toBe(0);
        expect(normal.y).toBe(-1); // 上向き法線
      });

      it('should return correct normal for bottom collision', () => {
        const ballPos = { x: 50, y: 85 }; // ブロック下方
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
        expect(normal.x).toBe(0);
        expect(normal.y).toBe(1); // 下向き法線
      });

      it('should return correct normal for left collision', () => {
        const ballPos = { x: 15, y: 50 }; // ブロック左方
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
        expect(normal.x).toBe(-1); // 左向き法線
        expect(normal.y).toBe(0);
      });

      it('should return correct normal for right collision', () => {
        const ballPos = { x: 85, y: 50 }; // ブロック右方
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
        expect(normal.x).toBe(1); // 右向き法線
        expect(normal.y).toBe(0);
      });

      it('should prioritize horizontal collision for corner hits', () => {
        const ballPos = { x: 20, y: 20 }; // 左上角
        const ballRadius = 5;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
        
        // 角の場合、より大きな距離差の方向を優先
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;
        const dx = Math.abs(ballPos.x - centerX);
        const dy = Math.abs(ballPos.y - centerY);
        
        if (dx > dy) {
          expect(normal.y).toBe(0); // 水平方向
        } else {
          expect(normal.x).toBe(0); // 垂直方向
        }
      });
    });

    describe('Collision Response - Position Correction', () => {
      it('should correct ball position to prevent overlap', () => {
        const ballPos = { x: 50, y: 50 }; // ブロック内部
        const ballRadius = 10;
        const block = { x: 25, y: 25, width: 50, height: 50 };
        
        // 衝突検出
        const isColliding = CollisionDetector.checkCircleRectangleCollision(
          ballPos, ballRadius, block
        );
        
        if (isColliding) {
          const normal = CollisionDetector.getCollisionNormal(ballPos, ballRadius, block);
          
          // 位置補正の計算
          const correctedPos = {
            x: ballPos.x,
            y: ballPos.y
          };
          
          // 法線方向に半径分だけ押し出し
          if (normal.x !== 0) {
            correctedPos.x = normal.x > 0 ? block.x + block.width + ballRadius : block.x - ballRadius;
          }
          if (normal.y !== 0) {
            correctedPos.y = normal.y > 0 ? block.y + block.height + ballRadius : block.y - ballRadius;
          }
          
          // 補正後は衝突しない
          const stillColliding = CollisionDetector.checkCircleRectangleCollision(
            correctedPos, ballRadius, block
          );
          expect(stillColliding).toBe(false);
        }
      });
    });
  });

  describe('Math Utilities', () => {
    describe('MathUtils.clamp', () => {
      it('should clamp value within range', () => {
        expect(MathUtils.clamp(5, 0, 10)).toBe(5);
        expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
        expect(MathUtils.clamp(15, 0, 10)).toBe(10);
      });
    });

    describe('MathUtils.distance', () => {
      it('should calculate correct distance between points', () => {
        const pos1 = { x: 0, y: 0 };
        const pos2 = { x: 3, y: 4 };
        
        const distance = MathUtils.distance(pos1, pos2);
        expect(distance).toBe(5); // 3-4-5 直角三角形
      });
    });

    describe('MathUtils.normalize', () => {
      it('should normalize vector to unit length', () => {
        const vector = { x: 3, y: 4 };
        const normalized = MathUtils.normalize(vector);
        
        expect(normalized.x).toBeCloseTo(0.6, 3);
        expect(normalized.y).toBeCloseTo(0.8, 3);
        
        const length = Math.sqrt(normalized.x ** 2 + normalized.y ** 2);
        expect(length).toBeCloseTo(1, 5);
      });

      it('should handle zero vector', () => {
        const vector = { x: 0, y: 0 };
        const normalized = MathUtils.normalize(vector);
        
        expect(normalized.x).toBe(0);
        expect(normalized.y).toBe(0);
      });
    });

    describe('MathUtils.lerp', () => {
      it('should interpolate between values correctly', () => {
        expect(MathUtils.lerp(0, 10, 0)).toBe(0);
        expect(MathUtils.lerp(0, 10, 1)).toBe(10);
        expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
        expect(MathUtils.lerp(10, 20, 0.3)).toBe(13);
      });
    });
  });
});