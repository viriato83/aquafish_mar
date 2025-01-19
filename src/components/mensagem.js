export default class mensagem{

    constructor() {
        this.mensagem = document.querySelector('.mensagem');
        
    }

    setTexto(texto){
        this.mensagem.innerHTML = texto;
    }
    sucesso(texto){
        window.scrollTo({
            top: 0,         // Voltar ao topo
            behavior: 'smooth' // Suavizar o movimento
          });
        this.setTexto(texto)
        this.mensagem.style.display = 'block';
        this.mensagem.style.backgroundColor ="green" ;
        setTimeout(()=>this.mensagem.style.display = "none",3000)
    }
    
    Erro(texto){
        window.scrollTo({
            top: 0,         // Voltar ao topo
            behavior: 'smooth' // Suavizar o movimento
          });
        this.setTexto(texto)
        this.mensagem.style.display = 'block';
        this.mensagem.style.backgroundColor ="red" ;
        setTimeout(()=>this.mensagem.style.display = "none",3000)
    }


}