import { useEffect, useState, useRef } from "react";
import Header from "../../../components/Header";
import Conteinner from "../../../components/Conteinner";
import Slider from "../../../components/Slider";
import Content from "../../../components/Content";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/modal";
import Mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import RepositorioMercadoria from "./Repositorio";
import Loading from "../../../components/loading";
import * as XLSX from "xlsx";  // Import the xlsx library

export default function MercadoriaView() {
  const repositorio = new RepositorioMercadoria();
  const [modelo, setModelo] = useState([]);
  const [total, setTotal] = useState(0);
  const [id, setId] = useState(""); // Estado para o ID digitado
  const navigate = useNavigate();
const permissao= sessionStorage.getItem("cargo");
  const [loading, setLoading] = useState(false); // Estado para exibir o loading
  const msg = useRef(null); // UseRef para manter uma instância estável
  const moda = useRef(null);

  useEffect(() => {
    // Inicializa as instâncias uma vez
    msg.current = new Mensagem();
    moda.current = new Modal();

    async function carregarDados() {
      setLoading(true); // Exibir loading
      try {
        const dadosModelo = await repositorio.leitura();
        const dadosTotal = await repositorio.total();
        setModelo(dadosModelo);
        setTotal(dadosTotal);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      } finally {
        setLoading(false); // Esconder loading
      }
    }
    carregarDados();
  }, []);

  // Função para exportar os dados para Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(modelo);  // Converte os dados da tabela em uma planilha
    const wb = XLSX.utils.book_new();  // Cria um novo arquivo de Excel
    XLSX.utils.book_append_sheet(wb, ws, "Mercadorias");  // Adiciona a planilha ao arquivo
    XLSX.writeFile(wb, "mercadorias.xlsx");  // Gera o arquivo Excel e permite o download
  };

  return (
    <>
      {loading && <Loading />}
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Data de Entrada</th>
                  <th>Valor unitário</th>
                  <th>Valor total</th>
                  <th>Q Saidas</th>
                  <th>Data de Saída</th>
                </tr>
              </thead>
              <tbody>
                {modelo.map((elemento, i) => (
                  <tr key={i}>
                    <td>{elemento.idmercadoria}</td>
                    <td>{elemento.nome}</td>
                    <td>{elemento.tipo}</td>
                    <td>{elemento.quantidade}</td>
                    <td>{elemento.data_entrada}</td>
                    <td>{elemento.valor_un} Mt</td>
                    <td>
                      {elemento.valor_total.toLocaleString("pt-PT", {
                        minimumFractionDigits: 3,
                      })}{" "}
                      Mt
                    </td>
                    <td>{elemento.q_saidas}</td>
                    <td>{elemento.data_saida}</td>
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
                    moda.current.Abrir("Deseja editar o " + id);
                    document.querySelector(".sim").addEventListener("click", () => {
                      navigate(`/registar-mercadoria/${id}`);
                    });
                    document.querySelector(".nao").addEventListener("click", () => {
                      moda.current.fechar();
                    });
                  } else {
                    msg.current.Erro("Por favor, digite um ID válido!");
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
                    moda.current.Abrir("Deseja apagar o " + id);
                    document.querySelector(".sim").addEventListener("click", () => {
                      repositorio.deletar(id);
                      moda.current.fechar();
                    });
                    document.querySelector(".nao").addEventListener("click", () => {
                      moda.current.fechar();
                    });
                  } else {
                    msg.current.Erro("Por favor, digite um ID válido!");
                  }
                }}
                className="apagar"
              >
                Apagar
              </button>
              {/* Botão para exportar para Excel */}
            </div>
            {permissao==="admin" &&(  <button
                onClick={exportToExcel}
                className="btn-export"
              >
                Exportar para Excel
              </button>)}
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
