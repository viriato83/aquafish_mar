import { useEffect, useState, useRef } from "react";
import Header from "../../../components/Header";
import Conteinner from "../../../components/Conteinner";
import Slider from "../../../components/Slider";
import Content from "../../../components/Content";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/modal";
import Mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import { repositorioVenda } from "./vendasRepositorio";
import Loading from "../../../components/loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function VendasView() {
  const repositorio = new repositorioVenda();
  const [modelo, setModelo] = useState([]);
  const [total, setTotal] = useState(0);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false); // Estado para exibir o loading
  const navigate = useNavigate();

  const msg = useRef(null);
  const moda = useRef(null);

  useEffect(() => {
    msg.current = new Mensagem();
    moda.current = new Modal();

    async function carregarDados() {
      setLoading(true); // Ativa o Loading
      try {
        const dadosModelo = await repositorio.leitura();
        const dadosTotal = await repositorio.total();
        setModelo(dadosModelo);
        setTotal(dadosTotal);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        msg.current.Erro("Erro ao carregar dados.");
      } finally {
        setLoading(false); // Desativa o Loading
      }
    }

    carregarDados();
  }, []);

  const exportarParaExcel = () => {
    const dados = modelo.map((venda) => ({
      ID: venda.idvendas,
      Quantidade: venda.quantidade,
      "Valor Unitário": venda.valor_uni,
      Data: venda.data,
      "Valor Total": venda.valor_total,
      Cliente: venda.cliente.nome,
      "Mercadorias": venda.mercadorias.map((mercadoria) => `${mercadoria.idmercadoria} : ${mercadoria.nome}`).join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "relatorio_vendas.xlsx");
  };
  const permissao=sessionStorage.getItem("cargo")

  return (
    <>
      {loading && <Loading />} {/* Exibe o componente de loading */}
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                  <th>Data</th>
                  <th>Valor Total</th>
                  <th>Cliente</th>
                  <th>Mercadorias</th>
                </tr>
              </thead>
              <tbody>
                {modelo.map((elemento, i) => (
                  <tr key={i}>
                    <td>{elemento.idvendas}</td>
                    <td>{elemento.quantidade}</td>
                    <td>{elemento.valor_uni} Mt</td>
                    <td>{elemento.data}</td>
                    <td>
                      {elemento.valor_total.toLocaleString("pt-PT", {
                        minimumFractionDigits: 3,
                      })}{" "}
                      Mt
                    </td>
                    <td>{elemento.cliente.nome}</td>
                    <td>
                      {elemento.mercadorias.map((elemento) => {
                        return `${elemento.idmercadoria} : ${elemento.nome}`;
                      })}{" "}
                    </td>
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
            {(permissao==="admin"||permissao==="funcionario") && (<div className="crud">
              <button
                className="editar"
                onClick={() => {
                  if (id) {
                    moda.current.Abrir("Deseja editar o " + id);
                    document.querySelector(".sim").addEventListener("click", () => {
                      navigate(`/registar-venda/${id}`);
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
                className="  crudid"
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
            </div>)}
           {permissao==="admin" &&( <button
              onClick={exportarParaExcel}
              className="btn-export mt-3"
            >
              Exportar Relatório Excel
            </button>)}
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
