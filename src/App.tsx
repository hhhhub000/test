import React from 'react';
import { useGameStore } from './stores';
import { GameCanvas, PlayerStats, Button } from './components';

const App: React.FC = () => {
  const { gameState, player, currentScore, highScore, setGameState, resetGame } = useGameStore();

  const renderMenuScreen = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-white mb-4">
          ブロック崩し<span className="text-primary-400">RPG</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          ブロックを壊して経験値を稼ぎ、レベルアップしてより強くなろう！
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => setGameState('playing')}
            size="large"
            className="w-48"
          >
            ゲーム開始
          </Button>
          
          <div className="text-center">
            <p className="text-gray-400">プレイヤー レベル {player.stats.level}</p>
            <p className="text-gray-400">ハイスコア: {highScore}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayingScreen = () => (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <GameCanvas />
            <div className="flex justify-center mt-4 space-x-4">
              <Button
                onClick={() => setGameState('paused')}
                variant="secondary"
              >
                一時停止
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <PlayerStats />
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-2">現在のスコア</h3>
              <p className="text-2xl font-bold text-primary-400">{currentScore}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-2">操作方法</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>← → or A D: パドル移動</p>
                <p>スペース: スキル発動</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPausedScreen = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-4xl font-bold text-white">ゲーム一時停止</h2>
        
        <div className="space-y-4">
          <Button
            onClick={() => setGameState('playing')}
            size="large"
            className="w-48"
          >
            ゲーム再開
          </Button>
          
          <Button
            onClick={() => {
              resetGame();
              setGameState('menu');
            }}
            variant="secondary"
            size="large"
            className="w-48"
          >
            メニューに戻る
          </Button>
        </div>
      </div>
    </div>
  );

  const renderGameOverScreen = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-4xl font-bold text-danger-400">ゲームオーバー</h2>
        
        <div className="space-y-2">
          <p className="text-xl text-white">スコア: {currentScore}</p>
          {currentScore === highScore && (
            <p className="text-lg text-secondary-400 font-semibold">🎉 新記録達成！</p>
          )}
          <p className="text-gray-400">到達レベル: {player.stats.level}</p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => setGameState('playing')}
            size="large"
            className="w-48"
          >
            リトライ
          </Button>
          
          <Button
            onClick={() => {
              resetGame();
              setGameState('menu');
            }}
            variant="secondary"
            size="large"
            className="w-48"
          >
            メニューに戻る
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLevelUpScreen = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-4xl font-bold text-secondary-400">🎉 レベルアップ！</h2>
        
        <div className="space-y-2">
          <p className="text-2xl text-white">レベル {player.stats.level}</p>
          <p className="text-lg text-gray-300">スキルポイント +1</p>
          <p className="text-sm text-gray-400">能力値が上昇しました</p>
        </div>
        
        <Button
          onClick={() => setGameState('playing')}
          size="large"
          className="w-48"
        >
          ゲーム続行
        </Button>
      </div>
    </div>
  );

  // 画面遷移の制御
  switch (gameState) {
    case 'menu':
      return renderMenuScreen();
    case 'playing':
      return renderPlayingScreen();
    case 'paused':
      return renderPausedScreen();
    case 'gameOver':
      return renderGameOverScreen();
    case 'levelUp':
      return renderLevelUpScreen();
    default:
      return renderMenuScreen();
  }
};

export default App;