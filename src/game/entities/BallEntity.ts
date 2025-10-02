import { Ball, Position, Rectangle, Velocity } from '../../types';
import { MathUtils } from '../engine/physics';

export class BallEntity implements Ball {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public active = true;
  public velocity: Velocity;
  public damage: number;
  public radius: number;
  public isDestroyed: boolean = false;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(
    id: string,
    position: Position,
    radius: number,
    velocity: Velocity,
    damage: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.id = id;
    this.x = position.x;
    this.y = position.y;
    this.radius = radius;
    this.width = radius * 2;
    this.height = radius * 2;
    this.velocity = { ...velocity };
    this.damage = damage;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  public setVelocity(velocity: Velocity): void {
    this.velocity = { ...velocity };
  }

  public bounce(normal: Position): void {
    // 反射ベクトルの計算: v' = v - 2(v・n)n
    const dot = this.velocity.x * normal.x + this.velocity.y * normal.y;
    this.velocity.x -= 2 * dot * normal.x;
    this.velocity.y -= 2 * dot * normal.y;
  }

  public resetPosition(position: Position): void {
    this.x = position.x;
    this.y = position.y;
    this.velocity = { x: 0, y: 0 };
  }

  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // 速度制限の適用（テスト要件対応）
    this.enforceSpeedLimits();
    
    // 位置を更新
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    // 壁との衝突判定（左右の壁）
    if (this.x <= this.radius || this.x >= this.canvasWidth - this.radius) {
      this.velocity.x = -this.velocity.x;
      this.x = MathUtils.clamp(this.x, this.radius, this.canvasWidth - this.radius);
    }

    // 上の壁との衝突判定
    if (this.y <= this.radius) {
      this.velocity.y = -this.velocity.y;
      this.y = this.radius;
    }

    // 下の壁を越えた場合（ボールロスト）
    if (this.y > this.canvasHeight + this.radius) {
      this.active = false;
    }
  }

  private enforceSpeedLimits(): void {
    const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const minSpeed = 100;
    const maxSpeed = 375; // 250 * 1.5
    
    if (currentSpeed < minSpeed && currentSpeed > 0) {
      // 最小速度の適用
      const scale = minSpeed / currentSpeed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    } else if (currentSpeed > maxSpeed) {
      // 最大速度の適用
      const scale = maxSpeed / currentSpeed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e'; // セカンダリグリーン
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  public getBounds(): Rectangle {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  public getCenterPosition(): Position {
    return { x: this.x, y: this.y };
  }

  public setDamage(damage: number): void {
    this.damage = damage;
  }

  public setRadius(radius: number): void {
    this.radius = radius;
    this.width = radius * 2;
    this.height = radius * 2;
  }
}