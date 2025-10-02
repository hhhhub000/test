import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player } from '../types';
import { ExperienceSystem } from '../game/systems';

interface GameStore {
  // ゲーム状態
  gameState: GameState;
  player: Player;
  currentScore: number;
  highScore: number;
  
  // アクション
  setGameState: (state: GameState) => void;
  addExperience: (amount: number) => { leveledUp: boolean; levelsGained: number };
  updateHighScore: (score: number) => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      gameState: 'menu',
      player: ExperienceSystem.initializePlayer(),
      currentScore: 0,
      highScore: 0,

      // ゲーム状態の変更
      setGameState: (state) => set({ gameState: state }),

      // 経験値追加
      addExperience: (amount) => {
        const { player } = get();
        const result = ExperienceSystem.addExperience(player, amount);
        
        if (result.leveledUp) {
          ExperienceSystem.applyLevelUpBonuses(player);
          
          // レベルアップ時は状態を更新
          set({ 
            player: { ...player },
            gameState: 'levelUp'
          });
        } else {
          set({ player: { ...player } });
        }
        
        return result;
      },

      // ハイスコア更新
      updateHighScore: (score) => {
        const { highScore } = get();
        if (score > highScore) {
          set({ highScore: score, currentScore: score });
        } else {
          set({ currentScore: score });
        }
      },

      // ゲームリセット
      resetGame: () => set({
        gameState: 'menu',
        currentScore: 0,
        // プレイヤーデータは保持（永続化）
      }),

      // ゲーム保存（ローカルストレージに自動保存されるため、明示的な処理は不要）
      saveGame: () => {
        // persist middleware により自動的に保存される
        console.log('Game saved automatically');
      },

      // ゲーム読み込み（ローカルストレージから自動復元されるため、明示的な処理は不要）
      loadGame: () => {
        // persist middleware により自動的に復元される
        console.log('Game loaded automatically');
      },
    }),
    {
      name: 'block-breaker-rpg-storage',
      // プレイヤーデータとハイスコアのみ永続化
      partialize: (state) => ({
        player: state.player,
        highScore: state.highScore,
      }),
    }
  )
);