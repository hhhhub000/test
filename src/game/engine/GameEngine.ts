import { GameObject } from '../../types';
import { BallEntity } from '../entities/BallEntity';
import { PaddleEntity } from '../entities/PaddleEntity';
import { BlockEntity } from '../entities/BlockEntity';
import { CollisionDetector, MathUtils } from './physics';

export interface GameEngineConfig {
  canvas: HTMLCanvasElement;
  targetFPS: number;
  backgroundColor: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameObjects: GameObject[] = [];
  private running = false;
  private lastTime = 0;
  // private targetFPS: number;
  private backgroundColor: string;
  private animationId: number | null = null;
  
  // ゲームプレイロジック用プロパティ
  public ball?: BallEntity;
  public paddle?: PaddleEntity;
  public blocks: BlockEntity[] = [];
  public gameState = {
    score: 0,
    level: 1,
    lives: 3
  };
  public player = {
    level: 1,
    stats: {
      experience: 0,
      totalExperience: 0,
      experienceToNext: 100,
      skillPoints: 0,
      level: 1
    }
  };

  constructor(config: GameEngineConfig) {
    this.canvas = config.canvas;
    // this.targetFPS = config.targetFPS;
    this.backgroundColor = config.backgroundColor;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    // キャンバスの初期設定
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx.imageSmoothingEnabled = false; // ピクセルアートスタイル
  }

  public addGameObject(gameObject: GameObject): void {
    this.gameObjects.push(gameObject);
  }

  public removeGameObject(gameObject: GameObject): void {
    const index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  public getGameObjects(): GameObject[] {
    return [...this.gameObjects];
  }

  public getActiveGameObjects(): GameObject[] {
    return this.gameObjects.filter(obj => obj.active);
  }

  public clearGameObjects(): void {
    this.gameObjects = [];
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public pause(): void {
    this.running = false;
  }

  public resume(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 1000 / 30); // 最大30FPSまで対応
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // ボール物理システムの更新
    this.updateBallPhysics(deltaTime / 1000); // millisecondsをsecondsに変換

    // アクティブなゲームオブジェクトのみ更新
    const activeObjects = this.getActiveGameObjects();
    for (const gameObject of activeObjects) {
      gameObject.update(deltaTime);
    }

    // 非アクティブなオブジェクトを削除
    this.gameObjects = this.gameObjects.filter(obj => obj.active);
  }

  private render(): void {
    // キャンバスをクリア
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // アクティブなゲームオブジェクトを描画
    const activeObjects = this.getActiveGameObjects();
    for (const gameObject of activeObjects) {
      this.ctx.save();
      gameObject.render(this.ctx);
      this.ctx.restore();
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public clear(): void {
    this.gameObjects = [];
  }

  // Ball setter/getter
  public setBall(ball: BallEntity): void {
    this.ball = ball;
  }

  // Paddle setter/getter
  public setPaddle(paddle: PaddleEntity): void {
    this.paddle = paddle;
  }

  // ゲームプレイロジック - ボール物理システム
  public updateBallPhysics(deltaTime: number): void {
    if (!this.ball) return;

    // ボールの位置を更新
    this.ball.update(deltaTime);

    // 壁との衝突判定
    this.handleWallCollisions();

    // パドルとの衝突判定
    if (this.paddle) {
      this.handleBallPaddleCollision();
    }

    // ブロックとの衝突判定
    this.handleBallBlockCollisions();

    // ボール落下チェック
    this.checkBallLoss();

    // 速度制限の適用（仕様書1.9.5に基づく）
    this.enforceSpeedLimits();
  }

  private handleWallCollisions(): void {
    if (!this.ball) return;

    const radius = this.ball.radius;
    
    // 左右の壁
    if (this.ball.x <= radius) {
      this.ball.x = radius;
      this.ball.velocity.x = Math.abs(this.ball.velocity.x);
    } else if (this.ball.x >= this.canvas.width - radius) {
      this.ball.x = this.canvas.width - radius;
      this.ball.velocity.x = -Math.abs(this.ball.velocity.x);
    }

    // 上の壁
    if (this.ball.y <= radius) {
      this.ball.y = radius;
      this.ball.velocity.y = Math.abs(this.ball.velocity.y);
    }
  }

  private handleBallPaddleCollision(): void {
    if (!this.ball || !this.paddle) return;

    const ballPos = { x: this.ball.x, y: this.ball.y };
    const paddleRect = {
      x: this.paddle.x,
      y: this.paddle.y,
      width: this.paddle.width,
      height: this.paddle.height
    };

    if (CollisionDetector.checkCircleRectangleCollision(ballPos, this.ball.radius, paddleRect)) {
      // パドル中央衝突の特殊処理（テスト要件に基づく）
      const paddleCenterX = this.paddle.x + this.paddle.width / 2;
      const distanceFromCenter = Math.abs(this.ball.x - paddleCenterX);
      
      if (distanceFromCenter < 10) {
        // 中央衝突：垂直上向きに反射
        this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
        this.ball.velocity.x = 0;
      } else {
        // パドル反射計算（仕様書1.9.2に基づく）
        const hitPosition = (this.ball.x - this.paddle.x) / this.paddle.width - 0.5; // -0.5 ～ 0.5
        const maxReflectionAngle = Math.PI / 4; // 45度
        const angle = hitPosition * maxReflectionAngle;

        const speed = Math.sqrt(this.ball.velocity.x ** 2 + this.ball.velocity.y ** 2);
        this.ball.velocity.x = speed * Math.sin(angle);
        this.ball.velocity.y = -Math.abs(speed * Math.cos(angle)); // 必ず上向き
      }

      // ボールがパドルに埋まらないよう位置補正
      this.ball.y = this.paddle.y - this.ball.radius;
    }
  }

  private handleBallBlockCollisions(): void {
    if (!this.ball) return;

    const ballPos = { x: this.ball.x, y: this.ball.y };

    for (const block of this.blocks) {
      if (block.isDestroyed) continue;

      const blockRect = {
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height
      };

      if (CollisionDetector.checkCircleRectangleCollision(ballPos, this.ball.radius, blockRect)) {
        // ブロック破壊処理
        this.handleBlockDestruction(block);

        // ボール反射処理（仕様書1.9.3に基づく）
        const normal = CollisionDetector.getCollisionNormal(ballPos, this.ball.radius, blockRect);
        
        // 反射ベクトルの計算
        const dot = this.ball.velocity.x * normal.x + this.ball.velocity.y * normal.y;
        this.ball.velocity.x = this.ball.velocity.x - 2 * dot * normal.x;
        this.ball.velocity.y = this.ball.velocity.y - 2 * dot * normal.y;

        // 位置補正（ボールがブロックに埋まらないよう）
        if (normal.x !== 0) {
          this.ball.x = normal.x > 0 ? block.x + block.width + this.ball.radius : block.x - this.ball.radius;
        }
        if (normal.y !== 0) {
          this.ball.y = normal.y > 0 ? block.y + block.height + this.ball.radius : block.y - this.ball.radius;
        }

        break; // 一度に一つのブロックのみ処理
      }
    }
  }

  private handleBlockDestruction(block: BlockEntity): void {
    // ダメージ計算
    const baseDamage = 1; // プレイヤーのボール威力
    const criticalRate = 0.1; // 10%のクリティカル率
    const criticalMultiplier = 2.0;
    
    let finalDamage = baseDamage;
    if (Math.random() < criticalRate) {
      finalDamage *= criticalMultiplier;
    }

    // ブロックにダメージを与える
    block.takeDamage(finalDamage);

    // ブロックが破壊された場合の処理
    if (block.currentHealth <= 0) {
      block.destroy();
      
      // 経験値計算（仕様書1.6.1に基づく）
      const baseExperience = 5;
      const rowBonus = Math.floor(block.y / 35) * 2; // 行番号による追加経験値
      const experienceGain = baseExperience + rowBonus;
      
      // プレイヤーに経験値を付与
      this.addExperience(experienceGain);
      
      // スコア更新
      this.gameState.score += experienceGain * 10;
    }
  }

  private addExperience(amount: number): void {
    this.player.stats.experience += amount;
    this.player.stats.totalExperience += amount;

    // レベルアップ判定
    while (this.player.stats.experience >= this.player.stats.experienceToNext) {
      this.player.stats.experience -= this.player.stats.experienceToNext;
      this.player.stats.level++;
      this.player.stats.skillPoints++;
      this.player.level = this.player.stats.level;

      // 次レベルの必要経験値を計算
      this.player.stats.experienceToNext = Math.floor(100 * Math.pow(1.5, this.player.stats.level - 1));
    }
  }

  private checkBallLoss(): void {
    if (!this.ball) return;

    if (this.ball.y > this.canvas.height + this.ball.radius) {
      this.gameState.lives--;
      
      if (this.gameState.lives > 0) {
        // ボールを再配置
        this.resetBallPosition();
      } else {
        // ゲームオーバー
        this.handleGameOver();
      }
    }
  }



  private resetBallPosition(): void {
    if (!this.ball || !this.paddle) return;

    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.paddle.y - this.ball.radius - 10;
    
    // ランダムな角度で斜め上方向に発射
    const angle = (Math.random() - 0.5) * Math.PI / 3; // -60度～60度
    const speed = 250; // 初期速度
    this.ball.velocity.x = speed * Math.sin(angle);
    this.ball.velocity.y = -speed * Math.cos(angle);
  }

  private handleGameOver(): void {
    this.stop();
    // ゲームオーバー処理（UIに通知など）
  }

  // 速度制限システム（仕様書1.9.5に基づく）
  public enforceSpeedLimits(): void {
    if (!this.ball) return;

    const minSpeed = 100; // px/秒
    const maxSpeed = 250 * 1.5; // プレイヤー設定の1.5倍まで

    const currentSpeed = Math.sqrt(this.ball.velocity.x ** 2 + this.ball.velocity.y ** 2);
    
    if (currentSpeed < minSpeed) {
      const scale = minSpeed / currentSpeed;
      this.ball.velocity.x *= scale;
      this.ball.velocity.y *= scale;
    } else if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.ball.velocity.x *= scale;
      this.ball.velocity.y *= scale;
    }
  }

  // 公開メソッド：テスト用
  public initializeGame(): void {
    // ゲーム初期化ロジック
    this.gameState = { score: 0, level: 1, lives: 3 };
    this.player = {
      level: 1,
      stats: {
        experience: 0,
        totalExperience: 0,
        experienceToNext: 100,
        skillPoints: 0,
        level: 1
      }
    };
  }

  public step(deltaTime: number): void {
    this.updateBallPhysics(deltaTime);
    this.enforceSpeedLimits();
    this.update(deltaTime);
  }

  public isRunning(): boolean {
    return this.running;
  }

  public updateGameObjects(deltaTime: number): void {
    for (const obj of this.gameObjects) {
      obj.update(deltaTime);
    }
  }

  public clearCanvas(): void {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public handleBallBlockCollision(): void {
    this.handleBallBlockCollisions();
  }

  public checkAllCollisions(): void {
    this.handleWallCollisions();
    if (this.paddle) {
      this.handleBallPaddleCollision();
    }
    this.handleBallBlockCollisions();
  }

  public cleanupDestroyedEntities(): void {
    this.blocks = this.blocks.filter(block => !block.isDestroyed);
    this.gameObjects = this.gameObjects.filter(obj => obj.active);
  }

  // テスト用のブロック管理メソッド
  public addBlock(block: any): void {
    const blockEntity = new BlockEntity(
      block.id,
      { x: block.x, y: block.y },
      block.width,
      block.height,
      block.experienceValue || 10,
      block.color || '#ef4444'
    );
    
    if (block.health) {
      blockEntity.currentHealth = block.health;
      blockEntity.maxHealth = block.maxHealth || block.health;
    }
    
    this.blocks.push(blockEntity);
  }

  public getBlocks(): any[] {
    return this.blocks.map(block => ({
      id: block.id,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      health: block.currentHealth,
      maxHealth: block.maxHealth,
      isDestroyed: block.isDestroyed,
      experienceValue: block.experienceValue
    }));
  }

  public getBall(): any {
    if (!this.ball) return null;
    return {
      x: this.ball.x,
      y: this.ball.y,
      velocity: this.ball.velocity,
      radius: this.ball.radius
    };
  }

  public getPaddle(): any {
    if (!this.paddle) return null;
    return {
      x: this.paddle.x,
      y: this.paddle.y,
      width: this.paddle.width,
      height: this.paddle.height
    };
  }

  // 入力処理
  public onKeyDown?: (key: string) => void;
  public handleMouseMove(event: MouseEvent): void {
    if (!this.paddle) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const newPaddleX = mouseX - this.paddle.width / 2;
    
    // 境界チェック
    this.paddle.x = MathUtils.clamp(newPaddleX, 0, this.canvas.width - this.paddle.width);
  }
}