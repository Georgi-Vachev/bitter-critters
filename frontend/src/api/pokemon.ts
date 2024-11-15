import axios from "axios";
import { Pokemon } from "../types/pokemon";

const API_URL = "http://127.0.0.1:8000";

export async function getPokemons(): Promise<Pokemon[]> {
    const response = await axios.get(`${API_URL}/pokemon`);
    return response.data;
}
