// src/services/storyApi.js
// Hapus import axios: import axios from 'axios';
import { getToken } from "../utils/auth"; // Tetap butuh ini

const BASE_URL = "https://story-api.dicoding.dev/v1";

// Fungsi untuk mendapatkan semua cerita
export const getAllStories = async () => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json(); // Penting: Mengurai JSON response

    if (data.error) {
      if (response.status === 401) {
        throw new Error(
          "Invalid token structure or token expired. Please login again."
        );
      }
      throw new Error(data.message || "Gagal mengambil cerita");
    }
    return data.listStory;
  } catch (error) {
    console.error("Error fetching stories:", error.message);
    throw new Error(error.message || "Gagal mengambil cerita");
  }
};

// Fungsi untuk mendapatkan detail cerita
export const getStoryDetail = async (id) => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json(); // Penting: Mengurai JSON response

    if (data.error) {
      if (response.status === 401) {
        throw new Error(
          "Invalid token structure or token expired. Please login again."
        );
      }
      throw new Error(data.message || "Gagal mengambil detail cerita");
    }
    return data.story;
  } catch (error) {
    console.error("Error fetching story detail:", error.message);
    throw new Error(error.message || "Gagal mengambil detail cerita");
  }
};

// Fungsi untuk menambah cerita baru (dengan upload foto dan lokasi opsional)
export const addStory = async (description, photo, lat, lon, token) => {
  try {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lat !== null) {
      formData.append("lat", lat);
    }
    if (lon !== undefined && lon !== null) {
      formData.append("lon", lon);
    }

    // fetch dengan FormData tidak perlu Content-Type header karena browser akan mengaturnya
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json(); // Penting: Mengurai JSON response

    if (data.error) {
      throw new Error(data.message || "Gagal menambah cerita");
    }
    return data;
  } catch (error) {
    console.error("Error adding story:", error.message);
    throw new Error(error.message || "Gagal menambah cerita");
  }
};
