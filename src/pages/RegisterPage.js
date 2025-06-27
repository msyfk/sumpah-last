import { register } from "../services/authApi.js"; //
import { createLoadingIndicator } from "../components/LoadingIndicator.js"; //

export const renderRegisterPage = (parentElement, navigateTo) => {
  parentElement.innerHTML = ""; // Hapus konten yang ada

  const formCard = document.createElement("div");
  formCard.className = "form-card"; //
  parentElement.appendChild(formCard);

  const heading = document.createElement("h2");
  heading.textContent = "Register"; //
  formCard.appendChild(heading);

  const form = document.createElement("form");
  formCard.appendChild(form);

  const nameGroup = document.createElement("div");
  nameGroup.className = "form-group"; //
  const nameLabel = document.createElement("label");
  nameLabel.htmlFor = "name";
  nameLabel.textContent = "Nama"; //
  const nameInput = document.createElement("input");
  nameInput.type = "text"; //
  nameInput.id = "name";
  nameInput.placeholder = "Masukkan nama Anda"; //
  nameInput.required = true;
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  const emailGroup = document.createElement("div");
  emailGroup.className = "form-group"; //
  const emailLabel = document.createElement("label");
  emailLabel.htmlFor = "email";
  emailLabel.textContent = "Email"; //
  const emailInput = document.createElement("input");
  emailInput.type = "email"; //
  emailInput.id = "email";
  emailInput.placeholder = "Masukkan email Anda"; //
  emailInput.required = true;
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  form.appendChild(emailGroup);

  const passwordGroup = document.createElement("div");
  passwordGroup.className = "form-group"; //
  const passwordLabel = document.createElement("label");
  passwordLabel.htmlFor = "password";
  passwordLabel.textContent = "Password"; //
  const passwordInput = document.createElement("input");
  passwordInput.type = "password"; //
  passwordInput.id = "password";
  passwordInput.placeholder = "Masukkan password Anda"; //
  passwordInput.required = true;
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  form.appendChild(passwordGroup);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn-primary"; //
  submitButton.textContent = "Daftar"; //
  form.appendChild(submitButton);

  let errorMessageElement = null;
  let successMessageElement = null;
  let loadingIndicatorElement = null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!loadingIndicatorElement) {
      loadingIndicatorElement = createLoadingIndicator();
      formCard.appendChild(loadingIndicatorElement);
    }
    submitButton.disabled = true;

    if (errorMessageElement) {
      errorMessageElement.remove();
      errorMessageElement = null;
    }
    if (successMessageElement) {
      successMessageElement.remove();
      successMessageElement = null;
    }

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      await register(name, email, password); //
      successMessageElement = document.createElement("p");
      successMessageElement.className = "success-message"; //
      successMessageElement.textContent = "Registrasi berhasil! Silakan login."; //
      formCard.appendChild(successMessageElement);

      setTimeout(() => {
        navigateTo("/login");
      }, 2000);
    } catch (err) {
      errorMessageElement = document.createElement("p");
      errorMessageElement.className = "error-message"; //
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

  const loginParagraph = document.createElement("p");
  loginParagraph.style.textAlign = "center";
  loginParagraph.style.marginTop = "20px";
  loginParagraph.innerHTML =
    'Sudah punya akun? <a href="#/login">Login di sini</a>'; //
  loginParagraph.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/login");
  });
  formCard.appendChild(loginParagraph);
};