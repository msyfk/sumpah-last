import { login, register } from "../services/authApi.js";
import { setToken, getToken, logout } from "../utils/auth.js";

export class AuthModel {
  async login(email, password) {
    try {
      const token = await login(email, password);
      setToken(token);
      return token;
    } catch (error) {
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      return await register(name, email, password);
    } catch (error) {
      throw error;
    }
  }

  isLoggedIn() {
    return !!getToken();
  }

  logout() {
    logout();
  }
}