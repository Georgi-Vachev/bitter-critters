// src/components/RegisterLoginForm.tsx
import React, { useState } from "react";
import { login, register } from "../api/auth";

const RegisterLoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        try {
            await register(username, password);
            setMessage("Registration successful!");
        } catch (error) {
            setMessage("Registration failed. Try again.");
        }
    };

    const handleLogin = async () => {
        try {
            await login(username, password);
            setMessage("Login successful!");
        } catch (error) {
            setMessage("Login failed. Try again.");
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="User"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Pswd"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleRegister}>Register</button>
            <p>{message}</p>
        </div>
    );
};

export default RegisterLoginForm;
