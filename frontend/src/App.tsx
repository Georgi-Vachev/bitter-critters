import React, { useRef } from 'react';
import PixiContainer from './components/PixiContainer';
import "./App.css";

const App: React.FC = () => {
  const pixiContainerRef = useRef<{ resetApp: () => void } | null>(null);

  const handleResetPixi = () => {
    pixiContainerRef.current?.resetApp();
  };

  console.error('WHY AM I PRINTED TWICE?')

  return (
    <div className="app-container">
      <button onClick={handleResetPixi}>Reset PIXI App</button>
      <PixiContainer ref={pixiContainerRef} />
    </div>
  );
};

export default App;
