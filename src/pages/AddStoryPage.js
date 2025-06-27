// Leaflet is loaded from CDN in index.html and available as global 'L'

import { addStory } from "../services/storyApi.js";
import { getToken } from "../utils/auth.js";
import { createLoadingIndicator } from "../components/LoadingIndicator.js";

let currentStream = null; // Untuk menampung aliran media
let map = null; // Untuk menampung instance peta Leaflet
let marker = null; // Untuk menampung marker peta

// Export stopCamera function so it can be called from App.js
export const stopCamera = () => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
  const videoElement = document.querySelector("#camera-video");
  if (videoElement) {
    videoElement.srcObject = null;
  }
  const cameraControls = document.querySelector("#camera-controls");
  if (cameraControls) {
    cameraControls.innerHTML = `
        <button type="button" id="start-camera-btn" class="btn-secondary">
            Buka Kamera
        </button>
      `;
    document
      .getElementById("start-camera-btn")
      .addEventListener("click", startCamera);
  }
};

const startCamera = async () => {
  const cameraVideoContainer = document.querySelector(
    "#camera-video-container"
  );
  if (!cameraVideoContainer) return;

  const photoPreview = document.querySelector("#photo-preview-container");
  if (photoPreview) photoPreview.innerHTML = "";
  const fileInput = document.getElementById("photo-file-input");
  if (fileInput) fileInput.value = "";

  cameraVideoContainer.innerHTML = `
        <video id="camera-video" autoplay playsInline muted
            style="width: 100%; height: auto; display: block; transform: scaleX(-1);">
        </video>
        <canvas id="camera-canvas" style="display: none;"></canvas>
        <div id="camera-controls" style="display: flex; justify-content: center; padding: 10px; gap: 10px;">
            <button type="button" id="take-photo-btn" class="btn-secondary">Ambil Foto</button>
            <button type="button" id="stop-camera-btn" class="btn-danger">Stop Kamera</button>
        </div>
    `;

  const videoElement = document.getElementById("camera-video");
  const takePhotoBtn = document.getElementById("take-photo-btn");
  const stopCameraBtn = document.getElementById("stop-camera-btn");

  takePhotoBtn.addEventListener("click", takePhoto);
  stopCameraBtn.addEventListener("click", stopCamera);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    currentStream = stream;
    videoElement.srcObject = stream;
    videoElement.play();
  } catch (err) {
    console.error("Gagal mengakses kamera:", err);
    const errorMessage = document.createElement("p");
    errorMessage.className = "error-message";
    errorMessage.textContent =
      "Gagal mengakses kamera. Pastikan izin kamera diberikan.";
    cameraVideoContainer.innerHTML = "";
    cameraVideoContainer.appendChild(errorMessage);
    stopCamera();
  }
};

let capturedPhoto = null;

const takePhoto = () => {
  const videoElement = document.getElementById("camera-video");
  const canvasElement = document.getElementById("camera-canvas");
  if (videoElement && canvasElement) {
    const context = canvasElement.getContext("2d");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.translate(canvasElement.width, 0);
    context.scale(-1, 1);
    context.drawImage(
      videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    context.transform(1, 0, 0, 1, 0, 0);

    canvasElement.toBlob((blob) => {
      capturedPhoto = blob;
      stopCamera();
      renderPhotoPreview();
    }, "image/jpeg");
  } else {
    console.error("Video stream tidak tersedia untuk mengambil foto.");
  }
};

const renderPhotoPreview = () => {
  const photoPreviewContainer = document.querySelector(
    "#photo-preview-container"
  );
  if (!photoPreviewContainer) return;
  photoPreviewContainer.innerHTML = "";

  if (capturedPhoto) {
    photoPreviewContainer.style.display = "flex";
    photoPreviewContainer.style.flexDirection = "column";
    photoPreviewContainer.style.alignItems = "center";
    photoPreviewContainer.style.width = "100%";

    const previewP = document.createElement("p");
    previewP.textContent = "Pratinjau Gambar:";
    previewP.style.marginTop = "15px";
    previewP.style.textAlign = "center";
    photoPreviewContainer.appendChild(previewP);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(capturedPhoto);
    img.alt = "Pratinjau gambar yang akan diunggah";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    img.style.objectFit = "contain";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "10px";
    photoPreviewContainer.appendChild(img);

    const buttonDiv = document.createElement("div");
    const changeImageBtn = document.createElement("button");
    changeImageBtn.type = "button";
    changeImageBtn.className = "btn-info";
    changeImageBtn.textContent = "Ganti Gambar";
    changeImageBtn.addEventListener("click", () => {
      capturedPhoto = null;
      photoPreviewContainer.innerHTML = "";
      const startCameraBtnContainer =
        document.querySelector("#camera-controls");
      if (startCameraBtnContainer) {
        startCameraBtnContainer.innerHTML = `
            <button type="button" id="start-camera-btn" class="btn-secondary">
                Buka Kamera
            </button>
        `;
        document
          .getElementById("start-camera-btn")
          .addEventListener("click", startCamera);
      }
    });
    buttonDiv.appendChild(changeImageBtn);
    photoPreviewContainer.appendChild(buttonDiv);
  }
};

export const renderAddStoryPage = (parentElement, navigateTo) => {
  parentElement.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "form-card";
  parentElement.appendChild(formCard);

  const heading = document.createElement("h2");
  heading.textContent = "Tambah Cerita Baru";
  formCard.appendChild(heading);

  const form = document.createElement("form");
  formCard.appendChild(form);

  const descriptionGroup = document.createElement("div");
  descriptionGroup.className = "form-group";
  const descriptionLabel = document.createElement("label");
  descriptionLabel.htmlFor = "description";
  descriptionLabel.textContent = "Deskripsi Cerita";
  const descriptionTextarea = document.createElement("textarea");
  descriptionTextarea.id = "description";
  descriptionTextarea.placeholder = "Tulis cerita Anda di sini...";
  descriptionTextarea.required = true;
  descriptionTextarea.rows = "6";
  descriptionGroup.appendChild(descriptionLabel);
  descriptionGroup.appendChild(descriptionTextarea);
  form.appendChild(descriptionGroup);

  const photoFieldset = document.createElement("fieldset");
  photoFieldset.className = "form-group";
  const photoLegend = document.createElement("legend");
  photoLegend.textContent = "Foto Cerita";
  photoFieldset.appendChild(photoLegend);

  const cameraVideoContainer = document.createElement("div");
  cameraVideoContainer.id = "camera-video-container";
  photoFieldset.appendChild(cameraVideoContainer);

  const cameraControlsDiv = document.createElement("div");
  cameraControlsDiv.id = "camera-controls";
  const startCameraBtn = document.createElement("button");
  startCameraBtn.type = "button";
  startCameraBtn.className = "btn-secondary";
  startCameraBtn.textContent = "Buka Kamera";
  startCameraBtn.addEventListener("click", startCamera);
  cameraControlsDiv.appendChild(startCameraBtn);
  cameraVideoContainer.appendChild(cameraControlsDiv);

  const photoPreviewContainer = document.createElement("div");
  photoPreviewContainer.id = "photo-preview-container";
  photoFieldset.appendChild(photoPreviewContainer);

  const orParagraph = document.createElement("p");
  orParagraph.style.textAlign = "center";
  orParagraph.style.margin = "15px 0";
  orParagraph.textContent = "atau";
  photoFieldset.appendChild(orParagraph);

  const fileInputLabel = document.createElement("label");
  fileInputLabel.htmlFor = "photo-file-input";
  fileInputLabel.style.display = "none";
  fileInputLabel.textContent = "Unggah Foto dari Perangkat";
  photoFieldset.appendChild(fileInputLabel);
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "photo-file-input";
  fileInput.accept = "image/*";
  fileInput.style.display = "block";
  fileInput.addEventListener("change", (e) => {
    capturedPhoto = e.target.files[0];
    stopCamera();
    renderPhotoPreview();
  });
  photoFieldset.appendChild(fileInput);
  form.appendChild(photoFieldset);

  // === PENAMBAHAN BAGIAN LOKASI YANG HILANG ===
  const locationFieldset = document.createElement("fieldset");
  locationFieldset.className = "form-group";
  const locationLegend = document.createElement("legend");
  locationLegend.textContent = "Lokasi Cerita (Opsional)";
  locationFieldset.appendChild(locationLegend);

  const mapDiv = document.createElement("div");
  mapDiv.id = "add-story-map";
  mapDiv.style.height = "300px";
  mapDiv.style.width = "100%";
  mapDiv.style.marginBottom = "15px";
  mapDiv.style.borderRadius = "8px";
  mapDiv.style.zIndex = "0";
  locationFieldset.appendChild(mapDiv);

  const latLonGroup = document.createElement("div");
  latLonGroup.style.display = "flex";
  latLonGroup.style.gap = "10px";
  latLonGroup.style.marginBottom = "10px";

  const latGroup = document.createElement("div");
  latGroup.style.flex = "1";
  const latLabel = document.createElement("label");
  latLabel.htmlFor = "lat-input";
  latLabel.textContent = "Latitude";
  const latInput = document.createElement("input"); // Variabel didefinisikan di sini
  latInput.type = "text";
  latInput.id = "lat-input";
  latInput.placeholder = "Klik peta untuk mengisi";
  latGroup.appendChild(latLabel);
  latGroup.appendChild(latInput);
  latLonGroup.appendChild(latGroup);

  const lonGroup = document.createElement("div");
  lonGroup.style.flex = "1";
  const lonLabel = document.createElement("label");
  lonLabel.htmlFor = "lon-input";
  lonLabel.textContent = "Longitude";
  const lonInput = document.createElement("input"); // Variabel didefinisikan di sini
  lonInput.type = "text";
  lonInput.id = "lon-input";
  lonInput.placeholder = "Klik peta untuk mengisi";
  lonGroup.appendChild(lonLabel);
  lonGroup.appendChild(lonInput);
  latLonGroup.appendChild(lonGroup);

  locationFieldset.appendChild(latLonGroup);

  const clearLocationBtn = document.createElement("button"); // Variabel didefinisikan di sini
  clearLocationBtn.type = "button";
  clearLocationBtn.id = "clear-location-btn";
  clearLocationBtn.className = "btn-info";
  clearLocationBtn.textContent = "Hapus Lokasi";
  clearLocationBtn.style.width = "auto";
  locationFieldset.appendChild(clearLocationBtn);

  form.appendChild(locationFieldset);
  // === AKHIR DARI BAGIAN YANG DIPERBAIKI ===

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn-primary";
  submitButton.textContent = "Tambah Cerita";
  form.appendChild(submitButton);

  let errorMessageElement = null;
  let successMessageElement = null;
  let loadingIndicatorElement = null;

  const defaultMapCenter = [-6.2, 106.8];

  const initializeMap = () => {
    if (map && map.remove) {
      map.remove();
      map = null;
      marker = null;
    }
    map = window.L ? window.L.map("add-story-map").setView(defaultMapCenter, 10) : null;
    if (map) {
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        latInput.value = lat.toFixed(6);
        lonInput.value = lng.toFixed(6);

        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          marker = window.L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              `Lokasi yang Anda pilih: <br/>Lat: ${lat.toFixed(
                6
              )} <br/>Lon: ${lng.toFixed(6)}`
            )
            .openPopup();
        }
      });
    }
  };

  latInput.addEventListener("input", () => {
    const latVal = parseFloat(latInput.value);
    const lonVal = parseFloat(lonInput.value);
    if (!isNaN(latVal) && !isNaN(lonVal) && map) {
      if (marker) {
        marker.setLatLng([latVal, lonVal]);
      } else {
        marker = window.L.marker([latVal, lonVal]).addTo(map);
      }
      map.setView([latVal, lonVal], 10);
    }
  });

  lonInput.addEventListener("input", () => {
    const latVal = parseFloat(latInput.value);
    const lonVal = parseFloat(lonInput.value);
    if (!isNaN(latVal) && !isNaN(lonVal) && map) {
      if (marker) {
        marker.setLatLng([latVal, lonVal]);
      } else {
        marker = window.L.marker([latVal, lonVal]).addTo(map);
      }
      map.setView([latVal, lonVal], 10);
    }
  });

  clearLocationBtn.addEventListener("click", () => {
    latInput.value = "";
    lonInput.value = "";
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    if (map) {
      map.setView(defaultMapCenter, 10);
    }
  });

  setTimeout(() => {
    if (document.getElementById("add-story-map")) {
      initializeMap();
    }
  }, 0);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!loadingIndicatorElement) {
      loadingIndicatorElement = createLoadingIndicator();
      formCard.appendChild(loadingIndicatorElement);
    }
    submitButton.disabled = true;

    if (errorMessageElement) errorMessageElement.remove();
    if (successMessageElement) successMessageElement.remove();
    errorMessageElement = null;
    successMessageElement = null;

    const token = getToken();
    if (!token) {
      errorMessageElement = document.createElement("p");
      errorMessageElement.className = "error-message";
      errorMessageElement.textContent =
        "Anda harus login untuk menambah cerita.";
      formCard.appendChild(errorMessageElement);
      submitButton.disabled = false;
      loadingIndicatorElement.remove();
      loadingIndicatorElement = null;
      return;
    }

    if (!capturedPhoto) {
      errorMessageElement = document.createElement("p");
      errorMessageElement.className = "error-message";
      errorMessageElement.textContent = "Foto wajib diunggah.";
      formCard.appendChild(errorMessageElement);
      submitButton.disabled = false;
      loadingIndicatorElement.remove();
      loadingIndicatorElement = null;
      return;
    }

    const description = descriptionTextarea.value;
    const lat = latInput.value; // Ambil nilai latitude
    const lon = lonInput.value; // Ambil nilai longitude

    try {
      // PERBAIKAN: Kirim lat dan lon ke fungsi addStory
      await addStory(description, capturedPhoto, lat, lon, token);

      successMessageElement = document.createElement("p");
      successMessageElement.className = "success-message";
      successMessageElement.textContent = "Cerita berhasil ditambahkan!";
      formCard.appendChild(successMessageElement);

      descriptionTextarea.value = "";
      capturedPhoto = null;
      photoPreviewContainer.innerHTML = "";
      latInput.value = "";
      lonInput.value = "";
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      map.setView(defaultMapCenter, 10);

      setTimeout(() => navigateTo("/"), 2000);
    } catch (err) {
      errorMessageElement = document.createElement("p");
      errorMessageElement.className = "error-message";
      errorMessageElement.textContent = err.message;
      formCard.appendChild(errorMessageElement);
    } finally {
      if (loadingIndicatorElement) {
        loadingIndicatorElement.remove();
        loadingIndicatorElement = null;
      }
      submitButton.disabled = false;
    }
  });
};
