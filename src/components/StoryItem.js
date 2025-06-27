export const createStoryItem = (story, navigateTo) => {
  const article = document.createElement("article");
  article.className = "story-item"; //
  article.setAttribute("aria-labelledby", `story-title-${story.id}`);

  const link = document.createElement("a");
  link.href = `#/stories/${story.id}`;
  link.addEventListener("click", (e) => {
    e.preventDefault(); //
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigateTo(`/stories/${story.id}`); //
      });
    } else {
      navigateTo(`/stories/${story.id}`); //
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
    link.appendChild(img);
  }

  const contentDiv = document.createElement("div");
  contentDiv.className = "content"; //

  const title = document.createElement("h3");
  title.id = `story-title-${story.id}`;
  title.textContent = story.name;
  contentDiv.appendChild(title);

  const description = document.createElement("p");
  description.textContent = `${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}`;
  contentDiv.appendChild(description);

  const meta = document.createElement("p");
  meta.className = "story-meta"; //
  meta.style.marginTop = "auto";
  meta.style.paddingTop = "10px";
  meta.style.borderTop = "none";
  meta.textContent = `Dibuat pada: ${formatDate(story.createdAt)}`;
  contentDiv.appendChild(meta);

  link.appendChild(contentDiv);
  article.appendChild(link);

  return article;
};

// Fungsi pembantu untuk format tanggal (dapat dipindahkan ke file utilitas)
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
