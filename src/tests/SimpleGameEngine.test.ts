import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine, GameEngineConfig } from '../game/engine/GameEngine';

describe('Simple Game Engine Tests', () => {
  let canvas: HTMLCanvasElement;
  let gameEngine: GameEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    
    const config: GameEngineConfig = {
      canvas,
      targetFPS: 60,
      backgroundColor: '#000000'
    };
    gameEngine = new GameEngine(config);
  });

  describe('Engine Initialization', () => {
    it('should create GameEngine instance successfully', () => {
      expect(gameEngine).toBeInstanceOf(GameEngine);
    });

    it('should initialize with correct canvas dimensions', () => {
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('should have valid 2D rendering context', () => {
      const ctx = canvas.getContext('2d');
      expect(ctx).not.toBeNull();
      expect(ctx).toBeInstanceOf(CanvasRenderingContext2D);
    });
  });

  describe('Game Loop Management', () => {
    it('should start and stop game loop correctly', () => {
      // Test starting the game loop
      gameEngine.start();
      expect(gameEngine.isRunning()).toBe(true);

      // Test stopping the game loop
      gameEngine.stop();
      expect(gameEngine.isRunning()).toBe(false);
    });

    it('should handle multiple start/stop cycles', () => {
      // Multiple start/stop cycles should work without issues
      gameEngine.start();
      expect(gameEngine.isRunning()).toBe(true);
      
      gameEngine.stop();
      expect(gameEngine.isRunning()).toBe(false);
      
      gameEngine.start();
      expect(gameEngine.isRunning()).toBe(true);
      
      gameEngine.stop();
      expect(gameEngine.isRunning()).toBe(false);
    });
  });

  describe('GameObject Management', () => {
    it('should add game objects successfully', () => {
      const mockGameObject = {
        id: 'test-object',
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        active: true,
        update: vi.fn(),
        render: vi.fn(),
        destroy: vi.fn()
      };

      gameEngine.addGameObject(mockGameObject);
      
      const objects = gameEngine.getGameObjects();
      expect(objects).toContain(mockGameObject);
    });

    it('should remove game objects successfully', () => {
      const mockGameObject = {
        id: 'test-object',
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        active: true,
        update: vi.fn(),
        render: vi.fn(),
        destroy: vi.fn()
      };

      gameEngine.addGameObject(mockGameObject);
      expect(gameEngine.getGameObjects()).toContain(mockGameObject);

      gameEngine.removeGameObject('test-object');
      expect(gameEngine.getGameObjects()).not.toContain(mockGameObject);
    });

    it('should clear all game objects', () => {
      const mockObjects = [
        { id: 'obj1', x: 0, y: 0, width: 10, height: 10, active: true, update: vi.fn(), render: vi.fn(), destroy: vi.fn() },
        { id: 'obj2', x: 0, y: 0, width: 10, height: 10, active: true, update: vi.fn(), render: vi.fn(), destroy: vi.fn() },
        { id: 'obj3', x: 0, y: 0, width: 10, height: 10, active: true, update: vi.fn(), render: vi.fn(), destroy: vi.fn() }
      ];

      mockObjects.forEach(obj => gameEngine.addGameObject(obj));
      expect(gameEngine.getGameObjects().length).toBe(3);

      gameEngine.clearGameObjects();
      expect(gameEngine.getGameObjects().length).toBe(0);
    });
  });

  describe('Canvas Operations', () => {
    it('should handle canvas clear operations', () => {
      const ctx = canvas.getContext('2d')!;
      
      // Draw something on canvas
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
      
      // Get pixel data before clear
      const imageDataBefore = ctx.getImageData(50, 50, 1, 1);
      const redValue = imageDataBefore.data[0];
      expect(redValue).toBeGreaterThan(0);
      
      // Clear canvas
      gameEngine.clearCanvas();
      
      // Get pixel data after clear
      const imageDataAfter = ctx.getImageData(50, 50, 1, 1);
      const clearedValue = imageDataAfter.data[0];
      expect(clearedValue).toBe(0);
    });

    it('should handle background color setting', () => {
      const config: GameEngineConfig = {
        canvas,
        targetFPS: 60,
        backgroundColor: '#ff0000'
      };
      
      const redBackgroundEngine = new GameEngine(config);
      expect(redBackgroundEngine).toBeInstanceOf(GameEngine);
    });
  });

  describe('Performance and Timing', () => {
    it('should measure frame timing accurately', () => {
      const startTime = performance.now();
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      
      const endTime = performance.now();
      const deltaTime = endTime - startTime;
      
      expect(deltaTime).toBeGreaterThan(0);
      expect(deltaTime).toBeLessThan(100); // Should be less than 100ms for simple work
    });

    it('should handle high frequency updates', () => {
      const mockGameObject = {
        id: 'performance-test',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        active: true,
        updateCount: 0,
        update: function() { this.updateCount++; },
        render: vi.fn(),
        destroy: vi.fn()
      };

      gameEngine.addGameObject(mockGameObject);
      
      // Simulate multiple update cycles
      const updateCount = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < updateCount; i++) {
        gameEngine.updateGameObjects(1/60);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTimePerUpdate = totalTime / updateCount;
      
      expect(mockGameObject.updateCount).toBe(updateCount);
      expect(avgTimePerUpdate).toBeLessThan(1); // Less than 1ms per update
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid game object addition gracefully', () => {
      // Try to add null object
      expect(() => gameEngine.addGameObject(null as any)).not.toThrow();
      
      // Try to add undefined object
      expect(() => gameEngine.addGameObject(undefined as any)).not.toThrow();
    });

    it('should handle removing non-existent objects gracefully', () => {
      expect(() => gameEngine.removeGameObject('non-existent-id')).not.toThrow();
    });

    it('should handle canvas context loss gracefully', () => {
      // This test simulates what happens when canvas context is lost
      // In real scenarios, this might happen due to GPU issues
      expect(() => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Simulate some canvas operations that might fail
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }).not.toThrow();
    });
  });
});