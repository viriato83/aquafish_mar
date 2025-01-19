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

// Função para agrupar dados por período
function agruparPorPeriodo(dados, periodo = "dia") {
  const agrupados = {};

  dados.forEach((item) => {
    let chave;
    const data = new Date(item.data);

    if (periodo === "dia") {
      chave = data.toISOString().split("T")[0]; // Exemplo: "2024-12-03"
    } else if (periodo === "semana") {
      const semana = Math.ceil(data.getDate() / 7); // Número da semana no mês
      chave = `${data.getFullYear()}-M${data.getMonth() + 1}-W${semana}`; // Exemplo: "2024-M12-W1"
    } else if (periodo === "mes") {
      chave = `${data.getFullYear()}-${data.getMonth() + 1}`; // Exemplo: "2024-12"
    }

    if (!agrupados[chave]) {
      agrupados[chave] = 0;
    }
    agrupados[chave] += item.valor_total; // Soma os valores de venda no grupo
  });

  return {
    labels: Object.keys(agrupados), // Datas agrupadas
    valores: Object.values(agrupados), // Totais agrupados
  };
}

export default function Dashboard() {
  const clientes = new ClienteRepository();
  const mercadoria = new repositorioMercadoria();
  const stok = new repositorioStock();
  const vendas = new repositorioVenda();
  const chartRef = useRef(null); // Referência para o gráfico
  const chartInstanceRef = useRef(null); // Referência para a instância do gráfico
  const [cards, setCard] = useState([]);
  const [entrada, setEntradada] = useState(0);
  const [saida, setSaida] = useState(0);
  const [useVenda, setVenda] = useState([]);
  const [useData, setData] = useState([]);

  useEffect(() => {
    let contador1 = 0;
    let contador2 = 0;

    async function card() {
      let cards2 = [
        await clientes.total(),
        await mercadoria.total(),
        await stok.total(),
        await vendas.total(),
      ];
      setCard(cards2);

      let mercadorias = await mercadoria.leitura();
      mercadorias.forEach((e) => {
        if (e.tipo.toLowerCase() === "entrada") {
          contador1+=e.quantidade
        }
          contador2+=e.q_saidas
   
        if (e.tipo.toLowerCase() === "saida") {
          contador2+=e.quantidade
        }
      });

      setEntradada(contador1);
      setSaida(contador2);
    }

    async function setGrafico() {
      const dados = await vendas.leitura();

      // Agrupar dados por período
      const { labels, valores } = agruparPorPeriodo(dados, "mes"); // Agrupar por mês

      setVenda(valores);
      setData(labels);
    }

    card();
    setGrafico();
  }, []); // Apenas executa uma vez após montar o componente

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
  }, [useVenda, useData]);

  
    return (
        <>
          <Header></Header>
          <Conteinner>
            <Sidebar></Sidebar>
            <Content>
            <div className="dashboard">
        <div className="card total-clients">
            <h3>Total Clientes</h3>
            <p id="totalClients">{cards[0]}</p>
        </div>
        <div className="card total-sales">
            <h3>Total Vendas</h3>
            <p id="totalSales">{cards[3]}</p>
        </div>
        <div className="card total-goods">
            <h3>Total Mercadorias</h3>
            <p id="totalGoods">{cards[1]}</p>
        </div>
        <div className="card total-stock">
            <h3>Total Stock</h3>
            <p id="totalStock">{cards[2]}</p>
        </div>
        <div className="card total-stock">
            <h3>Total Saidas</h3>
            <p id="totalsaida">{saida}</p>
        </div>
        <div className="card total-stock">
            <h3>Total Entradas</h3>
            <p id="totalentrada">{entrada}</p>
        </div>
    </div>
    
    <div>
      <canvas id="salesChart" ref={chartRef}></canvas>
    </div>
            </Content>
          </Conteinner>
          <Footer></Footer>
        </>
    )
}