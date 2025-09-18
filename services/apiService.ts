import Constants from 'expo-constants';
import { getToken } from "./authStorageService";


const BASE_URL = Constants.expoConfig?.extra?.API_URL;

export async function apiRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
): Promise<T> {
  try {
    const tokenValue = await getToken();
    // Só adiciona Content-Type se NÃO for FormData
    const headers: HeadersInit = {};
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (tokenValue) {
      headers["Authorization"] = `Bearer ${tokenValue}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      if (Array.isArray(data?.errors)) {
        errorMessage = data.errors.map((e: any) => e.message).join('\n');
      } else if (typeof data?.message === 'string') {
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      }
      console.log(response);

      throw new Error(errorMessage + `\n` + JSON.stringify(response));
    }

    return data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
}