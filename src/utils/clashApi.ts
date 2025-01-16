import axios from "axios";
import { CLASH_API_TOKEN } from "../config/constants";

const api = axios.create({
  baseURL: "https://api.clashofclans.com/v1",
  headers: {
    'Authorization': `Bearer ${CLASH_API_TOKEN}`,
    'Accept': 'application/json'
  }
});

export async function getPlayerInfo(playerTag: string) {
  try {
    const response = await api.get(`/players/${encodeURIComponent(playerTag)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching player info:", error);
    throw new Error("Failed to fetch player info");
  }
}

export async function getCurrentWar(clanTag: string) {
  try {
    const response = await api.get(`/clans/${encodeURIComponent(clanTag)}/currentwar`);
    return response.data;
  } catch (error) {
    console.error("Error fetching war info:", error);
    throw new Error("Failed to fetch war info");
  }
}
