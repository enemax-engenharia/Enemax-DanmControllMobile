import { decodeToken } from "../services/decodeToken";
import { apiRequest } from "./apiService";
import { saveToken, saveUserInfos } from "./authStorageService";



export async function authenticate(email: string, password: string) {
  const data = await apiRequest("/User/authenticate", "POST", { email, password });
  const token = data.result;
    if (token) {
        await saveToken(token);
        return token;
    }    
}

export async function login(clientDomaindId: string) {
  const data = await apiRequest("/User/confirm-client", "POST", clientDomaindId);
  const token = data.result;
    if (token) {
      const decoded = decodeToken(token);
        await saveUserInfos(token, decoded.damName, decoded.permissionToAddRoutines);
        return token;
    }    
}
