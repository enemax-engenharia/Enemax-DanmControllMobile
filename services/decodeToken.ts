import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  email: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

export function decodeToken(token: string): DecodedToken {
  return jwtDecode<DecodedToken>(token);
}
