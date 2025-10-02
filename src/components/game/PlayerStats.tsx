import React from 'react';
import { useGameStore } from '../../stores';
import { ProgressBar } from '../ui';

export const PlayerStats: React.FC = () => {
  const { player } = useGameStore();

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
      <h3 className="text-lg font-bold text-white mb-3">プレイヤー情報</h3>
      
      <div className="space-y-3">
        {/* レベル */}
        <div>
          <span className="text-sm text-gray-300">レベル: </span>
          <span className="text-xl font-bold text-primary-400">{player.stats.level}</span>
        </div>

        {/* 経験値バー */}
        <ProgressBar
          current={player.stats.experience}
          max={player.stats.experienceToNext}
          label="経験値"
          color="blue"
        />

        {/* スキルポイント */}
        <div>
          <span className="text-sm text-gray-300">スキルポイント: </span>
          <span className="text-lg font-semibold text-secondary-400">
            {player.stats.skillPoints}
          </span>
        </div>

        {/* 能力値 */}
        <div className="border-t border-slate-600 pt-3">
          <h4 className="text-md font-semibold text-white mb-2">能力値</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">パドルサイズ: </span>
              <span className="text-white">{player.attributes.paddleSize}</span>
            </div>
            <div>
              <span className="text-gray-400">パドル速度: </span>
              <span className="text-white">{player.attributes.paddleSpeed}</span>
            </div>
            <div>
              <span className="text-gray-400">ボール速度: </span>
              <span className="text-white">{player.attributes.ballSpeed}</span>
            </div>
            <div>
              <span className="text-gray-400">ボール威力: </span>
              <span className="text-white">{player.attributes.ballDamage}</span>
            </div>
            <div>
              <span className="text-gray-400">クリティカル率: </span>
              <span className="text-white">
                {Math.round(player.attributes.criticalChance * 100)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">EXP倍率: </span>
              <span className="text-white">
                {player.attributes.experienceMultiplier.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};