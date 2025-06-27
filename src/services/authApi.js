// src/services/authApi.js
// Pastikan tidak ada import axios di sini

const BASE_URL = "https://story-api.dicoding.dev/v1";

export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "Registrasi gagal");
    }
    return data;
  } catch (error) {
    console.error("Registration error:", error.message);
    throw new Error(error.message || "Registrasi gagal");
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "Login gagal");
    }

    // PERUBAHAN DI SINI: Akses token melalui data.loginResult.token
    if (data && data.loginResult && data.loginResult.token) {
      //
      return data.loginResult.token; //
    } else {
      throw new Error(
        "Struktur respons login tidak valid: Token tidak ditemukan."
      );
    }
  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error(
      error.response?.data?.message ||
        "Login gagal. Cek kembali email dan password Anda."
    );
  }
};
