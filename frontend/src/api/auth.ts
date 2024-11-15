// src/api/auth.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";  // Base URL for the backend

// Register a new user
export async function register(username: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/register/`, { username, password });
    return response.data;
}

// Login a user
export async function login(username: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
    console.log(response)
    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
}

// Get the current token (if available)
export function getToken() {
    return localStorage.getItem("token");
}

// Logout function to clear token
export function logout() {
    localStorage.removeItem("token");
}
