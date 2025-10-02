import { MonsterBlock, MonsterType, Position, Reward } from '../../types';
import { BlockEntity } from './BlockEntity';

export class MonsterBlockEntity extends BlockEntity implements MonsterBlock {
  public type: 'monster' = 'monster';
  public maxHealth: number;
  public currentHealth: number;
  public monsterType: MonsterType;
  public dropRewards: Reward[];

  constructor(
    id: string,
    position: Position,
    width: number,
    height: number,
    monsterType: MonsterType,
    dropRewards: Reward[] = []
  ) {
    super(id, position, width, height, monsterType.experienceValue, monsterType.color);
    this.monsterType = monsterType;
    this.maxHealth = monsterType.maxHealth;
    this.currentHealth = monsterType.maxHealth;
    this.dropRewards = dropRewards;
  }

  public takeDamage(damage: number): boolean {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    if (this.currentHealth <= 0) {
      this.destroy();
      return true; // 破壊された
    }
    
    return false; // まだ生きている
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.destroyed) return;

    // メインのブロック描画
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // ダメージ表現（色を暗くする）
    const damageRatio = 1 - (this.currentHealth / this.maxHealth);
    ctx.fillStyle = `rgba(0, 0, 0, ${damageRatio * 0.5})`;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // HP バーの描画
    const barHeight = 4;
    const barY = this.y - barHeight - 2;
    const healthRatio = this.currentHealth / this.maxHealth;

    // 背景
    ctx.fillStyle = '#666666';
    ctx.fillRect(this.x, barY, this.width, barHeight);

    // HP バー
    ctx.fillStyle = healthRatio > 0.5 ? '#22c55e' : healthRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(this.x, barY, this.width * healthRatio, barHeight);

    // ブロックの縁を描画
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // モンスター名を表示
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.monsterType.name,
      this.x + this.width / 2,
      this.y + this.height / 2 + 4
    );
  }

  public getHealthRatio(): number {
    return this.currentHealth / this.maxHealth;
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
  }
}