


export  default class modal{

    constructor(){
        this.elemeto=document.querySelector(".content");
    }
    
  Abrir(texto){
    this.elemeto.innerHTML+=` <div class="modal"> 
    <div class="modal-content">
        <p class="p_modal">Deseja ${texto} ?</p>
        <div class="buttons">
            <button class="sim">Sim</button>
            <button class="nao">Não</button>
        </div>
    </div>
    </div>
    `
  }
  fechar(){
    let fechar = document.querySelector('.modal'); 
    fechar.remove()
  }

}