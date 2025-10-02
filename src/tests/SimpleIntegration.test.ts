import { describe, it, expect } from 'vitest';
import { BallEntity } from '../game/entities/BallEntity';
import { PaddleEntity } from '../game/entities/PaddleEntity';
import { BlockEntity } from '../game/entities/BlockEntity';
import { ExperienceSystem } from '../game/systems/ExperienceSystem';

describe('Simple Integration Tests', () => {
  describe('Entity Creation and Basic Functionality', () => {
    it('should create BallEntity with correct properties', () => {
      const ball = new BallEntity(
        'test-ball',
        { x: 400, y: 300 },
        10,
        { x: 200, y: 150 },
        800,
        600,
        1 // damage parameter
      );

      expect(ball.id).toBe('test-ball');
      expect(ball.x).toBe(400);
      expect(ball.y).toBe(300);
      expect(ball.radius).toBe(10);
      expect(ball.velocity.x).toBe(200);
      expect(ball.velocity.y).toBe(150);
    });

    it('should create PaddleEntity with correct properties', () => {
      const paddle = new PaddleEntity(
        'test-paddle',
        { x: 350, y: 550 },
        100,
        20,
        800,
        600
      );

      expect(paddle.id).toBe('test-paddle');
      expect(paddle.x).toBe(350);
      expect(paddle.y).toBe(550);
      expect(paddle.width).toBe(100);
      expect(paddle.height).toBe(20);
    });

    it('should create BlockEntity with correct properties', () => {
      const block = new BlockEntity(
        'test-block',
        { x: 200, y: 150 },
        80,
        30,
        1
      );

      expect(block.id).toBe('test-block');
      expect(block.x).toBe(200);
      expect(block.y).toBe(150);
      expect(block.width).toBe(80);
      expect(block.height).toBe(30);
    });
  });

  describe('Ball Physics Integration', () => {
    it('should update ball position based on velocity and time', () => {
      const ball = new BallEntity(
        'physics-ball',
        { x: 100, y: 100 },
        10,
        { x: 200, y: 150 },
        800,
        600,
        1
      );

      const initialX = ball.x;
      const initialY = ball.y;
      const deltaTime = 1/60; // 1 frame at 60fps

      ball.update(deltaTime);

      const expectedX = initialX + ball.velocity.x * deltaTime;
      const expectedY = initialY + ball.velocity.y * deltaTime;

      expect(ball.x).toBeCloseTo(expectedX, 3);
      expect(ball.y).toBeCloseTo(expectedY, 3);
    });

    it('should handle ball boundary collision', () => {
      // Test left boundary
      const leftBall = new BallEntity(
        'left-ball',
        { x: 5, y: 300 }, // Near left edge
        10,
        { x: -200, y: 0 }, // Moving left
        800,
        600,
        1
      );

      leftBall.update(1/60);
      
      // Ball should be pushed away from the boundary and velocity should reverse
      expect(leftBall.x).toBeGreaterThanOrEqual(leftBall.radius);
      if (leftBall.x <= leftBall.radius) {
        expect(leftBall.velocity.x).toBeGreaterThan(0);
      }
    });
  });

  describe('Experience and Skill System Integration', () => {
    it('should calculate experience requirements correctly', () => {
      // Test experience calculation for different levels
      expect(ExperienceSystem.calculateExperienceRequired(1)).toBe(100);
      expect(ExperienceSystem.calculateExperienceRequired(2)).toBe(150);
      expect(ExperienceSystem.calculateExperienceRequired(3)).toBe(225);
    });

    it('should calculate level from total experience', () => {
      expect(ExperienceSystem.calculateLevelFromTotalExperience(0)).toBe(1);
      expect(ExperienceSystem.calculateLevelFromTotalExperience(100)).toBe(2);
      expect(ExperienceSystem.calculateLevelFromTotalExperience(300)).toBe(3);
    });

    it('should handle player experience addition', () => {
      const mockPlayer = {
        id: 'test-player',
        level: 1,
        stats: {
          experience: 0,
          totalExperience: 0
        }
      } as any;

      const result = ExperienceSystem.addExperience(mockPlayer, 150);
      
      expect(result.leveledUp).toBe(true);
      expect(result.levelsGained).toBe(1);
      expect(result.newLevel).toBe(2);
      expect(mockPlayer.stats.totalExperience).toBe(150);
    });

    it('should work with skill system default skills', () => {
      // Import and test default skills
      const { DEFAULT_SKILLS } = require('../game/systems/SkillSystem');
      
      expect(DEFAULT_SKILLS).toBeDefined();
      expect(Array.isArray(DEFAULT_SKILLS)).toBe(true);
      expect(DEFAULT_SKILLS.length).toBeGreaterThan(0);
      
      // Check that skills have required properties
      const firstSkill = DEFAULT_SKILLS[0];
      expect(firstSkill).toHaveProperty('id');
      expect(firstSkill).toHaveProperty('name');
      expect(firstSkill).toHaveProperty('description');
      expect(firstSkill).toHaveProperty('requiredLevel');
    });
  });

  describe('Entity Collision Detection', () => {
    it('should detect when ball overlaps with block', () => {
      const ball = new BallEntity(
        'collision-ball',
        { x: 200, y: 150 }, // Same position as block center
        10,
        { x: 0, y: 100 },
        800,
        600,
        1
      );

      const block = new BlockEntity(
        'collision-block',
        { x: 160, y: 130 }, // Overlapping with ball
        80,
        40,
        1
      );

      // Simple overlap check
      const ballLeft = ball.x - ball.radius;
      const ballRight = ball.x + ball.radius;
      const ballTop = ball.y - ball.radius;
      const ballBottom = ball.y + ball.radius;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      const isOverlapping = (
        ballRight >= blockLeft &&
        ballLeft <= blockRight &&
        ballBottom >= blockTop &&
        ballTop <= blockBottom
      );

      expect(isOverlapping).toBe(true);
    });

    it('should detect when ball does not overlap with block', () => {
      const ball = new BallEntity(
        'no-collision-ball',
        { x: 50, y: 50 }, // Far from block
        10,
        { x: 0, y: 100 },
        800,
        600,
        1
      );

      const block = new BlockEntity(
        'no-collision-block',
        { x: 300, y: 300 }, // Far from ball
        80,
        40,
        1
      );

      // Simple overlap check
      const ballLeft = ball.x - ball.radius;
      const ballRight = ball.x + ball.radius;
      const ballTop = ball.y - ball.radius;
      const ballBottom = ball.y + ball.radius;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      const isOverlapping = (
        ballRight >= blockLeft &&
        ballLeft <= blockRight &&
        ballBottom >= blockTop &&
        ballTop <= blockBottom
      );

      expect(isOverlapping).toBe(false);
    });
  });

  describe('Paddle Movement Integration', () => {
    it('should move paddle left within bounds', () => {
      const paddle = new PaddleEntity(
        'move-paddle',
        { x: 400, y: 550 },
        100,
        20,
        800,
        600
      );

      const initialX = paddle.x;
      paddle.moveLeft();

      expect(paddle.x).toBeLessThan(initialX);
      expect(paddle.x).toBeGreaterThanOrEqual(0);
    });

    it('should move paddle right within bounds', () => {
      const paddle = new PaddleEntity(
        'move-paddle',
        { x: 300, y: 550 },
        100,
        20,
        800,
        600
      );

      const initialX = paddle.x;
      paddle.moveRight();

      expect(paddle.x).toBeGreaterThan(initialX);
      expect(paddle.x + paddle.width).toBeLessThanOrEqual(800);
    });

    it('should not move paddle beyond left boundary', () => {
      const paddle = new PaddleEntity(
        'boundary-paddle',
        { x: 0, y: 550 }, // At left edge
        100,
        20,
        800,
        600
      );

      paddle.moveLeft(); // Try to move further left
      expect(paddle.x).toBe(0); // Should stay at boundary
    });

    it('should not move paddle beyond right boundary', () => {
      const paddle = new PaddleEntity(
        'boundary-paddle',
        { x: 700, y: 550 }, // At right edge (700 + 100 = 800)
        100,
        20,
        800,
        600
      );

      paddle.moveRight(); // Try to move further right
      expect(paddle.x).toBe(700); // Should stay at boundary
    });
  });
});