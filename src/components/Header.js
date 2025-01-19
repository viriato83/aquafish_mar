
export default function Header(){
    function Sair(){
        sessionStorage.clear()
        window.location.reload()
    }
    return (<>
      <header>
        <div className="usuario">
         
        </div>
        <div className="logo">
            <img src="logo_white-removebg2.png" alt="" width="130px"/>
        </div>
        <h1>Aquafish Management System</h1>
        <button className="sair" onClick={(Sair)}>Sair</button>
    </header>
    </>)
}