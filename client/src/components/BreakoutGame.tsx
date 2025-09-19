import { useEffect, useRef, useCallback } from 'react';
import { useBreakout } from '../lib/stores/useBreakout';
import { useAudio } from '../lib/stores/useAudio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BLOCK_WIDTH = 75;
const BLOCK_HEIGHT = 20;
const BLOCK_ROWS = 8;
const BLOCK_COLS = 10;
const BLOCK_PADDING = 5;

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Paddle {
  x: number;
  y: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
  color: string;
  imageType: number;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const block1ImageRef = useRef<HTMLImageElement>();
  const block2ImageRef = useRef<HTMLImageElement>();
  
  const { 
    gameState, 
    score, 
    lives, 
    startGame, 
    endGame, 
    winGame, 
    updateScore, 
    loseLife 
  } = useBreakout();
  
  const { playHit, playSuccess } = useAudio();

  // Game objects
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: -4 });
  const paddleRef = useRef<Paddle>({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: CANVAS_HEIGHT - 30 });
  const blocksRef = useRef<Block[]>([]);

  // Initialize blocks
  const initializeBlocks = useCallback(() => {
    const blocks: Block[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    
    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        blocks.push({
          x: col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING,
          y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + 50,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          destroyed: false,
          color: colors[row],
          imageType: row % 2 === 0 ? 1 : 2
        });
      }
    }
    
    blocksRef.current = blocks;
  }, []);

  // Reset game objects
  const resetGame = useCallback(() => {
    ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: -4 };
    paddleRef.current = { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: CANVAS_HEIGHT - 30 };
    initializeBlocks();
  }, [initializeBlocks]);

  // Collision detection
  const checkCollision = useCallback((rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState !== 'playing') return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    const blocks = blocksRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Handle paddle movement
    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) {
      paddle.x = Math.max(0, paddle.x - 6);
    }
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) {
      paddle.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddle.x + 6);
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x - BALL_RADIUS <= 0 || ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
      ball.dx = -ball.dx;
      playHit();
    }
    if (ball.y - BALL_RADIUS <= 0) {
      ball.dy = -ball.dy;
      playHit();
    }

    // Ball collision with paddle
    if (ball.y + BALL_RADIUS >= paddle.y && 
        ball.x >= paddle.x && 
        ball.x <= paddle.x + PADDLE_WIDTH &&
        ball.dy > 0) {
      
      // Calculate bounce angle based on where ball hits paddle
      const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
      const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      
      ball.dx = speed * Math.sin(angle);
      ball.dy = -Math.abs(speed * Math.cos(angle));
      playHit();
    }

    // Ball collision with blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.destroyed) continue;

      if (checkCollision(
        { x: ball.x - BALL_RADIUS, y: ball.y - BALL_RADIUS, width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
        block
      )) {
        block.destroyed = true;
        ball.dy = -ball.dy;
        updateScore(10);
        playHit();
        break;
      }
    }

    // Check win condition
    if (blocks.every(block => block.destroyed)) {
      winGame();
      playSuccess();
      return;
    }

    // Ball out of bounds (bottom)
    if (ball.y > CANVAS_HEIGHT) {
      loseLife();
      if (lives <= 1) {
        endGame();
        return;
      } else {
        // Reset ball position
        ball.x = CANVAS_WIDTH / 2;
        ball.y = CANVAS_HEIGHT / 2;
        ball.dx = 4;
        ball.dy = -4;
      }
    }

    // Draw paddle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();

    // Draw blocks
    blocks.forEach(block => {
      if (!block.destroyed) {
        const blockImage = block.imageType === 1 ? block1ImageRef.current : block2ImageRef.current;
        
        if (blockImage && blockImage.complete) {
          ctx.drawImage(blockImage, block.x, block.y, block.width, block.height);
        } else {
          // Fallback to color if image not loaded
          ctx.fillStyle = block.color;
          ctx.fillRect(block.x, block.y, block.width, block.height);
          
          // Add border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
      }
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, lives, playHit, playSuccess, updateScore, loseLife, endGame, winGame, checkCollision]);

  // Start game loop when game starts
  useEffect(() => {
    if (gameState === 'playing') {
      resetGame();
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop, resetGame]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      
      if (gameState === 'ready' && e.code === 'Space') {
        startGame();
      }
      
      if ((gameState === 'gameOver' || gameState === 'won') && e.code === 'Space') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame]);

  // Load block images
  useEffect(() => {
    const block1Image = new Image();
    const block2Image = new Image();
    
    block1Image.src = '/block1.png';
    block2Image.src = '/block2.png';
    
    block1ImageRef.current = block1Image;
    block2ImageRef.current = block2Image;
  }, []);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-white bg-black"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
