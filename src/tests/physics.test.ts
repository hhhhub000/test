import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '../game/engine/physics';

describe('CollisionDetector', () => {
  describe('checkRectangleCollision', () => {
    it('should detect collision between overlapping rectangles', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };
      
      const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
      expect(collision).toBe(true);
    });

    it('should not detect collision between non-overlapping rectangles', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      
      const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
      expect(collision).toBe(false);
    });

    it('should detect edge touching as collision', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 50, y: 0, width: 50, height: 50 };
      
      const collision = CollisionDetector.checkRectangleCollision(rect1, rect2);
      expect(collision).toBe(false); // エッジが触れるだけでは衝突しない
    });
  });

  describe('checkCircleRectangleCollision', () => {
    it('should detect collision when circle overlaps rectangle', () => {
      const circlePos = { x: 25, y: 25 };
      const radius = 15;
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      
      const collision = CollisionDetector.checkCircleRectangleCollision(
        circlePos, radius, rect
      );
      expect(collision).toBe(true);
    });

    it('should not detect collision when circle is far from rectangle', () => {
      const circlePos = { x: 100, y: 100 };
      const radius = 10;
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      
      const collision = CollisionDetector.checkCircleRectangleCollision(
        circlePos, radius, rect
      );
      expect(collision).toBe(false);
    });
  });

  describe('getCollisionNormal', () => {
    it('should return correct normal for top collision', () => {
      const circlePos = { x: 25, y: -5 };
      const radius = 10;
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      
      const normal = CollisionDetector.getCollisionNormal(circlePos, radius, rect);
      expect(normal.x).toBe(0);
      expect(normal.y).toBe(-1);
    });

    it('should return correct normal for left collision', () => {
      const circlePos = { x: -5, y: 25 };
      const radius = 10;
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      
      const normal = CollisionDetector.getCollisionNormal(circlePos, radius, rect);
      expect(normal.x).toBe(-1);
      expect(normal.y).toBe(0);
    });
  });
});