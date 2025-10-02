import { describe, it, expect } from 'vitest';
import { ExperienceSystem } from '../game/systems/ExperienceSystem';

describe('ExperienceSystem', () => {
  describe('calculateExperienceRequired', () => {
    it('should calculate correct experience for level 1', () => {
      const exp = ExperienceSystem.calculateExperienceRequired(1);
      expect(exp).toBe(100);
    });

    it('should calculate correct experience for level 2', () => {
      const exp = ExperienceSystem.calculateExperienceRequired(2);
      expect(exp).toBe(150);
    });

    it('should increase exponentially', () => {
      const level1 = ExperienceSystem.calculateExperienceRequired(1);
      const level3 = ExperienceSystem.calculateExperienceRequired(3);
      expect(level3).toBeGreaterThan(level1 * 2);
    });
  });

  describe('initializePlayer', () => {
    it('should create a player with level 1', () => {
      const player = ExperienceSystem.initializePlayer();
      expect(player.stats.level).toBe(1);
      expect(player.stats.experience).toBe(0);
      expect(player.stats.totalExperience).toBe(0);
      expect(player.stats.skillPoints).toBe(0);
    });

    it('should have correct initial attributes', () => {
      const player = ExperienceSystem.initializePlayer();
      expect(player.attributes.paddleSize).toBe(100);
      expect(player.attributes.paddleSpeed).toBe(300);
      expect(player.attributes.ballSpeed).toBe(250);
      expect(player.attributes.ballDamage).toBe(10);
    });
  });

  describe('addExperience', () => {
    it('should add experience without leveling up', () => {
      const player = ExperienceSystem.initializePlayer();
      const result = ExperienceSystem.addExperience(player, 50);
      
      expect(result.leveledUp).toBe(false);
      expect(result.levelsGained).toBe(0);
      expect(player.stats.experience).toBe(50);
      expect(player.stats.level).toBe(1);
    });

    it('should level up when experience threshold is reached', () => {
      const player = ExperienceSystem.initializePlayer();
      const result = ExperienceSystem.addExperience(player, 100);
      
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
      expect(player.stats.level).toBe(2);
      expect(player.stats.skillPoints).toBe(1);
    });

    it('should handle multiple level ups', () => {
      const player = ExperienceSystem.initializePlayer();
      const result = ExperienceSystem.addExperience(player, 300);
      
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBeGreaterThan(1);
      expect(player.stats.level).toBeGreaterThan(2);
    });
  });

  describe('applyLevelUpBonuses', () => {
    it('should increase attributes with level', () => {
      const player = ExperienceSystem.initializePlayer();
      const initialPaddleSize = player.attributes.paddleSize;
      
      player.stats.level = 5;
      ExperienceSystem.applyLevelUpBonuses(player);
      
      expect(player.attributes.paddleSize).toBeGreaterThan(initialPaddleSize);
      expect(player.attributes.paddleSpeed).toBeGreaterThan(300);
      expect(player.attributes.ballSpeed).toBeGreaterThan(250);
      expect(player.attributes.ballDamage).toBeGreaterThan(10);
    });
  });
});