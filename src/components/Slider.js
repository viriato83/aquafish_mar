import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiBox, FiShoppingCart, FiArchive, FiTrendingUp, FiHome } from "react-icons/fi";

export default function Slider() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (menu) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? null : menu));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const cargo = sessionStorage.getItem("cargo");

  return (
    <>
      <button
        className={`hamburger-menu ${sidebarOpen ? "open" : ""}`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <ul>
          {(cargo === "admin" || cargo === "gerente") && (
            <li>
              <Link id="dashboard" to="/" className="toggle-menu">
                <FiHome /> Dashboard
              </Link>
            </li>
          )}

          {/* CLIENTES */}
          <li>
            <Link
              onClick={() => toggleMenu("clientes-menu")}
              className={`dropdown-toggle toggle-menu ${activeMenu === "clientes-menu" ? "bg-primary" : ""}`}
            >
              <FiUser /> Clientes
            </Link>
            <ul className={`submenu ${activeMenu === "clientes-menu" ? "show" : ""}`}>
              <li><Link to="/registarclientes">Registar Cliente</Link></li>
              <li><Link to="/clientesview">Ver Clientes Disponíveis</Link></li>
            </ul>
          </li>

          {/* Capturas */}
          {(cargo === "admin" || cargo === "funcionario" || cargo === "gerente") && (
            <>
              <li>
                <Link
                  onClick={() => toggleMenu("captura-menu")}
                  className={`dropdown-toggle toggle-menu ${activeMenu === "captura-menu" ? "bg-primary" : ""}`}
                >
                  <FiArchive /> Capturas
                </Link>
                <ul className={`submenu ${activeMenu === "captura-menu" ? "show" : ""}`}>
                  <li><Link to="/Registarcapturas">Registo </Link></li>
                  <li><Link to="/capturasview">Relatorio de Capturas</Link></li>
                </ul>
              </li>
          {/* STOCK */}
              <li>
                <Link
                  onClick={() => toggleMenu("stock-menu")}
                  className={`dropdown-toggle toggle-menu ${activeMenu === "stock-menu" ? "bg-primary" : ""}`}
                >
                  <FiArchive /> Requisições
                </Link>
                <ul className={`submenu ${activeMenu === "stock-menu" ? "show" : ""}`}>
                  <li><Link to="/RegistarStock">Registo</Link></li>
                  <li><Link to="/stockview">Relatorio de Requisições</Link></li>
                </ul>
              </li>

              {/* MERCADORIAS */}
              <li>
                <Link
                  onClick={() => toggleMenu("mercadorias-menu")}
                  className={`dropdown-toggle toggle-menu ${activeMenu === "mercadorias-menu" ? "bg-primary" : ""}`}
                >
                  <FiBox /> Mercadorias
                </Link>
                <ul className={`submenu ${activeMenu === "mercadorias-menu" ? "show" : ""}`}>
                  <li><Link to="/registarmercadoria">Cadastrar Mercadoria</Link></li>
                  <li><Link to="/mercadoriaview">Ver Mercadorias Disponíveis</Link></li>
                </ul>
              </li>

              {/* MORTALIDADE */}
              {/* <li>
                <Link
                  onClick={() => toggleMenu("mortalidade-menu")}
                  className={`dropdown-toggle toggle-menu ${activeMenu === "mortalidade-menu" ? "bg-primary" : ""}`}
                >
                  <FiTrendingUp /> Mortalidade
                </Link>
                <ul className={`submenu ${activeMenu === "mortalidade-menu" ? "show" : ""}`}>
                  <li><Link to="/Registarmortalidade">Cadastrar Mortalidades</Link></li>
                  <li><Link to="/mortalidadeview">Ver Mortalidades Disponíveis</Link></li>
                </ul>
              </li> */}
            </>
          )}

          {/* VENDAS */}
          <li>
            <Link
              onClick={() => toggleMenu("vendas-menu")}
              className={`dropdown-toggle toggle-menu ${activeMenu === "vendas-menu" ? "bg-primary" : ""}`}
            >
              <FiShoppingCart /> Vendas
            </Link>
            <ul className={`submenu ${activeMenu === "vendas-menu" ? "show" : ""}`}>
              <li><Link to="/registarvenda">Cadastrar Venda</Link></li>
              <li><Link to="/vendasview">Ver Vendas Disponíveis</Link></li>
            </ul>
          </li>
          {/* Racao */}
          {/* <li>
            <Link
              onClick={() => toggleMenu("racao-menu")}
              className={`dropdown-toggle toggle-menu ${activeMenu === "racao-menu" ? "bg-primary" : ""}`}
            >
              <FiShoppingCart /> Ração
            </Link>
            <ul className={`submenu ${activeMenu === "racao-menu" ? "show" : ""}`}>
              <li><Link to="/registarentrada">Cadastrar Entrada</Link></li>
              <li><Link to="/registarsaida">Cadastrar Saida</Link></li>
              
              <li><Link to="/racaoview">Relatorio</Link></li>
            </ul>
          </li> */}
        </ul>
      </nav>
    </>
  );
}
