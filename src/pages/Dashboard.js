import Conteinner from "../components/Conteinner";
import Content from "../components/Content";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Slider";
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ClienteRepository from "./servicos/Clientes/ClienteRepository";
import repositorioMercadoria from "./servicos/Mercadorias/Repositorio";
import repositorioStock from "./servicos/Stock.js/Repositorio";
import { repositorioVenda } from "./servicos/vendas/vendasRepositorio";
import Loading from "../components/loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Função para agrupar dados por período
function agruparPorPeriodo(dados, periodo = "dia") {
  const agrupados = {};

  dados.forEach((item) => {
    let chave;
    const data = new Date(item.data);

    if (periodo === "dia") {
      chave = data.toISOString().split("T")[0];
    } else if (periodo === "semana") {
      const semana = Math.ceil(data.getDate() / 7);
      chave = `${data.getFullYear()}-M${data.getMonth() + 1}-W${semana}`;
    } else if (periodo === "mes") {
      chave = `${data.getFullYear()}-${data.getMonth() + 1}`;
    }

    if (!agrupados[chave]) {
      agrupados[chave] = 0;
    }
    agrupados[chave] += item.valor_total;
  });

  return {
    labels: Object.keys(agrupados),
    valores: Object.values(agrupados),
  };
}

function exportarParaExcel(dados, nomeArquivo = "dados.xlsx") {
  // Adiciona os dados básicos
  const wsDados = XLSX.utils.json_to_sheet(dados.infoBasica);

  // Modifica a planilha do gráfico para incluir todos os dados relevantes
  const wsGrafico = XLSX.utils.json_to_sheet(
    dados.grafico.map((venda) => ({
      ID: venda.idvendas,
      Quantidade: venda.quantidade,
      ValorUnitario: venda.valor_uni,
      Data: venda.data,
      ValorTotal: venda.valor_total,
      // Aqui você pode adicionar outras colunas se necessário
    }))
  );

  // Cria o workbook e adiciona as planilhas
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDados, "Dados");
  XLSX.utils.book_append_sheet(wb, wsGrafico, "Gráfico");

  // Converte para um buffer de Excel e cria o Blob
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // Salva o arquivo
  saveAs(blob, nomeArquivo);
}

export default function Dashboard() {
  const clientes = new ClienteRepository();
  const mercadoria = new repositorioMercadoria();
  const stok = new repositorioStock();
  const vendas = new repositorioVenda();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [cards, setCard] = useState([]);
  const [entrada, setEntradada] = useState(0);
  const [saida, setSaida] = useState(0);
  const [useVenda, setVenda] = useState([]);
  const [useData, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dadosParaExportar, setDadosParaExportar] = useState(null);

  const buscarCargo = () => sessionStorage.getItem("cargo");
  useEffect(() => {
    async function card() {
      if (cards.length === 0) {  // Verifica se os cards já foram carregados
        setLoading(true);
        try {
          let cards2 = [
            await clientes.total(),
            await mercadoria.total(),
            await stok.total(),
            await vendas.total(),
          ];
          setCard(cards2);
  
          let mercadorias = await mercadoria.leitura();
          let contador1 = 0;
          let contador2 = 0;
  
          mercadorias.forEach((e) => {
            if (e.tipo.toLowerCase() === "entrada") {
              contador1 += e.quantidade;
            }
            if (e.tipo.toLowerCase() === "saida") {
              contador2 += e.quantidade;
            }
          });
  
          setEntradada(contador1);
          setSaida(contador2);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
  
    async function setGrafico() {
      const dados = await vendas.leitura();
      const { labels, valores } = agruparPorPeriodo(dados, "mes");
      setVenda(valores);
      setData(labels);
  
      // Prepara os dados para exportação depois de buscar tudo
      setDadosParaExportar({
        infoBasica: [
          { label: "Total Clientes", valor: cards[0] },
          { label: "Total Vendas", valor: cards[3] },
          { label: "Total Mercadorias", valor: cards[1] },
          { label: "Total Stock", valor: cards[2] },
          { label: "Total Entradas", valor: entrada },
          { label: "Total Saídas", valor: saida },
        ],
        grafico: dados,
        labels: labels,
      });
    }
  
    card();
    setGrafico();
  }, [cards.length, entrada, saida]);  // Ajuste na lista de dependências
  
  useEffect(() => {
    if (useVenda.length > 0 && useData.length > 0) {
      const ctx = chartRef.current.getContext("2d");
  
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: useData,
          datasets: [
            {
              label: "Vendas",
              data: useVenda,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 10,
              },
            },
            y: {
              ticks: {
                stepSize: 1000,
                callback: function (value) {
                  return `${value} Mt`;
                },
              },
            },
          },
        },
      });
    }
  }, [useVenda, useData]);  // Isso só será executado quando useVenda ou useData mudarem
  
  return (
    <>
      <Header></Header>
      <Conteinner>
        <Sidebar></Sidebar>
        <Content>
          {loading && <Loading></Loading>}
          <div className="dashboard">
            <div className="card total-clients">
              <h3>Total Clientes</h3>
              <p id="totalClients">{cards[0]}</p>
            </div>
            <div className="card total-sales">
              <h3>Total Vendas</h3>
              <p id="totalSales">{cards[3]}</p>
            </div>
            {buscarCargo() === "admin" && (
              <>
                <div className="card total-goods">
                  <h3>Total Mercadorias</h3>
                  <p id="totalGoods">{cards[1]}</p>
                </div>
                <div className="card total-stock">
                  <h3>Total Stock</h3>
                  <p id="totalStock">{cards[2]}</p>
                </div>
                <div className="card total-stock">
                  <h3>Total Entradas</h3>
                  <p id="totalentrada">{entrada}</p>
                </div>
              </>
            )}
            <div className="card total-stock">
              <h3>Total Saídas</h3>
              <p id="totalsaida">{saida}</p>
            </div>
          </div>

          <div>
            <canvas id="salesChart" ref={chartRef}></canvas>
          </div>

          {dadosParaExportar && (
            <button
              onClick={() =>
                exportarParaExcel(dadosParaExportar, "dashboard_dados.xlsx")
              }
              className="btn-export"
            >
              Baixar Relatório Excel
            </button>
          )}
        </Content>
      </Conteinner>
      <Footer></Footer>
    </>
  );
}
