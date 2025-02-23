export default class Modal {
  constructor() {
    this.elemento = document.querySelector(".content");
  }

  Abrir(texto) {
    // Remover qualquer modal existente antes de criar um novo
    this.fechar();

    // Criar o modal dinamicamente
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <p class="p_modal">Deseja ${texto}?</p>
        <div class="buttons">
          <button class="sim">Sim</button>
          <button class="nao">Não</button>
        </div>
      </div>
    `;

    // Adicionar o modal à área de conteúdo
    this.elemento.appendChild(modal);

    // Adicionar evento para fechar o modal quando clicar em "Não"
    modal.querySelector(".nao").addEventListener("click", () => this.fechar());
  }

  fechar() {
    const modalExistente = document.querySelector(".modal");
    if (modalExistente) {
      modalExistente.remove();
    }
  }
}
