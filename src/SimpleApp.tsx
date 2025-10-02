import React, { useRef, useEffect, useState } from 'react';
import { SimpleButton, SimpleProgress } from './components/simple';
import { GameEngine } from './game/engine/GameEngine';
import { BallEntity } from './game/entities/BallEntity';
import { PaddleEntity } from './game/entities/PaddleEntity';
import { BlockEntity } from './game/entities/BlockEntity';

// シンプルなゲーム状態管理
interface GameState {
  level: number;
  experience: number;
  experienceToNext: number;
  score: number;
  gameRunning: boolean;
}

const SimpleApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    score: 0,
    gameRunning: false,
  });

  // ゲームエンジンの初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    // GameEngineを初期化
    try {
      const gameEngine = new GameEngine({
        canvas: canvas,
        targetFPS: 60,
        backgroundColor: '#0f172a'
      });

      gameEngineRef.current = gameEngine;

      // ボールを作成
      const ball = new BallEntity(
        'main-ball',
        { x: 400, y: 300 },
        10, // radius
        { x: 150, y: -200 }, // velocity (下向きから上向きに変更)
        10, // damage
        800, // canvasWidth
        600  // canvasHeight
      );

      // パドルを作成
      const paddle = new PaddleEntity(
        'main-paddle',
        { x: 350, y: 550 },
        100, // width
        20,  // height
        300, // speed
        800  // canvasWidth
      );

      // ブロックを作成
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 10; col++) {
          const x = 50 + col * 75;
          const y = 50 + row * 30;
          const block = new BlockEntity(
            `block-${row}-${col}`,
            { x, y },
            70, // width
            25, // height
            1   // health
          );
          gameEngine.blocks.push(block);
        }
      }

      // エンティティをセット
      gameEngine.setBall(ball);
      gameEngine.setPaddle(paddle);

      // ゲームオブジェクトとして追加（描画用）
      gameEngine.addGameObject(ball);
      gameEngine.addGameObject(paddle);
      gameEngine.blocks.forEach(block => gameEngine.addGameObject(block));

      // ゲームを開始
      gameEngine.start();

      // キーボード入力の処理
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!paddle) return;
        switch (event.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            paddle.moveLeft();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            paddle.moveRight();
            break;
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if (!paddle) return;
        switch (event.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
          case 'ArrowRight':
          case 'd':
          case 'D':
            paddle.stop();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        gameEngine.stop();
      };
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      
      // フォールバック: 静的描画
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲームエンジンの初期化に失敗しました', 400, 300);
      }
    }
  }, []);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameRunning: true }));
    
    // ゲームエンジンを開始
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  const addExperience = () => {
    setGameState(prev => {
      const newExp = prev.experience + 25;
      if (newExp >= prev.experienceToNext) {
        return {
          ...prev,
          level: prev.level + 1,
          experience: newExp - prev.experienceToNext,
          experienceToNext: Math.floor(100 * Math.pow(1.5, prev.level)),
          score: prev.score + 100,
        };
      }
      return {
        ...prev,
        experience: newExp,
        score: prev.score + 25,
      };
    });
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-slate-900 p-4' },
    React.createElement(
      'div',
      { className: 'max-w-6xl mx-auto' },
      React.createElement(
        'h1',
        { className: 'text-4xl font-bold text-white text-center mb-6' },
        'ブロック崩しRPG - プロトタイプ'
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 lg:grid-cols-4 gap-6' },
        React.createElement(
          'div',
          { className: 'lg:col-span-3' },
          React.createElement(
            'div',
            { className: 'flex justify-center' },
            React.createElement('canvas', {
              ref: canvasRef,
              className: 'border-2 border-gray-600 rounded-lg bg-slate-900',
              style: { imageRendering: 'pixelated' as const }
            })
          ),
          React.createElement(
            'div',
            { className: 'flex justify-center mt-4 space-x-4' },
            React.createElement(SimpleButton, {
              onClick: startGame,
              children: gameState.gameRunning ? 'ゲーム実行中' : 'ゲーム開始'
            }),
            React.createElement(SimpleButton, {
              onClick: addExperience,
              children: 'EXP獲得テスト',
              className: 'bg-green-600 hover:bg-green-700'
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-4' },
          React.createElement(
            'div',
            { className: 'bg-slate-800 p-4 rounded-lg border border-slate-600' },
            React.createElement(
              'h3',
              { className: 'text-lg font-bold text-white mb-3' },
              'プレイヤー情報'
            ),
            React.createElement(
              'div',
              { className: 'space-y-2' },
              React.createElement(
                'div',
                null,
                React.createElement(
                  'span',
                  { className: 'text-gray-300' },
                  'レベル: '
                ),
                React.createElement(
                  'span',
                  { className: 'text-xl font-bold text-blue-400' },
                  gameState.level.toString()
                )
              ),
              React.createElement(SimpleProgress, {
                current: gameState.experience,
                max: gameState.experienceToNext,
                label: '経験値'
              }),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'span',
                  { className: 'text-gray-300' },
                  'スコア: '
                ),
                React.createElement(
                  'span',
                  { className: 'text-lg font-semibold text-green-400' },
                  gameState.score.toString()
                )
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-slate-800 p-4 rounded-lg border border-slate-600' },
            React.createElement(
              'h3',
              { className: 'text-lg font-bold text-white mb-2' },
              '実装状況'
            ),
            React.createElement(
              'div',
              { className: 'text-sm text-gray-300 space-y-1' },
              React.createElement('div', null, '✅ 基本UI'),
              React.createElement('div', null, '✅ レベルシステム'),
              React.createElement('div', null, '✅ 経験値システム'),
              React.createElement('div', null, '🚧 ゲームロジック'),
              React.createElement('div', null, '🚧 スキルシステム'),
              React.createElement('div', null, '🚧 モンスターブロック')
            )
          )
        )
      )
    )
  );
};

export default SimpleApp;