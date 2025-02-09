import logo from "../logo_white-removebg2.png"
export default function Header(){
    function Sair(){
        sessionStorage.clear()
        window.location.reload()
    }
    return (<>
      <header>
        <div className="usuario">
            {sessionStorage.getItem("login")}
        </div>
        <div className="logo">
        <img src={logo} alt="Logo" width="130px" />
        </div>
        <h1>Aquafish Management System</h1>
        <button className="sair" onClick={(Sair)}>Sair</button>
    </header>
    </>)
}