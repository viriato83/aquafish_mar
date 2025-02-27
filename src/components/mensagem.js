export default class Mensagem {
    constructor() {
        this.msg = document.querySelector(".mensagem");
      
    }

    setTexto(texto) {
        this.msg.innerHTML = texto;
    }

    sucesso(texto) {
        if (!this.msg) return;

        this.msg.className = "mensagem alert alert-success alert-dismissible";
        this.msg.innerHTML = `
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        this.msg.style.display = "block";

        setTimeout(() => {
            this.msg.style.display = "none";
        }, 3000);
    }

    Erro(texto) {
        if (!this.msg) return;

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        this.msg.className = "mensagem alert alert-danger alert-dismissible";
        this.msg.innerHTML = `
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        this.msg.style.display = "block";
        this.msg.style.backgroundColor="red";
        setTimeout(() => {
            this.msg.style.display = "none";
        }, 3000);
    }
}
