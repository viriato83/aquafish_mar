import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Slider() {
  const [activeMenu, setActiveMenu] = useState(null); // Estado para armazenar o menu ativo

  // Função para alternar o submenu visível
  const toggleMenu = (menu) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? null : menu));
  };

  return (
    <>
      <nav className="sidebar">
        <ul>
          <li>
            <Link id="dashboard" to="/" className="toggle-menu">
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              className="toggle-menu"
              onClick={() => toggleMenu("clientes-menu")}
            >
              Clientes
            </Link>
            <ul
              className={`submenu ${
                activeMenu === "clientes-menu" ? "show" : ""
              }`}
              id="clientes-menu"
            >
              <li>
                <Link  to="/registarclientes"className="Clicadastrar">Registar Cliente</Link>
              </li>
              <li>
                <Link to="/clientesview" className="listarClinte">Ver Clientes Disponíveis</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              className="toggle-menu"
              onClick={() => toggleMenu("stock-menu")}
            >
              Stock
            </Link>
            <ul
              className={`submenu ${
                activeMenu === "stock-menu" ? "show" : ""
              }`}
              id="stock-menu"
            >
              <li>
                <Link to="/RegistarStock" className="verCadastroStock">Cadastrar Stock</Link>
              </li>
              <li>
                <Link to="/stockview" className="verStock">Ver Stocks Disponíveis</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              className="toggle-menu"
              onClick={() => toggleMenu("mercadorias-menu")}
            >
              Mercadorias
            </Link>
            <ul
              className={`submenu ${
                activeMenu === "mercadorias-menu" ? "show" : ""
              }`}
              id="mercadorias-menu"
            >
              <li>
                <Link to="/registarmercadoria" className="verCadastroMercadoria">
                  Cadastrar Mercadoria
                </Link>
              </li>
              <li>
                <Link to="/mercadoriaview" className="verMercadoria">
                  Ver Mercadorias Disponíveis
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              className="toggle-menu"
              onClick={() => toggleMenu("vendas-menu")}
            >
              Vendas
            </Link>
            <ul
              className={`submenu ${
                activeMenu === "vendas-menu" ? "show" : ""
              }`}
              id="vendas-menu"
            >
              <li>
                <Link to="/registarvenda" className="verCadastroVendas">Cadastrar Venda</Link>
              </li>
              <li>
                <Link to="/vendasview" className="verVendas">Ver Vendas Disponíveis</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              className="toggle-menu"
              onClick={() => toggleMenu("morte-menu")}
            >
              Mortalidades
            </Link>
            <ul
              className={`submenu ${
                activeMenu === "morte-menu" ? "show" : ""
              }`}
              id="morte-menu"
            >
              <li>
                <Link to="/registarmortalidade" className="verCadastroMortes">Registar Mortalidade</Link>
              </li>
              <li>
                <Link to="/mortalidadeview" className="verMortalidade">Verificar Mortalidade</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}
