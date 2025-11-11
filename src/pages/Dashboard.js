// DashboardFull.jsx
import Conteinner from "../components/Conteinner";
import Content from "../components/Content";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Slider";
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ClienteRepository from "./servicos/Clientes/ClienteRepository";
import repositorioMercadoria from "./servicos/Mercadorias/Repositorio";
import repositorioStock from "./servicos/Stock/Repositorio";
import repositorioCapturas from "./servicos/Stock/Capturas/Repositorio";
import { repositorioVenda } from "./servicos/vendas/vendasRepositorio";
import Loading from "../components/loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  TrendingDown,
  TrendingUp,
  Users,
  Box,
  List,
  Fish,
} from "lucide-react";

/**
 * DASHBOARD COMPLETO (Requisições = STOCK):
 * - KPIs: Clientes, Vendas Pagas (kg), Vendas em Dívida (MT), Total Mercadorias (kg),
 *         Total Requisições (kg, do STOCK), Total Capturas (kg)
 * - Filtros: Stock + Mês
 * - Gráficos:
 *    1) Vendas Mensais (MT)
 *    2) Requisições (kg) x Vendas (MT) por mês (combo)
 *    3) Capturas Mensais (kg)
 *    4) Pizza: Distribuição de Stock (kg disponíveis por tipo) [via mercadorias]
 * - Ranking: Mercadorias mais vendidas (por quantidade)
 * - Tabela: Resumo de Requisições (usando repositório STOCK)
 * - Exportar Excel: Resumo + Saídas (vendas) + Requisições (stock) + Capturas
 */

export default function Dashboard() {
  // --- REPOSITORIES
  const clientes = new ClienteRepository();
  const mercadoria = new repositorioMercadoria(); // catálogo / disponível
  const stok = new repositorioStock();            // <- AQUI estão as REQUISIÇÕES
  const vendas = new repositorioVenda();
  const Capturas = new repositorioCapturas();

  // --- REFS PARA CHARTS
  const vendasChartRef = useRef(null);
  const vendasChartInstanceRef = useRef(null);

  const mixChartRef = useRef(null);
  const mixChartInstanceRef = useRef(null);

  const capturasChartRef = useRef(null);
  const capturasChartInstanceRef = useRef(null);

  const pieChartRef = useRef(null);
  const pieChartInstanceRef = useRef(null);

  // --- STATES
  const [loading, setLoading] = useState(false);
  const [cards, setCard] = useState([]); // [totalClientes, totalMercKg, vendasPagasKg, totalDividaMT, totalCapturasKg, totalReqKg]
  const [modelo2, setModelo2] = useState([]); // stocks p/ filtro
  const [totalRequisicoesKg, setTotalRequisicoesKg] = useState(0);
  const [dadosParaExportar, setDadosParaExportar] = useState(null);
  const [stockSelecionado, setLoteS] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [requisicoesLista, setRequisicoesLista] = useState([]); // <- STOCK
  const [vendasLista, setVendasLista] = useState([]);
  const [mercadoriasLista, setMercadoriasLista] = useState([]);
  const [totalVendasPagasKg, setTotalVendasPagasKg] = useState(0);
  const [totalDividaMT, setTotalDividaMT] = useState(0);
  const [totalMercadoriasKg, setTotalMercadoriasKg] = useState(0);
  const [totalCapturasKg, setTotalCapturasKg] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [labelsVendas, setLabelsVendas] = useState([]);
  const [dadosVendasMT, setDadosVendasMT] = useState([]);

  // --- HELPERS
  const formatNumber = (n) =>
    n == null || Number.isNaN(Number(n)) ? "0" : Number(n).toLocaleString();

  function toYYYYMM(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function agruparPorMesSomando(arr, getDate, getValor) {
    const map = {};
    arr.forEach((item) => {
      const chave = toYYYYMM(getDate(item));
      if (!chave) return;
      map[chave] = (map[chave] || 0) + Number(getValor(item) || 0);
    });
    const labels = Object.keys(map).sort();
    const valores = labels.map((l) => map[l] || 0);
    return { labels, valores };
  }

  // --- EXPORTAÇÃO EXCEL (inclui STOCK em "03_Requisicoes")
  function exportarParaExcel(payload, nomeArquivo = "dashboard_dados.xlsx") {
    if (!payload) return;

    // 01 Resumo
    const wsResumo = XLSX.utils.json_to_sheet(payload.infoBasica || []);

    // 02 Saídas (Vendas)
    const wsSaidas = XLSX.utils.json_to_sheet(
      payload.saidas.map((v) => ({
        ID: v.idvendas,
        Quantidade: Number(v.quantidade || 0).toFixed(2).replace(".", ","),
        ValorUnitario: v.valor_uni,
        Data: v.data,
        ValorTotal: Number(v.valor_total || 0).toFixed(2).replace(".", ","),
        Status: v.status_p,
        Mercadorias: v.mercadorias?.map((m) => m.nome).join(", "),
        Usuario: v.usuario?.login || "—",
      }))
    );
    XLSX.utils.sheet_add_json(
      wsSaidas,
      [
        {
          ID: "TOTAL (kg)",
          Quantidade: Number(payload.totais?.totalSaidasKg || 0)
            .toFixed(2)
            .replace(".", ","),
          ValorTotal: Number(payload.totais?.totalVendasMT || 0)
            .toFixed(2)
            .replace(".", ","),
        },
      ],
      { skipHeader: true, origin: -1 }
    );
    XLSX.utils.sheet_add_json(
      wsSaidas,
      [
        {
          ID: "EM DÍVIDA",
          Quantidade: Number(payload.totais?.totalVendasEmDividaKg || 0)
            .toFixed(2)
            .replace(".", ","),
          ValorTotal: Number(payload.totais?.totalDividaMT || 0)
            .toFixed(2)
            .replace(".", ","),
        },
      ],
      { skipHeader: true, origin: -1 }
    );

    // 03 Requisições (STOCK)
    const wsReq = XLSX.utils.json_to_sheet(
      payload.requisicoes.map((s, idx) => ({
        N: idx + 1,
        Data: s.data,
        Quantidade: Number(s.quantidade ?? s.quantidade_estoque ?? 0)
          .toFixed(2)
          .replace(".", ","),
        Quantidade_Estoque: Number(s.quantidade_estoque ?? 0)
          .toFixed(2)
          .replace(".", ","),
        Tipo: s.tipo,
        Usuario: s.usuario?.login || "—",
        Mercadorias: Array.isArray(s.mercadoria)
          ? s.mercadoria.map((m) => m.nome ?? m.idmercadoria).join(", ")
          : "",
      }))
    );
    XLSX.utils.sheet_add_json(
      wsReq,
      [
        {
          N: "TOTAL (kg)",
          Quantidade: Number(payload.totais?.totalRequisicoesKg || 0)
            .toFixed(2)
            .replace(".", ","),
        },
      ],
      { skipHeader: true, origin: -1 }
    );

    // 04 Capturas
    const wsCapt = XLSX.utils.json_to_sheet(
      payload.capturas.map((c, idx) => ({
        N: idx + 1,
        Data: c.data,
        Quantidade: Number(c.quantidade || 0).toFixed(2).replace(".", ","),
        Quantidade_Estoque: Number(c.quantidade_estoque || 0)
          .toFixed(2)
          .replace(".", ","),
        Tipo: c.tipo,
        Origem: c.origem,
        Usuario: c.usuario?.login || "—",
        Mercadorias: c.mercadoria?.map((m) => m.idmercadoria).join(", "),
      }))
    );
    XLSX.utils.sheet_add_json(
      wsCapt,
      [
        {
          N: "TOTAL (kg)",
          Quantidade: Number(payload.totais?.totalCapturasKg || 0)
            .toFixed(2)
            .replace(".", ","),
        },
      ],
      { skipHeader: true, origin: -1 }
    );

    // Monta workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumo, "01_Resumo");
    XLSX.utils.book_append_sheet(wb, wsSaidas, "02_Saidas");
    XLSX.utils.book_append_sheet(wb, wsReq, "03_Requisicoes");
    XLSX.utils.book_append_sheet(wb, wsCapt, "04_Capturas");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, nomeArquivo);
  }

  // --- CARREGAR DADOS PRINCIPAIS
  useEffect(() => {
    async function carregarDashboard() {
      setLoading(true);
      try {
        const [vendasT, stk, mercT, captT, totalClientes] = await Promise.all([
          vendas.leitura(),
          stok.leitura(),          // <- Requisições aqui
          mercadoria.leitura(),    // catálogo / disponível
          Capturas.leitura(),
          clientes.total(),
        ]);

        setVendasLista(vendasT);
        setRequisicoesLista(stk);
        setMercadoriasLista(mercT);
        setModelo2(mercT.map(m => m.stock).filter(Boolean) // evita duplicados
          .reduce((acc, s) => {
            if (!acc.find(x => x.idstock === s.idstock)) acc.push(s);
            return acc;
          }, []));

        // Vendas (pagas) / Dívidas
        let somaVendasPagasKg = 0;
        let somaDividaMT = 0;
        let somaSaidasKgGlobal = 0;
        let somaVendasPagasMT = 0;
        let somaVendasEmDividaKg = 0;

        vendasT.forEach((v) => {
          const q = Number(v.quantidade || 0);
          const val = Number(v.valor_total || 0);
          somaSaidasKgGlobal += q;
          if (v.status_p === "Em_Divida") {
            somaDividaMT += val;
            somaVendasEmDividaKg += q;
          } else {
            somaVendasPagasKg += q;
            somaVendasPagasMT += val;
          }
        });

        // Mercadorias (disponível)
        let somaMercKg = 0;
        mercT.forEach((m) => {
          somaMercKg += Number(m.quantidade || 0);
        });

        // Requisições (STOCK) em kg
        const somaReqKg = stk.reduce(
          (acc, s) => acc + Number(s.quantidade_estoque ?? 0),
          0
        );

        // Capturas
        const somaCaptKg = captT.reduce(
          (acc, c) => acc + Number(c.quantidade_estoque || 0),
          0
        );

        setTotalVendasPagasKg(somaVendasPagasKg);
        setTotalDividaMT(somaDividaMT);
        setTotalMercadoriasKg(somaMercKg);
        setTotalRequisicoesKg(Number(somaReqKg.toFixed(2)));
        setTotalCapturasKg(somaCaptKg);

        setCard([
          totalClientes,
          somaMercKg,
          somaVendasPagasKg,
          somaDividaMT,
          somaCaptKg,
          somaReqKg,
        ]);

        // Gráfico Vendas Mensais (MT)
        const gVendas = agruparPorMesSomando(
          vendasT,
          (v) => v.data,
          (v) => v.valor_total
        );
        setLabelsVendas(gVendas.labels);
        setDadosVendasMT(gVendas.valores);

        // Ranking (mais vendidas por quantidade)
        const mapaRanking = {};
        vendasT.forEach((v) => {
          (v.mercadorias || []).forEach((m) => {
            const qtd = Number(m.quantidade || 0);
            mapaRanking[m.nome] = (mapaRanking[m.nome] || 0) + qtd;
          });
        });
        const arrRanking = Object.entries(mapaRanking)
          .map(([nome, qtd]) => ({ nome, qtd }))
          .sort((a, b) => b.qtd - a.qtd)
          .slice(0, 8);
        setRanking(arrRanking);

        // PREPARAR EXPORTAÇÃO
        setDadosParaExportar({
          infoBasica: [
            { label: "Total Clientes", valor: Number(totalClientes).toFixed(0) },
            {
              label: "Total Vendas (Pagas + Dívida) kg",
              valor: Number(somaSaidasKgGlobal).toFixed(2).replace(".", ","),
            },
            {
              label: "Total Mercadorias (Disponível) kg",
              valor: Number(somaMercKg).toFixed(2).replace(".", ","),
            },
            {
              label: "Vendas Pagas (kg)",
              valor: Number(somaVendasPagasKg).toFixed(2).replace(".", ","),
            },
            {
              label: "Vendas em Dívida (MT)",
              valor: Number(somaDividaMT).toFixed(2).replace(".", ","),
            },
            {
              label: "Total Requisições (kg)",
              valor: Number(somaReqKg).toFixed(2).replace(".", ","),
            },
            {
              label: "Total Capturas (kg)",
              valor: Number(somaCaptKg).toFixed(2).replace(".", ","),
            },
          ],
          saidas: vendasT,
          requisicoes: stk,  // <- exportar STOCK
          capturas: captT,
          totais: {
            totalSaidasKg: somaSaidasKgGlobal,
            totalVendasMT: somaVendasPagasMT + somaDividaMT,
            totalVendasEmDividaKg: somaVendasEmDividaKg,
            totalDividaMT: somaDividaMT,
            totalRequisicoesKg: somaReqKg,
            totalCapturasKg: somaCaptKg,
          },
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockSelecionado, mesSelecionado]);

  /* === GRÁFICOS === */

  // Vendas Mensais (MT)
  useEffect(() => {
    if (!vendasChartRef.current || labelsVendas.length === 0) return;

    if (vendasChartInstanceRef.current) {
      vendasChartInstanceRef.current.destroy();
      vendasChartInstanceRef.current = null;
    }

    const ctx = vendasChartRef.current.getContext("2d");
    vendasChartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labelsVendas,
        datasets: [
          {
            label: "Vendas (MT)",
            data: dadosVendasMT,
            backgroundColor: "rgba(54,162,235,0.6)",
            borderColor: "rgba(54,162,235,1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => `${v} Mt` },
          },
        },
      },
    });

    return () => {
      if (vendasChartInstanceRef.current) {
        vendasChartInstanceRef.current.destroy();
        vendasChartInstanceRef.current = null;
      }
    };
  }, [labelsVendas, dadosVendasMT]);

  // Requisições (STOCK kg) x Vendas (MT) por mês
  useEffect(() => {
    async function montarGraficoCombinado() {
      const [vendasDados, stockDados] = await Promise.all([
        vendas.leitura(),
        stok.leitura(),
      ]);

      // filtros
      const filtraVenda = (v) => {
        const am = toYYYYMM(v.data);
        const okMes = !mesSelecionado || am === mesSelecionado;
        const okStock =
          !stockSelecionado ||
          (v.mercadorias || []).some(
            (m) => m.stock && m.stock.idstock == stockSelecionado
          );
        return okMes && okStock;
      };

      const filtraReq = (s) => {
        const am = toYYYYMM(s.data);
        const okMes = !mesSelecionado || am === mesSelecionado;

        // se a requisição (stock) estiver ligada a alguma mercadoria com stock,
        // tentar filtrar por stockSelecionado
        const okStock =
          !stockSelecionado ||
          (Array.isArray(s.mercadoria) &&
            s.mercadoria.some(
              (mm) => mm.stock && mm.stock.idstock == stockSelecionado
            ));
        return okMes && okStock;
      };

      const vendasFiltradas = vendasDados.filter(filtraVenda);
      const reqFiltradas = stockDados.filter(filtraReq);

      // agrupar
      const mapVendas = {};
      vendasFiltradas.forEach((v) => {
        const chave = toYYYYMM(v.data);
        mapVendas[chave] = (mapVendas[chave] || 0) + Number(v.valor_total || 0);
      });

      const mapReq = {};
      reqFiltradas.forEach((s) => {
        const chave = toYYYYMM(s.data);
        const q = Number(s.quantidade ?? s.quantidade_estoque ?? 0);
        mapReq[chave] = (mapReq[chave] || 0) + q;
      });

      const labels = [...new Set([...Object.keys(mapVendas), ...Object.keys(mapReq)])].sort();
      const vendasVals = labels.map((l) => mapVendas[l] || 0);
      const reqVals = labels.map((l) => mapReq[l] || 0);

      if (!mixChartRef.current) return;
      if (mixChartInstanceRef.current) {
        mixChartInstanceRef.current.destroy();
        mixChartInstanceRef.current = null;
      }

      const ctx = mixChartRef.current.getContext("2d");
      mixChartInstanceRef.current = new Chart(ctx, {
        data: {
          labels,
          datasets: [
            {
              type: "bar",
              label: "Vendas (MT)",
              data: vendasVals,
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              yAxisID: "y",
            },
            {
              type: "line",
              label: "Requisições (kg)",
              data: reqVals,
              borderColor: "rgba(54, 162, 235, 1)",
              tension: 0.3,
              fill: false,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: {
              beginAtZero: true,
              position: "left",
              title: { display: true, text: "Vendas (MT)" },
            },
            y1: {
              beginAtZero: true,
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Requisições (kg)" },
            },
          },
        },
      });
    }

    montarGraficoCombinado();
    return () => {
      if (mixChartInstanceRef.current) {
        mixChartInstanceRef.current.destroy();
        mixChartInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSelecionado, stockSelecionado]);

  // Capturas Mensais (kg)
  useEffect(() => {
    async function montarCapturas() {
      const captDados = await Capturas.leitura();

      const captFiltradas = captDados.filter((c) => {
        const am = toYYYYMM(c.data);
        const okMes = !mesSelecionado || am === mesSelecionado;
        return okMes;
      });

      const g = agruparPorMesSomando(
        captFiltradas,
        (c) => c.data,
        (c) => c.quantidade
      );

      if (!capturasChartRef.current) return;
      if (capturasChartInstanceRef.current) {
        capturasChartInstanceRef.current.destroy();
        capturasChartInstanceRef.current = null;
      }

      const ctx = capturasChartRef.current.getContext("2d");
      capturasChartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: g.labels,
          datasets: [
            {
              label: "Capturas (kg)",
              data: g.valores,
              backgroundColor: "rgba(0,188,212,0.6)",
              borderColor: "rgba(0,188,212,1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    montarCapturas();
    return () => {
      if (capturasChartInstanceRef.current) {
        capturasChartInstanceRef.current.destroy();
        capturasChartInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSelecionado]);

  // Pizza: Distribuição de Stock (kg disponíveis via MERCADORIAS)
  useEffect(() => {
    async function montarPie() {
      const mercDados = await mercadoria.leitura();

      const filtradas = mercDados.filter((m) => {
        const am = toYYYYMM(m.data_entrada);
        const okMes = !mesSelecionado || am === mesSelecionado;
        const okStock =
          !stockSelecionado ||
          (m.stock && m.stock.idstock == stockSelecionado);
        return okMes && okStock;
      });

      const mapa = {};
      filtradas.forEach((m) => {
        const key = m.stock?.tipo ?? "SemStock";
        mapa[key] = (mapa[key] || 0) + Number(m.quantidade || 0);
      });

      const labels = Object.keys(mapa);
      const valores = labels.map((l) => mapa[l]);

      if (!pieChartRef.current) return;
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
        pieChartInstanceRef.current = null;
      }

      const ctx = pieChartRef.current.getContext("2d");
      pieChartInstanceRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data: valores,
              backgroundColor: [
                "rgba(54,162,235,0.6)",
                "rgba(255,99,132,0.6)",
                "rgba(255,206,86,0.6)",
                "rgba(75,192,192,0.6)",
                "rgba(153,102,255,0.6)",
                "rgba(255,159,64,0.6)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // evita pizza achatada
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: { color: "#333", font: { size: 14 }, padding: 10 },
            },
          },
        },
      });
    }

    montarPie();
    return () => {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
        pieChartInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSelecionado, stockSelecionado]);

  // --- RANKING
  useEffect(() => {
    async function gerarRanking() {
      const vendasDados = await vendas.leitura();

      const filtradas = vendasDados.filter((v) => {
        const am = toYYYYMM(v.data);
        const okMes = !mesSelecionado || am === mesSelecionado;
        const okStock =
          !stockSelecionado ||
          (v.mercadorias || []).some(
            (m) => m.stock && m.stock.idstock == stockSelecionado
          );
        return okMes && okStock;
      });

      const mapa = {};
      filtradas.forEach((v) => {
        (v.mercadorias || []).forEach((m) => {
          const qtd = Number(m.quantidade || 0);
          mapa[m.nome] = (mapa[m.nome] || 0) + qtd;
        });
      });

      const arr = Object.entries(mapa).map(([nome, qtd]) => ({ nome, qtd }));
      arr.sort((a, b) => b.qtd - a.qtd);
      setRanking(arr.slice(0, 8));
    }
    gerarRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSelecionado, stockSelecionado]);

  // --- RENDER
  return (
    <>
      <Header />
      <Conteinner>
        <Sidebar />
        <Content>
          {loading && <Loading />}

          {/* FILTROS */}
          <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontWeight: 600 }}>Filtrar por Stock:</label>
              <select
                value={stockSelecionado}
                onChange={(e) => setLoteS(e.target.value)}
                style={{ width: "100%", padding: 8, borderRadius: 8 }}
              >
                <option value={0}>Todos os Stocks</option>
                {modelo2.map((stock) => (
                  <option key={stock.idstock} value={stock.idstock}>
                    Stock {stock.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>Filtrar por Mês:</label>
              <input
                type="month"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                style={{ padding: 8, borderRadius: 8 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn-export"
                onClick={() => exportarParaExcel(dadosParaExportar, "dashboard_dados.xlsx")}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
              >
                📥 Exportar Excel
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="cards-grid">
            <KpiCard
              title="Total Clientes"
              value={formatNumber(cards[0] || 0)}
              icon={<Users />}
              color="#4fc3f7"
            />
            <KpiCard
              title="Vendas Pagas"
              value={`${formatNumber(totalVendasPagasKg || 0)} kg`}
              icon={<TrendingUp />}
              color="#66bb6a"
            />
            <KpiCard
              title="Vendas em Dívida"
              value={`${formatNumber(totalDividaMT || 0)} Mt`}
              icon={<TrendingDown />}
              color="#ef5350"
            />
            <KpiCard
              title="Total Mercadorias Dsp"
              value={`${formatNumber(totalMercadoriasKg || 0)} kg`}
              icon={<Box />}
              color="#ffa726"
            />
            <KpiCard
              title="Total Requisições Dsp"
              value={`${formatNumber(totalRequisicoesKg || 0)} kg`}
              icon={<List />}
              color="#42a5f5"
            />
            <KpiCard
              title="Total Capturas Dsp"
              value={`${formatNumber(totalCapturasKg || 0)} kg`}
              icon={<Fish />}
              color="#00bcd4"
            />
          </div>

          {/* GRÁFICOS PRINCIPAIS */}
          <div className="charts-row">
            <div className="chart-card">
              <h4>Vendas Mensais</h4>
              <canvas ref={vendasChartRef} />
            </div>

            <div className="chart-card">
              <h4>Requisições x Vendas (Mensal)</h4>
              <canvas ref={mixChartRef} />
            </div>

            <div className="chart-card">
              <h4>Capturas Mensais</h4>
              <canvas ref={capturasChartRef} />
            </div>
          </div>

          {/* LINHA SECUNDÁRIA: PIZZA + RANKING */}
          <div className="small-cards">
            <div className="chart-card small">
              <h4>Distribuição de Stock</h4>
              <canvas ref={pieChartRef} />
            </div>

            <div className="chart-card small">
              <h4>Ranking Mercadorias</h4>
              <ol className="ranking-list">
                {ranking.map((r, idx) => (
                  <li key={r.nome}>
                    <strong>{idx + 1}.</strong> {r.nome} —{" "}
                    <em>{formatNumber(r.qtd)} kg</em>
                  </li>
                ))}
                {ranking.length === 0 && <li>Nenhuma venda registada</li>}
              </ol>
            </div>
          </div>

          {/* TABELA RESUMO DE REQUISIÇÕES (STOCK) */}
          <div className="table-card">
            <h3>Resumo de Requisições (filtrado)</h3>
            <ResumoTabelaRequisicoes
              requisicoes={requisicoesLista}
              mesSelecionado={mesSelecionado}
              stockSelecionado={stockSelecionado}
            />
          </div>
        </Content>
      </Conteinner>
      <Footer />

      {/* CSS local para layout e gráficos confortáveis */}
      <style>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }
        @media (min-width: 1100px) {
          .cards-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }
        .kpi-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          min-height: 78px;
        }
        .kpi-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: white;
        }
        .kpi-text h3 {
          margin: 0;
          font-size: 0.9rem;
          color: #333;
        }
        .kpi-text p {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #111;
        }
        .charts-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 1100px) {
          .charts-row { grid-template-columns: repeat(3, 1fr); }
        }
        .chart-card {
          background: #fff;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .chart-card.small { min-height: 280px; }
        .small-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 12px;
          width:100%;
        }
        @media (min-width: 1100px) {
          .small-cards { grid-template-columns: 1fr 1fr; }
        }
        .ranking-list {
          margin: 0;
          padding-left: 20px;
        }
        .table-card {
          margin-top: 14px;
          background: #fff;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .btn-export:hover {
          background: #f7f7f7;
        }
      `}</style>
    </>
  );
}

/* -------------------------
   Componentes auxiliares
   ------------------------- */
function KpiCard({ title, value, icon, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="kpi-text">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

/** Resumo de REQUISIÇÕES (STOCK) em kg */
function ResumoTabelaRequisicoes({ requisicoes = [], mesSelecionado, stockSelecionado }) {
  const filtradas = requisicoes
    .filter((s) => {
      if (!s) return false;
      const d = new Date(s.data);
      if (isNaN(d)) return false;
      const anoMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (mesSelecionado && anoMes !== mesSelecionado) return false;

      // tenta filtrar por stock via mercadoria vinculada
      if (stockSelecionado && stockSelecionado != 0) {
        if (!Array.isArray(s.mercadoria)) return false;
        const tem = s.mercadoria.some(
          (m) => m.stock && m.stock.idstock == stockSelecionado
        );
        if (!tem) return false;
      }
      return true;
    })
    .slice(0, 400); // performance

  const totalQtd = filtradas.reduce(
    (acc, s) => acc + Number(s.quantidade ?? s.quantidade_estoque ?? 0),
    0
  );
  const totalQtdEst = filtradas.reduce(
    (acc, s) => acc + Number(s.quantidade_estoque ?? 0),
    0
  );

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <small>Registos: {filtradas.length}</small>
        <div>
          <small style={{ marginRight: 12 }}>
            Total Requisições: {totalQtd.toFixed(2)} kg
          </small>
          <small>Qtd. Estoque: {totalQtdEst.toFixed(2)} kg</small>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ padding: 8 }}>#</th>
              <th>Data</th>
              <th>Quantidade (kg)</th>
              <th>Qtd. Estoque (kg)</th>
              <th>Tipo</th>
              <th>Mercadorias</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((s, i) => (
              <tr key={i}>
                <td style={{ padding: 8 }}>{i + 1}</td>
                <td>{s.data}</td>
                <td>{Number(s.quantidade ?? s.quantidade_estoque ?? 0).toFixed(2)}</td>
                <td>{Number(s.quantidade_estoque ?? 0).toFixed(2)}</td>
                <td>{s.tipo ?? ""}</td>
                <td>
                  {Array.isArray(s.mercadoria)
                    ? s.mercadoria.map((m) => m.nome ?? m.idmercadoria).join(", ")
                    : ""}
                </td>
                <td>{s.usuario?.login ?? ""}</td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 12, textAlign: "center" }}>
                  Nenhum registo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
