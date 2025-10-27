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
import * as XLSX from "xlsx";
import { repositorioVenda } from "../vendas/vendasRepositorio";
import repositorioStock from "../Stock.js/Repositorio";

export default function MercadoriaView() {
  const repositorio = new RepositorioMercadoria();
  const repositoriovenda = new repositorioVenda();
  const [modelo, setModelo] = useState([]);
  const [total, setTotal] = useState(0);
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const permissao = sessionStorage.getItem("cargo");
  const [loading, setLoading] = useState(false);
  const msg = useRef(null);
  const moda = useRef(null);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [stockSelecionado, setLoteS] = useState(0);
  const [modelo2, setModelo2] = useState([]);
  const [quantidadeEst, setQuantidadeEst] = useState(0);
  const repoStco = new repositorioStock();

  // Novos estados para filtro de data
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    msg.current = new Mensagem();
    moda.current = new Modal();

    async function carregarDados() {
      setLoading(true);
      try {
        const repoStck = await repoStco.leitura();
        const dadosModelo = await repositorio.leitura();

        let quantidadeTotal = 0;
        let quantidadeEst = 0;

        dadosModelo.forEach((e) => {
          if (!stockSelecionado || stockSelecionado === e.stock.idstock) {
            quantidadeEst += e.quantidade_est;
            quantidadeTotal += e.quantidade;
          }
        });

        setQuantidadeEst(quantidadeEst);
        setModelo(dadosModelo);
        setTotal(quantidadeTotal);
        setModelo2(repoStck);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [stockSelecionado]);

  // Função para exportar dados para Excel
  const exportToExcel = () => {
    const dados = modelo.map((elemento) => ({
      ID: elemento.idmercadoria,
      Nome: elemento.nome,
      Tipo: elemento.tipo,
      Quantidade: elemento.quantidade,
      "Data de Entrada": elemento.data_entrada,
      "Valor Unitário": `${elemento.valor_un} Mt`,
      "Valor Total":
        elemento.valor_total.toLocaleString("pt-PT", { minimumFractionDigits: 3 }) + " Mt",
      "Data de Saída": elemento.data_saida,
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mercadorias");
    XLSX.writeFile(wb, "mercadorias.xlsx");
  };

  // 🔍 Função para aplicar filtros de data
  const filtrarPorData = (lista) => {
    return lista.filter((e) => {
      const dataEntrada = new Date(e.data_entrada);
      const dentroDoIntervalo =
        (!dataInicio || dataEntrada >= new Date(dataInicio)) &&
        (!dataFim || dataEntrada <= new Date(dataFim));
      const mesmoStock = !stockSelecionado || e.stock.idstock === stockSelecionado;
      return dentroDoIntervalo && mesmoStock;
    });
  };

  const mercadoriasFiltradas = filtrarPorData(modelo);

  return (
    <>
      {loading && <Loading />}
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <h2>Mercadorias</h2>

          {/* 🔽 Filtros */}
          <div className="filtros">
            <label>Filtrar por Gaiola:</label>
            <select value={stockSelecionado} onChange={(e) => setLoteS(Number(e.target.value))}>
              <option value={0}>Todas as Gaiolas</option>
              {modelo2.map((stock) => (
                <option key={stock.idstock} value={stock.idstock}>
                  Gaiola {stock.tipo}
                </option>
              ))}
            </select>

            <label>Data Início:</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />

            <label>Data Fim:</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>

          {/* 🔽 Tabela */}
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Quantidade Disponível (kg)</th>
                  <th>Data de Entrada</th>
                  <th>Valor unitário</th>
                  <th>Valor total</th>
                  <th>Data de Saída</th>
                  <th>Gaiola</th>
                  {permissao === "admin" && <th>Usuário</th>}
                </tr>
              </thead>
              <tbody>
                {mercadoriasFiltradas.map((elemento, i) => (
                  <tr key={i}>
                    <td>{elemento.idmercadoria}</td>
                    <td>{elemento.nome}</td>
                    <td>{elemento.tipo}</td>
                    <td>{elemento.quantidade_est}</td>
                    <td>{elemento.quantidade}</td>
                    <td>{elemento.data_entrada}</td>
                    <td>{elemento.valor_un} Mt</td>
                    <td>
                      {elemento.valor_total.toLocaleString("pt-PT", {
                        minimumFractionDigits: 3,
                      })}{" "}
                      Mt
                    </td>
                    <td>{elemento.data_saida}</td>
                    <td>
                      {elemento.stock.idstock} : {elemento.stock.tipo}
                    </td>
                    {permissao === "admin" && (
                      <td>{elemento.usuario ? elemento.usuario.login : "-"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Total</td>
                  <td>{quantidadeEst.toFixed(2)} kg</td>
                  <td>{total.toFixed(2)} kg Disponíveis</td>
                </tr>
              </tfoot>
            </table>

            {/* Botões CRUD */}
            {(permissao === "admin" || permissao === "gerente") && (
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
                  onChange={(e) => setId(e.target.value)}
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
              </div>
            )}

            {permissao === "admin" && (
              <button onClick={exportToExcel} className="btn-export">
                Exportar para Excel
              </button>
            )}
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
