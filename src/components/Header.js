import { useEffect } from "react";
import logo from "../logo_white-removebg2.png";
import BotaoNotificacoes from "./BotaoNotificacoes";
import { LogOut } from "lucide-react";
import { FaUser } from "react-icons/fa";

export default function Header({ children, mercadorias = [], vendas = [] }) {
  function Sair() {
    sessionStorage.clear();
    window.location.reload();
  }

  useEffect(() => {
    if (sessionStorage.getItem("token") == null) {
      sessionStorage.clear();
      window.location.reload();
    }
  }, []);

  return (
    <>
      <header className="header-container">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="system-title">Peixe do Mar</h1>
        </div>

     

        <div className="header-right">
          <span className="user-name">
          <FaUser />{sessionStorage.getItem("login")}</span>
          <button onClick={Sair} className="logout-btn">
            <LogOut size={18} className="mr-1" />
            Sair
          </button>
        </div>
      </header>
      {children}
    </>
  );
}
