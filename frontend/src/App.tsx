import React, { useState } from 'react';
import RegisterLoginForm from "./components/RegisterLoginForm";
import PixiContainer from './components/PixiContainer';
import "./App.css";

const App: React.FC = () => {
  const [showPixi, setShowPixi] = useState<boolean>(true);

  return (
    <div className="app-container">
      {/* <h1>Bitter Critters</h1> */}
      {/* <div className="login-register-form">
        <RegisterLoginForm />
      </div> */}
      {/* <button onClick={() => setShowPixi(!showPixi)}>
        {showPixi ? 'Hide PIXI App' : 'Show PIXI App'}
      </button> */}
      {showPixi && <PixiContainer visible={showPixi} />}
    </div>
  );
};

export default App;
