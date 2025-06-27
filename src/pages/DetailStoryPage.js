import { getStoryDetail } from "../services/storyApi.js";
import { createLoadingIndicator } from "../components/LoadingIndicator.js";
import { indexedDBService } from "../services/indexedDBService.js";
import { showConnectionToast } from "../components/OfflineIndicator.js";

// ... (Fungsi formatDate tetap sama)
const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
};

export const renderDetailStoryPage = async (parentElement, storyId) => {
  parentElement.innerHTML = "";

  const loadingIndicator = createLoadingIndicator();
  parentElement.appendChild(loadingIndicator);

  try {
    const story = await getStoryDetail(storyId);
    loadingIndicator.remove();

    if (!story) {
      // ... (handling cerita tidak ditemukan tetap sama)
      return;
    }

    const article = document.createElement("article");
    article.className = "detail-story-card";
    article.setAttribute("aria-labelledby", "story-detail-heading");
    parentElement.appendChild(article);

    const headingContainer = document.createElement("div");
    headingContainer.className = "detail-heading-container";

    const heading = document.createElement("h2");
    heading.id = "story-detail-heading";
    heading.textContent = story.name;
    headingContainer.appendChild(heading);

    // === PENAMBAHAN TOMBOL SIMPAN DI DETAIL ===
    const bookmarkBtn = document.createElement("button");
    bookmarkBtn.className = "bookmark-btn btn-icon large";
    bookmarkBtn.setAttribute("aria-label", "Simpan cerita");

    const checkBookmarkStatus = async () => {
      const isSaved = await indexedDBService.getStory(story.id);
      if (isSaved) {
        bookmarkBtn.innerHTML = "🔖";
        bookmarkBtn.classList.add("saved");
        bookmarkBtn.title = "Hapus dari simpanan";
      } else {
        bookmarkBtn.innerHTML = "🏷️";
        bookmarkBtn.classList.remove("saved");
        bookmarkBtn.title = "Simpan cerita";
      }
    };
    checkBookmarkStatus();

    bookmarkBtn.addEventListener("click", async () => {
      const isSaved = await indexedDBService.getStory(story.id);
      if (isSaved) {
        await indexedDBService.deleteStory(story.id);
        showConnectionToast("Cerita dihapus dari simpanan", "info");
      } else {
        await indexedDBService.storeStory(story);
        showConnectionToast("Cerita berhasil disimpan", "success");
      }
      checkBookmarkStatus();
    });

    headingContainer.appendChild(bookmarkBtn);
    article.appendChild(headingContainer);
    // === AKHIR PENAMBAHAN ===

    const img = document.createElement("img");
    img.src = story.photoUrl;
    img.alt = `Foto cerita berjudul ${story.name}`;
    article.appendChild(img);

    const description = document.createElement("p");
    description.textContent = story.description;
    article.appendChild(description);

    // ... (sisa kode untuk meta dan lokasi tetap sama)
    const metaDiv = document.createElement("div");
    metaDiv.className = "story-meta";
    article.appendChild(metaDiv);

    const createdAtP = document.createElement("p");
    createdAtP.textContent = `Dibuat: ${formatDate(story.createdAt)}`;
    metaDiv.appendChild(createdAtP);

    if (story.lat && story.lon) {
      const locationP = document.createElement("p");
      locationP.className = "location";
      locationP.textContent = `Lokasi: ${story.lat}, ${story.lon}`;
      metaDiv.appendChild(locationP);
    }
  } catch (err) {
    loadingIndicator.remove();
    const errorMessage = document.createElement("p");
    errorMessage.className = "error-message";
    errorMessage.textContent = `Error: ${err.message}`;
    parentElement.appendChild(errorMessage);
  }
};
