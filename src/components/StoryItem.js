import { indexedDBService } from "../services/indexedDBService.js";
import { showConnectionToast } from "./OfflineIndicator.js";

export const createStoryItem = (story, navigateTo) => {
  const article = document.createElement("article");
  article.className = "story-item";
  article.setAttribute("aria-labelledby", `story-title-${story.id}`);

  // Wrapper untuk gambar dan konten agar bisa diklik
  const linkWrapper = document.createElement("div");
  linkWrapper.className = "story-link-wrapper";
  linkWrapper.addEventListener("click", (e) => {
    // Pastikan klik pada tombol bookmark tidak trigger navigasi
    if (e.target.closest(".bookmark-btn")) return;

    e.preventDefault();
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigateTo(`/stories/${story.id}`);
      });
    } else {
      navigateTo(`/stories/${story.id}`);
    }
  });

  if (story.photoUrl) {
    const img = document.createElement("img");
    img.src = story.photoUrl;
    img.alt = `Foto cerita: ${
      story.description
        ? story.description.substring(0, 50) + "..."
        : "Gambar cerita"
    }`;
    img.loading = "lazy";
    linkWrapper.appendChild(img);
  }

  const contentDiv = document.createElement("div");
  contentDiv.className = "content";

  const title = document.createElement("h3");
  title.id = `story-title-${story.id}`;
  title.textContent = story.name;
  contentDiv.appendChild(title);

  const description = document.createElement("p");
  description.textContent = `${story.description.substring(0, 150)}${
    story.description.length > 150 ? "..." : ""
  }`;
  contentDiv.appendChild(description);

  const metaFlex = document.createElement("div");
  metaFlex.className = "story-meta-flex";

  const meta = document.createElement("p");
  meta.className = "story-meta";
  meta.textContent = `Dibuat pada: ${formatDate(story.createdAt)}`;
  metaFlex.appendChild(meta);

  // === PENAMBAHAN TOMBOL SIMPAN ===
  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.className = "bookmark-btn btn-icon";
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

  bookmarkBtn.addEventListener("click", async (e) => {
    e.stopPropagation(); // Mencegah navigasi saat tombol diklik
    const isSaved = await indexedDBService.getStory(story.id);
    if (isSaved) {
      await indexedDBService.deleteStory(story.id);
      showConnectionToast("Cerita dihapus dari simpanan", "info");
    } else {
      await indexedDBService.storeStory(story);
      showConnectionToast("Cerita berhasil disimpan", "success");
    }
    checkBookmarkStatus(); // Update status tombol
  });
  metaFlex.appendChild(bookmarkBtn);
  // === AKHIR PENAMBAHAN ===

  contentDiv.appendChild(metaFlex);
  linkWrapper.appendChild(contentDiv);
  article.appendChild(linkWrapper);

  return article;
};

// Fungsi pembantu untuk format tanggal (diasumsikan sudah ada)
const formatDate = (isoString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(isoString).toLocaleDateString("id-ID", options);
};
