export default class Captura{

    constructor(quantidade,quantidade_estoque,tipo,usuarios,data,origem,mercadorias_idmercadorias) {
        this.quantidade = quantidade;
        this.quantidade_estoque = quantidade_estoque;
        this.data= data;
        this.origem=origem;
         this.tipo=tipo;
        this.usuario = {
            idusuarios:usuarios
        };
        this.mercadoria= [
            {
                idmercadoria:mercadorias_idmercadorias
            }
        ]
        
    }
}