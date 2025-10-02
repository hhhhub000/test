import { Block, Position, Rectangle } from '../../types';

export class BlockEntity implements Block {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public active = true;
  public type: 'normal' | 'monster' = 'normal';
  public destroyed = false;
  public experienceValue: number;
  public color: string;
  public currentHealth: number = 1;
  public maxHealth: number = 1;
  public isDestroyed: boolean = false;

  constructor(
    id: string,
    position: Position,
    width: number,
    height: number,
    experienceValue: number,
    color: string = '#ef4444'
  ) {
    this.id = id;
    this.x = position.x;
    this.y = position.y;
    this.width = width;
    this.height = height;
    this.experienceValue = experienceValue;
    this.color = color;
  }

  public takeDamage(damage: number): boolean {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    if (this.currentHealth <= 0) {
      this.destroy();
      return true; // 破壊された
    }
    return false; // まだ破壊されていない
  }

  public destroy(): void {
    this.destroyed = true;
    this.isDestroyed = true;
    this.active = false;
  }

  public update(_deltaTime: number): void {
    // 通常ブロックは特に更新処理なし
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.destroyed) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // ブロックの縁を描画
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
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
}