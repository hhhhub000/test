// ゲーム定数の定義
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  TARGET_FPS: 60,
  
  // プレイヤー初期値
  INITIAL_PADDLE_SIZE: 100,
  INITIAL_PADDLE_SPEED: 300,
  INITIAL_BALL_SPEED: 250,
  INITIAL_BALL_DAMAGE: 10,
  INITIAL_BALL_RADIUS: 10,
  
  // ブロック設定
  BLOCK_WIDTH: 75,
  BLOCK_HEIGHT: 25,
  BLOCK_ROWS: 6,
  BLOCK_COLS: 10,
  BLOCK_PADDING: 5,
  
  // カラーテーマ
  COLORS: {
    BACKGROUND: '#0f172a',
    PADDLE: '#3b82f6',
    BALL: '#22c55e',
    BLOCK: '#ef4444',
  },
} as const;