import { Position, Rectangle } from '../../types';

// 衝突判定ユーティリティ
export class CollisionDetector {
  // 矩形同士の衝突判定
  static checkRectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // 円と矩形の衝突判定
  static checkCircleRectangleCollision(
    circlePos: Position,
    radius: number,
    rect: Rectangle
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(circlePos.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circlePos.y, rect.y + rect.height));

    const distanceX = circlePos.x - closestX;
    const distanceY = circlePos.y - closestY;

    return (distanceX * distanceX + distanceY * distanceY) <= (radius * radius);
  }

  // 衝突面の法線ベクトルを計算（ボールの反射用）
  static getCollisionNormal(
    circlePos: Position,
    _radius: number,
    rect: Rectangle
  ): Position {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    const dx = circlePos.x - centerX;
    const dy = circlePos.y - centerY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // 矩形のどの面に衝突したかを判定
    if (absDx > absDy) {
      // 左右の面
      return { x: dx > 0 ? 1 : -1, y: 0 };
    } else {
      // 上下の面
      return { x: 0, y: dy > 0 ? 1 : -1 };
    }
  }
}

// 数学関数ユーティリティ
export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static distance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static normalize(vector: Position): Position {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
  }

  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }
}