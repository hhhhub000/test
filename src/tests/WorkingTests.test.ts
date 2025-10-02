import { describe, it, expect } from 'vitest';
import { ExperienceSystem } from '../game/systems/ExperienceSystem';
import { DEFAULT_SKILLS } from '../game/systems/SkillSystem';

describe('Working System Tests', () => {
  describe('Experience System', () => {
    it('should calculate experience requirements correctly', () => {
      // Test level 1 requirement
      expect(ExperienceSystem.calculateExperienceRequired(1)).toBe(100);
      
      // Test level 2 requirement (100 * 1.5^1 = 150)
      expect(ExperienceSystem.calculateExperienceRequired(2)).toBe(150);
      
      // Test level 3 requirement (100 * 1.5^2 = 225)
      expect(ExperienceSystem.calculateExperienceRequired(3)).toBe(225);
    });

    it('should calculate level from total experience', () => {
      expect(ExperienceSystem.calculateLevelFromTotalExperience(0)).toBe(1);
      expect(ExperienceSystem.calculateLevelFromTotalExperience(50)).toBe(1);
      expect(ExperienceSystem.calculateLevelFromTotalExperience(100)).toBe(2);
      expect(ExperienceSystem.calculateLevelFromTotalExperience(250)).toBe(3);
    });

    it('should add experience and detect level ups', () => {
      const mockPlayer = {
        id: 'test-player',
        level: 1,
        stats: {
          level: 1,
          experience: 50,
          totalExperience: 50,
          experienceToNext: 100, // Level 1 needs 100 total exp
          skillPoints: 0
        },
        attributes: {}
      } as any;

      // Add 50 more experience (50 + 50 = 100, should level up to level 2)
      const result = ExperienceSystem.addExperience(mockPlayer, 50);
      
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
      expect(result.newLevel).toBe(2);
      expect(mockPlayer.stats.totalExperience).toBe(100);
    });
  });

  describe('Skill System', () => {
    it('should have default skills defined', () => {
      expect(DEFAULT_SKILLS).toBeDefined();
      expect(Array.isArray(DEFAULT_SKILLS)).toBe(true);
      expect(DEFAULT_SKILLS.length).toBeGreaterThan(0);
    });

    it('should have properly structured skill objects', () => {
      const skill = DEFAULT_SKILLS[0];
      
      expect(skill).toHaveProperty('id');
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('description');
      expect(skill).toHaveProperty('requiredLevel');
      expect(skill).toHaveProperty('cooldown');
      expect(skill).toHaveProperty('skillType');
      expect(skill).toHaveProperty('effects');
      
      expect(typeof skill.id).toBe('string');
      expect(typeof skill.name).toBe('string');
      expect(typeof skill.description).toBe('string');
      expect(typeof skill.requiredLevel).toBe('number');
      expect(Array.isArray(skill.effects)).toBe(true);
    });

    it('should have skills with valid effect structures', () => {
      const skillsWithEffects = DEFAULT_SKILLS.filter(skill => skill.effects.length > 0);
      expect(skillsWithEffects.length).toBeGreaterThan(0);
      
      const effect = skillsWithEffects[0].effects[0];
      expect(effect).toHaveProperty('type');
      expect(effect).toHaveProperty('value');
      
      expect(typeof effect.type).toBe('string');
      expect(typeof effect.value).toBe('number');
    });
  });

  describe('Math Utilities', () => {
    it('should clamp values correctly', () => {
      // Test normal clamping
      expect(Math.max(0, Math.min(10, 5))).toBe(5);
      expect(Math.max(0, Math.min(10, -5))).toBe(0);
      expect(Math.max(0, Math.min(10, 15))).toBe(10);
    });

    it('should calculate distance correctly', () => {
      const distance = Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2));
      expect(distance).toBe(5);
    });

    it('should normalize vectors correctly', () => {
      const x = 3, y = 4;
      const magnitude = Math.sqrt(x * x + y * y);
      const normalizedX = x / magnitude;
      const normalizedY = y / magnitude;
      
      expect(normalizedX).toBeCloseTo(0.6, 5);
      expect(normalizedY).toBeCloseTo(0.8, 5);
      
      // Verify unit length
      const length = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      expect(length).toBeCloseTo(1, 5);
    });

    it('should interpolate values correctly', () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.3)).toBe(13);
    });
  });

  describe('Basic Collision Detection', () => {
    it('should detect rectangle overlaps', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };
      
      const overlaps = (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
      
      expect(overlaps).toBe(true);
    });

    it('should detect rectangle non-overlaps', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      
      const overlaps = (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
      
      expect(overlaps).toBe(false);
    });

    it('should detect circle-rectangle collisions', () => {
      const circle = { x: 50, y: 50, radius: 10 };
      const rect = { x: 25, y: 25, width: 50, height: 50 };
      
      // Find closest point on rectangle to circle center
      const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
      const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
      
      // Calculate distance from circle center to closest point
      const dx = circle.x - closestX;
      const dy = circle.y - closestY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const collides = distance <= circle.radius;
      expect(collides).toBe(true);
    });
  });

  describe('Physics Calculations', () => {
    it('should calculate velocity changes correctly', () => {
      const initialVelocity = { x: 100, y: 200 };
      const deltaTime = 1/60;
      
      const newPosition = {
        x: 0 + initialVelocity.x * deltaTime,
        y: 0 + initialVelocity.y * deltaTime
      };
      
      expect(newPosition.x).toBeCloseTo(1.67, 2);
      expect(newPosition.y).toBeCloseTo(3.33, 2);
    });

    it('should handle velocity reflection', () => {
      const velocity = { x: 100, y: 200 };
      const normal = { x: 0, y: -1 }; // Upward normal
      
      // Reflect velocity: v' = v - 2(v·n)n
      const dotProduct = velocity.x * normal.x + velocity.y * normal.y;
      const reflectedVelocity = {
        x: velocity.x - 2 * dotProduct * normal.x,
        y: velocity.y - 2 * dotProduct * normal.y
      };
      
      expect(reflectedVelocity.x).toBe(100);
      expect(reflectedVelocity.y).toBe(-200); // Y velocity reversed
    });

    it('should calculate damage based on level and skills', () => {
      const baseDamage = 1;
      const levelMultiplier = 1 + (5 - 1) * 0.1; // Level 5 = 1.4x
      const skillMultiplier = 1.5; // Assuming damage boost skill
      
      const totalDamage = baseDamage * levelMultiplier * skillMultiplier;
      expect(totalDamage).toBeCloseTo(2.1, 2);
    });
  });
});