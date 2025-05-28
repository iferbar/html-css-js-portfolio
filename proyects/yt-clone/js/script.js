const container = document.querySelector("#container");
const menuButton = document.querySelector("#menu-button");

menuButton.addEventListener("click", () => {
    container.classList.toggle("active");
});

const comprobarAncho = () => {
    if (window.innerWidth <= 768) {
        container.classList.remove("active");
    } else {
        container.classList.add("active");
    }
};

comprobarAncho();

window.addEventListener("resize", () => {
    comprobarAncho();
});
