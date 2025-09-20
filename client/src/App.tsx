import { useEffect } from "react";
import BreakoutGame from "./components/BreakoutGame";
import GameUI from "./components/GameUI";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const { setHitSound, setSuccessSound } = useAudio();

  // Initialize audio on component mount
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: '#111112'
    }}>
      <BreakoutGame />
      <GameUI />
    </div>
  );
}

export default App;
