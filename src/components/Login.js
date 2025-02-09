import React, { useState } from "react";
import logo from "../logo_white-removebg2.png"
export default function Login({ children }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("ligado") === "true"
  );


  const endpointSpring = "https://aquafish.eu-north-1.elasticbeanstalk.com/aquafish/login";
  const handleLogin = async () => {
    try {
      const response = await fetch(endpointSpring, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, senha: password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const { token, idusuarios,cargo } = data;

        sessionStorage.setItem("idusuarios", idusuarios);
        sessionStorage.setItem("login", username);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("cargo", cargo);
        sessionStorage.setItem("ligado", "true");

        setIsLoggedIn(true); // Atualiza o estado para indicar login bem-sucedido
      } else {
        setErrorMessage("Login ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage("Erro ao conectar com o servidor.");
    }
  };

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <section className="login-section">
        <div className="login-logo">
            <img src={logo} alt="Logo Aquafish" />
            
           
  
        </div>
    
      <div className="login-header">Login</div>
      <div className="login-body">
     
        <div className="login-input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Matricula"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="login-input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage.trim() !== "" && (
          <div className="login-error">{errorMessage}</div>
        )}
        <button className="login-button" onKeyDown={
            (event) => event.key === "Enter"? handleLogin() : null

  
        } onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </section>
  );
}
