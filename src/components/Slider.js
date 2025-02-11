import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi"; // Ícones de menu


export default function Slider() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (menu) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? null : menu));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const buscarCargo = () => {
    return sessionStorage.getItem("cargo");
  };

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
          <li>
            <Link id="dashboard" to="/" className="toggle-menu">
              Dashboard
            </Link>
          </li>
          <li>
            <Link onClick={() => toggleMenu("clientes-menu")} className="toggle-menu">
              Clientes
            </Link>
            <ul className={`submenu ${activeMenu === "clientes-menu" ? "show" : ""}`}>
              <li>
                <Link to="/registarclientes">Registar Cliente</Link>
              </li>
              <li>
                <Link to="/clientesview">Ver Clientes Disponíveis</Link>
              </li>
            </ul>
          </li>

          {buscarCargo() === "admin" || buscarCargo() === "informatico" ? (
            <>
              <li>
                <Link onClick={() => toggleMenu("stock-menu")} className="toggle-menu">
                  Stock
                </Link>
                <ul className={`submenu ${activeMenu === "stock-menu" ? "show" : ""}`}>
                  <li>
                    <Link to="/RegistarStock">Cadastrar Stock</Link>
                  </li>
                  <li>
                    <Link to="/stockview">Ver Stocks Disponíveis</Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link onClick={() => toggleMenu("mercadorias-menu")} className="toggle-menu">
                  Mercadorias
                </Link>
                <ul className={`submenu ${activeMenu === "mercadorias-menu" ? "show" : ""}`}>
                  <li>
                    <Link to="/registarmercadoria">Cadastrar Mercadoria</Link>
                  </li>
                  <li>
                    <Link to="/mercadoriaview">Ver Mercadorias Disponíveis</Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link onClick={() => toggleMenu("mortalidade-menu")} className="toggle-menu">
                Mortalidade
                </Link>
                <ul className={`submenu ${activeMenu === "mortalidade-menu" ? "show" : ""}`}>
                  <li>
                    <Link to="/Registarmortalidade">Cadastrar Mortalidades</Link>
                  </li>
                  <li>
                    <Link to="/mortalidadeview">Ver Mortalidades Disponíveis</Link>
                  </li>
                </ul>
              </li>
            </>
          ) : null}
   
          <li>
            <Link onClick={() => toggleMenu("vendas-menu")} className="toggle-menu">
              Vendas
            </Link>
            <ul className={`submenu ${activeMenu === "vendas-menu" ? "show" : ""}`}>
              <li>
                <Link to="/registarvenda">Cadastrar Venda</Link>
              </li>
              <li>
                <Link to="/vendasview">Ver Vendas Disponíveis</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}
