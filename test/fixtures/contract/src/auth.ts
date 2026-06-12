import { hash } from "./crypto.js";
export interface Session {
  id: string;
}
export class AuthService {
  login(user: string): Session {
    return { id: hash(user) };
  }
}
export function logout(): void {}
