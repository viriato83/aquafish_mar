
import Header from "../../../components/Header";
import Conteinner from "../../../components/Conteinner";
import Slider from "../../../components/Slider";
import Content from "../../../components/Content";
import modal from "../../../components/modal";
import mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import { repositorioMortalidade } from "./mortalidadeRepository";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Importa a biblioteca xlsx

export default function MortalidadeView() {
  
  const [loading, setLoading] = useState(false); // Estado para exibir o loading
  const repositorio = new repositorioMortalidade();
  
  const [modelo, setModelo] = useState([]);
  const [total, setTotal] = useState(0);
  const [id, setId] = useState(""); // Estado para o ID digitado
  const permissao=sessionStorage.getItem("cargo")
  const navigate = useNavigate();
  let     moda= new modal();
  let     msg= new mensagem();
  console.log(modelo)
  useEffect(()=>{
     
    async function carregarDados() {
      setLoading(true); // Ativa o Loading
      try {
        const dadosModelo = await repositorio.leitura();
        const dadosTotal = await repositorio.total();
      
        setModelo(dadosModelo);
        setTotal(dadosTotal);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      }   finally {
        setLoading(false); // Desativa o Loading
      }
    }
    carregarDados();

  }, []);

  // Função para exportar dados para Excel
  const exportarExcel = () => {
    // Cria um arquivo de planilha
    const ws = XLSX.utils.json_to_sheet(modelo);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mortalidade");
    
    // Gera o arquivo Excel e inicia o download
    XLSX.writeFile(wb, "relatorio_mortalidade.xlsx");
  };

  return (
    <>
    {loading&& <Loading></Loading>}
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Data</th>
                  <th>Stock</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {modelo.map((elemento, i) => (
                  <tr key={i}>
                    <td>{elemento.id}</td>
                    <td>{elemento.descricao}</td>
                    <td>{elemento.quantidade} </td>
                    <td>{elemento.data}</td>
                    <td>{elemento.stocks.tipo}</td>
                    <td>{elemento.total}</td> {/* Mostra o total no final */}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Total</td>
                  <td>{total}</td>
                </tr>
              </tfoot>
            </table>
            <div className="crud">
              <button
                className="editar"
                onClick={() => {
                    if (id) {
                        moda.Abrir("deseja editar o "+id)
                         document.querySelector(".sim").addEventListener("click",()=>{ 
                            navigate(`/registar-mortalidade/${id}`)
                          })
                         document.querySelector(".nao").addEventListener("click",()=>{ 
                           moda.fechar()
                          })
                      } else {
                        msg.Erro("Por favor, digite um ID válido!");
                      }
                  }}
              >
                Editar
              </button>
              <input
                type="number"
                className="crudid"
                placeholder="Digite o ID"
                value={id}
                onChange={(e) => setId(e.target.value)} // Atualiza o estado com o valor digitado
              />
              <button
                onClick={() => {
                  if (id) {
                      moda.Abrir("deseja apagar o " + id)
                       document.querySelector(".sim").addEventListener("click", () => {
                        repositorio.deletar(id)
                        moda.fechar()
                      })
                       document.querySelector(".nao").addEventListener("click", () => {
                         moda.fechar()
                      })
                  } else {
                    msg.Erro("Por favor, digite um ID válido!");
                  }
                }}
                className="apagar">Apagar
              </button>


            </div>
              {/* Botão para exportar para Excel */}
              {permissao==="admin" &&(  <button
                className="btn-export"
                onClick={exportarExcel}
              >
                Exportar para Excel
              </button>)}
          </div>
        </Content>
      </Conteinner>
      <Footer></Footer>
    </>
  );
}
