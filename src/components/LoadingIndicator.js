export const createLoadingIndicator = () => {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-indicator"; //
  loadingDiv.style.textAlign = "center";
  loadingDiv.style.padding = "20px";

  const paragraph = document.createElement("p");
  paragraph.textContent = "Memuat...";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.className = "spinner"; //

  loadingDiv.appendChild(paragraph);
  loadingDiv.appendChild(spinnerDiv);

  return loadingDiv;
};
