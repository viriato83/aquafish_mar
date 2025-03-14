import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import Clientes from "./Cclientes";
import ClienteRepository from "./ClienteRepository";
import { useParams } from "react-router-dom";
import Mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";

export default function RegistarClientes() {
  const { id } = useParams();
  const [inputs, setInputs] = useState({ nome: "", localizacao: "", telefone: "" });
  const [repositorio, setRepositorio] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setMsg(new Mensagem());
    setRepositorio(new ClienteRepository());
  }, []);

  const limparFormulario = () => {
    setInputs({
      nome: "",
      localizacao: "",
      telefone: "",
    });
  };

  const criaCliente = () => {
    return new Clientes(inputs.nome, inputs.localizacao, inputs.telefone);
  };

  const cadastrar = () => {
    if (!repositorio || !msg) return; // Garante que os objetos estejam inicializados

    if (id) {
      repositorio.editar(id, criaCliente());
    } else {
      if (!inputs.nome || !inputs.localizacao) {
        msg.Erro("Preencha corretamente todos os campos");
      } else {
        repositorio.cadastrar(criaCliente());
        limparFormulario(); // Agora o formulário será limpo corretamente após o cadastro
      }
    }
  };

  return (
    <>
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <div className="Cadastro">
            <h1>Registo de Clientes</h1>
            <br />
            <div className="form">
              <label>ID:</label>
              <input type="number" value={id ? id : 0} disabled className="id" />
              <br />
              <label>Nome:</label>
              <input
                type="text"
                required
                className="nome"
                placeholder="Nome do cliente"
                value={inputs.nome}
                onChange={(e) => setInputs({ ...inputs, nome: e.target.value })}
              />
              <br />
              <label>Localização: </label>
              <input
                type="text"
                required
                className="localizacao"
                placeholder="Localização do cliente"
                value={inputs.localizacao}
                onChange={(e) => setInputs({ ...inputs, localizacao: e.target.value })}
              />
              <br />
              <label>Telefone: <span className="bg-primary">--Opcional--</span></label>
              <input
                type="tel"
                className="telefone"
                placeholder="Telefone do cliente"
                value={inputs.telefone}
                onChange={(e) => setInputs({ ...inputs, telefone: e.target.value })}
              />
            </div>
            <button onClick={cadastrar} className="cadastrar">Cadastrar</button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
