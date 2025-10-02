// ゲーム状態の定義
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelUp' | 'skillSelection';

// 座標を表す型
export interface Position {
  x: number;
  y: number;
}

// 速度を表す型
export interface Velocity {
  x: number;
  y: number;
}

// サイズを表す型
export interface Size {
  width: number;
  height: number;
}

// 矩形を表す型
export interface Rectangle extends Position, Size {}

// ゲームオブジェクトの基底インターフェース
export interface GameObject extends Position, Size {
  id: string;
  active: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  getBounds(): Rectangle;
}