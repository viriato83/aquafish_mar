import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Conteinner from "../../../components/Conteinner";
import Slider from "../../../components/Slider";
import Content from "../../../components/Content";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/modal";
import mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import repositorioStock from "./Repositorio";
import Loading from "../../../components/loading";
import * as XLSX from "xlsx";

export default function StockView() {
  const repositorio = new repositorioStock();
  const [modelo, setModelo] = useState([]);
  const [totalQuantidade, setTotalQuantidade] = useState(0);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [pesquisa, setPesquisa] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const permissao = sessionStorage.getItem("cargo");
  const [loading, setLoading] = useState(false);
  let moda = new Modal();
  let msg = new mensagem();

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const dadosModelo = await repositorio.leitura();

        // Cálculo dos totais
        const somaQuantidade = dadosModelo.reduce(
          (soma, item) => soma + Number(item.quantidade || 0),
          0
        );

        const somaQuantidadeEstoque = dadosModelo.reduce(
          (soma, item) => soma + Number(item.quantidade_estoque || 0),
          0
        );

        setModelo(dadosModelo);
        setTotalQuantidade(somaQuantidade);
        setTotalEstoque(somaQuantidadeEstoque);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  
  // Filtrar por nome da mercadoria
  const listaFiltrada = modelo.filter((item) => {
    const passarFiltroTipo =
      pesquisa.trim() === ""
        ? true
        : item.tipo.toLowerCase().includes(pesquisa.toLowerCase());
  
    const dataItem = new Date(item.data);
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;
  
    const passarFiltroData =
      (!inicio || dataItem >= inicio) && (!fim || dataItem <= fim);
  
    return passarFiltroTipo && passarFiltroData;
  });
  

  // Exportar Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      modelo.map((item) => ({
        ID: item.idstock,
        Quantidade_disp: item.quantidade,
        Quantidade: item.quantidade_estoque,
        Tipo: item.tipo,
        Mercadorias: item.mercadorias.map((merc) => `${merc.nome}`).join(", "),
        Data:item.data
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "StockData.xlsx");
  };

  return (
    <>
      {loading && <Loading />}
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <h2>Requisições</h2>
          <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
  <input
    type="date"
    value={dataInicio}
    onChange={(e) => setDataInicio(e.target.value)}
    className="data-input"
  />

  <input
    type="date"
    value={dataFim}
    onChange={(e) => setDataFim(e.target.value)}
    className="data-input"
  />

  <button
    onClick={() => {
      setDataInicio("");
      setDataFim("");
      setPesquisa("");
    }}
    className="btn border-black border-2"
  >
    Limpar Filtros
  </button>
</div>

          {/* CAMPO DE PESQUISA */}
          <input
            type="text"
            placeholder="Pesquisar por nome da mercadoria..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="pesquisa-input"
          />

          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Quantidade_stock</th>
                  <th>Quantidade Dsp</th>
                  <th>Nome</th>
                  <th>Data</th>
                  {permissao === "admin" && <th>Usuario</th>}
                </tr>
              </thead>

              <tbody>
                {listaFiltrada.length > 0 ? listaFiltrada.map((elemento, i) => (
                  <tr key={i}>
                    <td>{elemento.idstock}</td>
                    <td>{elemento.quantidade_estoque.toFixed(2)}</td>
                    <td>{elemento.quantidade.toFixed(2)}</td>
                    <td>{elemento.tipo}</td>
                    <td>{elemento.data}</td>
                    {permissao === "admin" && (
                      <td>
                        {elemento.usuario != null ? elemento.usuario.login : 0}
                      </td>
                    )}
                  </tr>
                )): (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                      Nenhum dado encontrado...
                    </td>
                  </tr>
                )}
              </tbody>

              {/* TOTAIS */}
              <tfoot>
                <tr>
                  <td colSpan="1">Total Quantidade Stock</td>
                  <td>{totalEstoque.toFixed(2)}</td>
                  <td colSpan="1">Total Quantidade Dispo</td>
                  <td>{totalQuantidade.toFixed(2)}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>

            {(permissao === "admin" || permissao === "gerente") && (
              <div className="crud">
                <button
                  className="editar"
                  onClick={() => {
                    if (id) {
                      moda.Abrir("Deseja editar o " + id);
                      document.querySelector(".sim").onclick = () =>
                        navigate(`/registar-stock/${id}`);
                      document.querySelector(".nao").onclick = () => moda.fechar();
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
                  onChange={(e) => setId(e.target.value)}
                />

                <button
                  className="apagar"
                  onClick={() => {
                    if (id) {
                      moda.Abrir("Deseja apagar o " + id);
                      document.querySelector(".sim").onclick = () => {
                        repositorio.deletar(id);
                        moda.fechar();
                      };
                      document.querySelector(".nao").onclick = () => moda.fechar();
                    } else {
                      msg.Erro("Por favor, digite um ID válido!");
                    }
                  }}
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
