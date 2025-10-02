import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../../game/engine';
import { PaddleEntity, BallEntity, BlockEntity, MonsterBlockEntity } from '../../game/entities';
import { CollisionDetector } from '../../game/engine/physics';
import { MonsterSystem } from '../../game/systems';
import { useGameStore } from '../../stores';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const paddleRef = useRef<PaddleEntity | null>(null);
  const ballRef = useRef<BallEntity | null>(null);
  const { gameState, player, addExperience, setGameState } = useGameStore();

  // キーボード入力の処理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!paddleRef.current) return;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        paddleRef.current.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        paddleRef.current.moveRight();
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!paddleRef.current) return;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'a':
      case 'A':
      case 'd':
      case 'D':
        paddleRef.current.stop();
        break;
    }
  }, []);

  // ゲームの初期化
  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    gameEngineRef.current = new GameEngine({
      canvas,
      targetFPS: 60,
      backgroundColor: '#0f172a',
    });

    // パドルの作成
    paddleRef.current = new PaddleEntity(
      'paddle',
      { x: width / 2 - player.attributes.paddleSize / 2, y: height - 50 },
      player.attributes.paddleSize,
      20,
      player.attributes.paddleSpeed,
      width
    );

    // ボールの作成
    ballRef.current = new BallEntity(
      'ball',
      { x: width / 2, y: height / 2 },
      10,
      { x: player.attributes.ballSpeed * 0.6, y: -player.attributes.ballSpeed },
      player.attributes.ballDamage,
      width,
      height
    );

    // ブロックの生成
    createBlocks();

    // ゲームオブジェクトをエンジンに追加
    gameEngineRef.current.addGameObject(paddleRef.current);
    gameEngineRef.current.addGameObject(ballRef.current);

    // 衝突判定とゲームロジックの更新を設定
    setupGameLogic();

  }, [width, height, player.attributes]);

  // ブロックの生成
  const createBlocks = useCallback(() => {
    if (!gameEngineRef.current) return;

    const blockWidth = 75;
    const blockHeight = 25;
    const rows = 6;
    const cols = 10;
    const padding = 5;
    const offsetX = (width - (cols * (blockWidth + padding) - padding)) / 2;
    const offsetY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (blockWidth + padding);
        const y = offsetY + row * (blockHeight + padding);
        
        // モンスターブロックの出現判定
        if (Math.random() < MonsterSystem.getMonsterSpawnRate(player.stats.level)) {
          const monsterType = MonsterSystem.selectMonsterType(player.stats.level);
          const monsterBlock = new MonsterBlockEntity(
            `monster-${row}-${col}`,
            { x, y },
            blockWidth,
            blockHeight,
            monsterType
          );
          gameEngineRef.current.addGameObject(monsterBlock);
        } else {
          const block = new BlockEntity(
            `block-${row}-${col}`,
            { x, y },
            blockWidth,
            blockHeight,
            5 + row * 2, // 上の方ほど高い経験値
            `hsl(${row * 30}, 70%, 50%)`
          );
          gameEngineRef.current.addGameObject(block);
        }
      }
    }
  }, [width, player.stats.level]);

  // ゲームロジックの設定
  const setupGameLogic = useCallback(() => {
    if (!gameEngineRef.current || !ballRef.current || !paddleRef.current) return;

    const originalUpdate = gameEngineRef.current.update;
    gameEngineRef.current.update = function(deltaTime: number) {
      originalUpdate.call(this, deltaTime);

      if (!ballRef.current || !paddleRef.current) return;

      const ball = ballRef.current;
      const paddle = paddleRef.current;
      const blocks = this.getActiveGameObjects().filter(obj => 
        obj.id.startsWith('block-') || obj.id.startsWith('monster-')
      );

      // パドルとボールの衝突判定
      if (CollisionDetector.checkCircleRectangleCollision(
        ball.getCenterPosition(),
        ball.radius,
        paddle.getBounds()
      )) {
        const normal = CollisionDetector.getCollisionNormal(
          ball.getCenterPosition(),
          ball.radius,
          paddle.getBounds()
        );
        ball.bounce(normal);
      }

      // ブロックとボールの衝突判定
      for (const block of blocks) {
        if (CollisionDetector.checkCircleRectangleCollision(
          ball.getCenterPosition(),
          ball.radius,
          block.getBounds()
        )) {
          const normal = CollisionDetector.getCollisionNormal(
            ball.getCenterPosition(),
            ball.radius,
            block.getBounds()
          );
          ball.bounce(normal);
          
          const isDestroyed = (block as BlockEntity).takeDamage(ball.damage);
          if (isDestroyed) {
            addExperience((block as BlockEntity).experienceValue);
          }
        }
      }

      // ボールがロストした場合
      if (!ball.active) {
        setGameState('gameOver');
      }

      // 全ブロック破壊でレベルクリア
      const remainingBlocks = blocks.filter(block => block.active);
      if (remainingBlocks.length === 0) {
        // 新しいレベルを生成
        createBlocks();
      }
    };
  }, [addExperience, setGameState, createBlocks]);

  // エフェクトでゲーム初期化とイベントリスナー設定
  useEffect(() => {
    if (gameState === 'playing') {
      initializeGame();
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      if (gameEngineRef.current) {
        gameEngineRef.current.start();
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (gameEngineRef.current) {
          gameEngineRef.current.stop();
        }
      };
    }
  }, [gameState, initializeGame, handleKeyDown, handleKeyUp]);

  return (
    <div className="flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-600 rounded-lg bg-slate-900"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};