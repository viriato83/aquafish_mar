import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";

import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import { repositorioMortalidade } from "./mortalidadeRepository";
import Mortalidade from "./Mortalidade";



export default function RegistarMortalidade(){
  
    let msg;
    let repositorio;
    const [inputs,setInputs] =useState({"descricao":"","quantidade":"","data":""})
    const {id}= useParams()
     useEffect(()=>{
      msg= new mensagem();
      repositorio= new repositorioMortalidade()
      console.log(criaMortalidade())
     })

    const criaMortalidade=()=>{
      return new Mortalidade(inputs.descricao,inputs.quantidade,inputs.data)
   }
      const cadastrar=()=>{
    
        if(id){
          repositorio.editar(id,criaMortalidade())
        }else{
          if(!inputs.descricao || !inputs.quantidade || !inputs.data){
            msg.Erro("Prencha correctamente todos campos")
        
          }else{
          repositorio.cadastrar(criaMortalidade());
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
                <h1>Registo  de Mortalidade</h1>
                <br/>
                <div className="form">
                    <label >ID:</label>
                    <input type="number"  name="" value={id? id:0} disabled className="id" 
                  
                    />
                    <br/>
                    <label >Descricao:</label>
                    <input type="text" required className="descricao" id="cad" placeholder="Descrição"
                      onChange={(e) =>{
                        setInputs({...inputs,descricao:e.target.value});}
                      }
                    />
                    <br/>
                    <label >Quanidade: </label>
                   <input type="number"  required className="quantidade" id="cad" placeholder="Quantidade "
                      onChange={(e) =>{
                        setInputs({...inputs,quantidade:e.target.value});}
                      }
                   />
                   <br/>
                    <label >Data: </label>
                   <input type="date"  className="data" id="cad" placeholder="Data"
                      onChange={(e) =>{
                        setInputs({...inputs,data:e.target.value});}
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
