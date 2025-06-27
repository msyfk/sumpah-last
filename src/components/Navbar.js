export const renderNavbar = (
  parentElement,
  isLoggedIn,
  handleLogout,
  navigateTo
) => {
  let navbar = parentElement.querySelector(".navbar");
  if (navbar) {
    navbar.remove(); // Hapus navbar yang ada untuk render ulang
  }

  navbar = document.createElement("nav");
  navbar.className = "navbar"; //

  const brandDiv = document.createElement("div");
  brandDiv.className = "navbar-brand"; //
  const brandLink = document.createElement("a");
  brandLink.href = "#/";
  brandLink.textContent = "Dicoding Story App";
  brandLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });
  brandDiv.appendChild(brandLink);

  const navLinksUl = document.createElement("ul");
  navLinksUl.className = "navbar-links"; //

  const createNavLink = (text, path) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${path}`;
    a.textContent = text;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(path);
    });
    li.appendChild(a);
    return li;
  };

  navLinksUl.appendChild(createNavLink("Beranda", "/"));

  if (isLoggedIn) {
    navLinksUl.appendChild(createNavLink("Tambah Cerita", "/add")); //
    navLinksUl.appendChild(createNavLink("Pengaturan", "/settings")); //
    const logoutLi = document.createElement("li");
    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Logout";
    logoutButton.className = "navbar-button";
    logoutButton.addEventListener("click", () => handleLogout());
    logoutLi.appendChild(logoutButton);
    navLinksUl.appendChild(logoutLi);
  } else {
    navLinksUl.appendChild(createNavLink("Login", "/login")); //
    navLinksUl.appendChild(createNavLink("Register", "/register")); //
  }

  navbar.appendChild(brandDiv);
  navbar.appendChild(navLinksUl);

  // Sisipkan navbar di awal body atau elemen root
  parentElement.insertBefore(navbar, parentElement.firstChild);

  // Tambahkan skip link (pastikan tetap dapat diakses)
  let skipLink = document.querySelector(".skip-link"); //
  if (!skipLink) {
    skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link"; //
    skipLink.textContent = "Lewati ke Konten Utama";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};
