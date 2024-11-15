import React from "react";
import RegisterLoginForm from "./components/RegisterLoginForm";
import PokemonTable from "./components/PokemonTable";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Bitter Critters</h1>
      <div className="login-register-form">
        <RegisterLoginForm />
      </div>
      <div className="pokemon-table-container">
        <PokemonTable />
      </div>

      {/* <Battle /> */}
    </div>
  );
};

export default App;
