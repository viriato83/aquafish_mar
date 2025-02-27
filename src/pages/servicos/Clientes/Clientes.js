import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import ClineteRepository from "./ClienteRepository";
import ClientesView from "./ClientesView";
import Clientes from "./Cclientes";
import ClienteRepository from "./ClienteRepository";
import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";



export default function RegistarClientes(){
  
    let msg;
    let repositorio;
    const [inputs,setInputs] =useState({"nome":"","localizacao":"","telefone":""})
    const {id}= useParams()
     useEffect(()=>{
      msg= new mensagem();
      repositorio= new ClienteRepository();
     })

    const criaCliente=()=>{
      return new Clientes(inputs.nome,inputs.localizacao,inputs.telefone)
   }
      const cadastrar=()=>{
    
        if(id){
          repositorio.editar(id,criaCliente())
        }else{
          if(!inputs.nome ||!inputs.localizacao){
            msg.Erro("Prencha correctamente todos campos")
        
          }else{
          repositorio.cadastrar(criaCliente());
          }
        }
      
         
     }
  
    return(
        <>
        <Header></Header>
         
        <Conteinner>
          <Slider></Slider>
          <Content>
            
              <div className="Cadastro" >
                <h1>Registo  de Clientes</h1>
                <br/>
                <div className="form">
                    <label >ID:</label>
                    <input type="number"  name="" value={id? id:0} disabled className="id" 
                  
                    />
                    <br/>
                    <label >Nome:</label>
                    <input type="text" required className="nome" id="cad" placeholder="Nome do cliente"
                      onChange={(e) =>{
                        setInputs({...inputs,nome:e.target.value});}
                      }
                    />
                    <br/>
                    <label >Localização: </label>
                   <input type="text"  required className="localizacao" id="cad" placeholder="Localização do cliente"
                      onChange={(e) =>{
                        setInputs({...inputs,localizacao:e.target.value});}
                      }
                   />
                   <br/>
                    <label >Telefone: <span className="bg-primary">--Opcional--</span> </label>
                   <input type="tel"  className="telefone" id="cad" placeholder="Telefone do cliente"
                      onChange={(e) =>{
                        setInputs({...inputs,telefone:e.target.value});}
                      }
                   />
                    </div>
                  <button onClick={cadastrar} className="cadastrar">Cadastrar</button>
            </div>
          </Content>
        </Conteinner>
        <Footer></Footer>
      </>
    )
}
