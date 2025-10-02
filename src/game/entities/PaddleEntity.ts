import { Paddle, Position, Rectangle, Velocity } from '../../types';
import { MathUtils } from '../engine/physics';

export class PaddleEntity implements Paddle {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public active = true;
  public speed: number;
  public isDestroyed: boolean = false;
  private velocity: Velocity = { x: 0, y: 0 };
  private canvasWidth: number;

  constructor(
    id: string,
    position: Position,
    width: number,
    height: number,
    speed: number,
    canvasWidth: number
  ) {
    this.id = id;
    this.x = position.x;
    this.y = position.y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.canvasWidth = canvasWidth;
  }

  public moveLeft(): void {
    this.velocity.x = -this.speed;
  }

  public moveRight(): void {
    this.velocity.x = this.speed;
  }

  public stop(): void {
    this.velocity.x = 0;
  }

  public update(deltaTime: number): void {
    // 位置を更新
    this.x += this.velocity.x * (deltaTime / 1000);

    // 画面境界チェック
    this.x = MathUtils.clamp(this.x, 0, this.canvasWidth - this.width);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#3b82f6'; // プライマリブルー
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // パドルの縁を描画
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  public getBounds(): Rectangle {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }
}