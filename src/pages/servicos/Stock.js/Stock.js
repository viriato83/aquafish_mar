export default class stock{

    constructor(quantidade,tipo,usuarios,data,mercadorias_idmercadorias) {
        this.quantidade = quantidade;
        this.data= data;
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