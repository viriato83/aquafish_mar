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
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const msg = useRef(null);
  const moda = useRef(null);

  useEffect(() => {
    msg.current = new Mensagem();
    moda.current = new Modal();

    async function carregarDados() {
      setLoading(true);
      try {
        const dadosModelo = await repositorio.leitura();
        const dadosTotal = await repositorio.total();
        const quantidadeTotalVendas = dadosModelo.reduce((acc, venda) => acc + venda.valor_total, 0);

        setModelo(dadosModelo);
        setTotal(dadosModelo.reduce((acc, merc) => acc + merc.quantidade, 0));
        setQuantidadeTotal(quantidadeTotalVendas);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        msg.current.Erro("Erro ao carregar dados.");
      } finally {
        setLoading(false);
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
  
    // Adicionar linha com o total
    dados.push({
      ID: "TOTAL",
      Quantidade: quantidadeTotal, // Adiciona o total de quantidades
      "Valor Unitário": "", 
      Data: "",
      "Valor Total": total, // Adiciona o valor total das vendas
      Cliente: "",
      "Mercadorias": "",
    });
  
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "relatorio_vendas.xlsx");
  };
  

  const permissao = sessionStorage.getItem("cargo");

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
                    <td>{elemento.quantidade} kg</td>
                    <td>{elemento.valor_uni} Mt</td>
                    <td>{elemento.data}</td>
                    <td>
                      {elemento.valor_total.toLocaleString("pt-PT", {
                        minimumFractionDigits: 3,
                      })} Mt
                    </td>
                    <td>{elemento.cliente.nome}</td>
                    <td>
                      {elemento.mercadorias.map((mercadoria) => `${mercadoria.idmercadoria} : ${mercadoria.nome}`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Total</td>
                  <td colSpan="2">{total}kg</td>
                  <td>{quantidadeTotal.toLocaleString("pt-PT", { minimumFractionDigits: 3 })} Mt</td>
                </tr>
              </tfoot>
            </table>
            {(permissao === "admin" || permissao === "funcionario") && (
              <div className="crud">
                <button className="editar" onClick={() => {
                  if (id) {
                    moda.current.Abrir("Deseja editar o " + id);
                    document.querySelector(".sim").addEventListener("click", () => navigate(`/registar-venda/${id}`));
                    document.querySelector(".nao").addEventListener("click", () => moda.current.fechar());
                  } else {
                    msg.current.Erro("Por favor, digite um ID válido!");
                  }
                }}>
                  Editar
                </button>
                <input type="number" className="crudid" placeholder="Digite o ID" value={id} onChange={(e) => setId(e.target.value)} />
                <button onClick={() => {
                  if (id) {
                    moda.current.Abrir("Deseja apagar o " + id);
                    document.querySelector(".sim").addEventListener("click", () => {
                      repositorio.deletar(id);
                      moda.current.fechar();
                    });
                    document.querySelector(".nao").addEventListener("click", () => moda.current.fechar());
                  } else {
                    msg.current.Erro("Por favor, digite um ID válido!");
                  }
                }} className="apagar">
                  Apagar
                </button>
              </div>
            )}
            {permissao === "admin" && (
              <button onClick={exportarParaExcel} className="btn-export mt-3">
                Exportar Relatório Excel
              </button>
            )}
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
