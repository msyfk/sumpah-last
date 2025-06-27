import { createLoadingIndicator } from "../components/LoadingIndicator.js";
import { AuthModel } from "../models/AuthModel.js";
import { LoginPresenter } from "../presenters/LoginPresenter.js";

export const renderLoginPage = (parentElement, onLoginSuccess, navigateTo) => {
  parentElement.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "form-card";
  parentElement.appendChild(formCard);

  const heading = document.createElement("h2");
  heading.textContent = "Login";
  formCard.appendChild(heading);

  const form = document.createElement("form");
  formCard.appendChild(form);

  const emailGroup = document.createElement("div");
  emailGroup.className = "form-group";
  const emailLabel = document.createElement("label");
  emailLabel.htmlFor = "email";
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.required = true;
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  form.appendChild(emailGroup);

  const passwordGroup = document.createElement("div");
  passwordGroup.className = "form-group";
  const passwordLabel = document.createElement("label");
  passwordLabel.htmlFor = "password";
  passwordLabel.textContent = "Password";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.required = true;
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  form.appendChild(passwordGroup);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn-primary";
  submitButton.textContent = "Login";
  form.appendChild(submitButton);

  let errorMessageElement = null;
  let loadingIndicatorElement = null;

  // Create view interface for presenter
  const loginView = {
    showError: (message) => {
      errorMessageElement = document.createElement("p");
      errorMessageElement.className = "error-message";
      errorMessageElement.textContent = message;
      formCard.appendChild(errorMessageElement);
    },
    showLoading: () => {
      if (!loadingIndicatorElement) {
        loadingIndicatorElement = createLoadingIndicator();
        formCard.appendChild(loadingIndicatorElement);
      }
      submitButton.disabled = true;
    },
    hideLoading: () => {
      if (loadingIndicatorElement) {
        loadingIndicatorElement.remove();
        loadingIndicatorElement = null;
      }
      submitButton.disabled = false;
    },
    clearError: () => {
      if (errorMessageElement) {
        errorMessageElement.remove();
        errorMessageElement = null;
      }
    }
  };

  // Create model and presenter
  const authModel = new AuthModel();
  const loginPresenter = new LoginPresenter(loginView, authModel);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    loginView.clearError();
    loginView.showLoading();

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const success = await loginPresenter.login(email, password);
      if (success) {
        console.log("LoginPage: Token set and onLoginSuccess will be called.");
        onLoginSuccess(true);
        navigateTo("/");
      }
    } finally {
      loginView.hideLoading();
    }
  });

  const registerParagraph = document.createElement("p");
  registerParagraph.innerHTML = 'Belum punya akun? <a href="#/register">Daftar di sini</a>';
  registerParagraph.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/register");
  });
  formCard.appendChild(registerParagraph);
};
