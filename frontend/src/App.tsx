import React from "react";
import RegisterLoginForm from "./components/RegisterLoginForm";
import PokemonTable from "./components/PokemonTable";
import "./App.css";
import Battle from "./components/Battle";


const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Pokémon Battlegrounds</h1>
      <div className="login-register-form">
        <RegisterLoginForm />
      </div>
      <PokemonTable />
      {/* <Battle /> */}
    </div>
  );
};

export default App;
