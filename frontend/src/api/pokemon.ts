import axios from "axios";
import { CardData } from "../types/cardData";

const API_URL = "http://127.0.0.1:8000";

export async function getPokemons(): Promise<CardData[]> {
    const response = await axios.get(`${API_URL}/pokemon`);
    return response.data;
}
