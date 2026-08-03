const links = [...document.querySelectorAll("nav a")];
const form = document.querySelector("#movementForm");
const syncButton = document.querySelector("#syncButton");

links.forEach((link) => {
  link.addEventListener("click", () => {
    links.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

syncButton?.addEventListener("click", () => {
  syncButton.textContent = "Vista sincronizada";
  setTimeout(() => {
    syncButton.textContent = "Sincronizar vista";
  }, 1600);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const [type, concept, amount] = [...form.elements];
  const list = document.querySelector(".activity");
  const item = document.createElement("li");

  const title = document.createElement("b");
  title.textContent = concept.value || "Movimiento nuevo";

  const source = document.createElement("span");
  source.textContent = `Vista GitHub Pages - ${type.value}`;

  const value = document.createElement("strong");
  value.textContent = `$${Number(amount.value || 0).toLocaleString("es-EC")}`;

  item.append(title, source, value);
  list?.prepend(item);
  form.reset();
});
