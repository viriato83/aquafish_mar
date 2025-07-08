import React, { useEffect, useState, useRef } from "react";
import { Bell, TrendingDown } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function BotaoNotificacoes({ vendas = [] }) {
  const [show, setShow] = useState(false);
  const [dividasAltas, setDividasAltas] = useState([]);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const lastAlertCount = useRef(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const dividas = vendas.filter((v) => v.status_p === "Em_Divida");
    const totalDivida = dividas.reduce((acc, v) => acc + v.valor_total, 0);

    if (dividas.length > 0) {
      setDividasAltas([{ total: totalDivida, count: dividas.length }]);
    } else {
      setDividasAltas([]);
    }

    setTotalAlertas(dividas.length);

    if (dividas.length > lastAlertCount.current) {
      toast.error(`💰 ${dividas.length} venda(s) em dívida!`, {
        position: "top-right",
        autoClose: 4000,
        pauseOnHover: true,
      });
      lastAlertCount.current = dividas.length;
    }
  }, [vendas]);

  // Fecha o menu ao clicar fora ou apertar ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
     <div
     className="notification_div"
  ref={dropdownRef}
  style={{
    position: "fixed",
    top: 5,
    right: 200,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", // <- mantém alinhado ao lado direito
  }}
>

        <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" ,color:"white"}}>
          <button
            onClick={() => setShow((prev) => !prev)}
            aria-label="Notificações"
            className="relative flex items-center gap-2 px-4 py-2 bg-transparent border-0 text-bg-light
            text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition "
          >
            <div className="relative">
              <Bell
                className={`w-6 h-6 transition-colors duration-300 ${totalAlertas > 0 ? "text-red-600 animate-bell-pulse" : "text-gray-500"}`}
              />
              {totalAlertas > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-lg animate-badge-bounce select-none"
                  style={{ minWidth: 20, textAlign: "center" }}
                >
                  {totalAlertas}
                </span>
              )}
            </div>
            <span style={{ color: "white" }} className="font-semibold select-none">Notificações</span>
          </button>

          {show && (
            <div
              className="absolute  z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 w-80 max-w-full"
              role="dialog"
              aria-modal="true"
              aria-label="Lista de notificações"
            >
              {dividasAltas.length === 0 ? (
                <p className="text-gray-500 text-sm text-center select-none">Sem notificações.</p>
              ) : (
                <div className="flex items-start gap-3 text-red-900 bg-red-100 border border-red-400 p-3 rounded-md shadow-sm">
                  <TrendingDown className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <strong>{dividasAltas[0].count} venda(s)</strong> em dívida, totalizando <strong>{dividasAltas[0].total.toFixed(2)} Mt</strong>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer />

      <style jsx>{`
        @keyframes bell-pulse {
          0%, 100% {
            transform: scale(1);
            color: #dc2626;
          }
          50% {
            transform: scale(1.15);
            color: #b91c1c;
          }
        }

        @keyframes badge-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-bell-pulse {
          animation: bell-pulse 1.5s ease-in-out infinite;
        }

        .animate-badge-bounce {
          animation: badge-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default BotaoNotificacoes;
