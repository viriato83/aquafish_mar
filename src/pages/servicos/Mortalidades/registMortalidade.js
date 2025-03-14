import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import Footer from "../../../components/Footer";
import { repositorioMortalidade } from "./mortalidadeRepository";
import Mortalidade from "./Mortalidade";

export default function RegistarMortalidade() {
  const [inputs, setInputs] = useState({
    descricao: "",
    quantidade: "",
    data: "",
  });

  const { id } = useParams();
  let msg = new mensagem();
  let repositorio = new repositorioMortalidade();

  useEffect(() => {
    msg = new mensagem();
    repositorio = new repositorioMortalidade();
  }, []);

  const limparFormulario = () => {
    setInputs({
      descricao: "",
      quantidade: "",
      data: "",
    });
  };

  const criaMortalidade = () => {
    return new Mortalidade(inputs.descricao, inputs.quantidade, inputs.data);
  };

  const cadastrar = () => {
    if (id) {
      repositorio.editar(id, criaMortalidade());
    } else {
      if (!inputs.descricao || !inputs.quantidade || !inputs.data) {
        msg.Erro("Preencha corretamente todos os campos");
      } else {
        repositorio.cadastrar(criaMortalidade());
        limparFormulario(); // Limpa o formulário após o cadastro
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
            <h1>Registo de Mortalidade</h1>
            <br />
            <div className="form">
              <label>ID:</label>
              <input
                type="number"
                value={id ? id : 0}
                disabled
                className="id"
              />
              <br />
              <label>Descrição:</label>
              <input
                type="text"
                required
                className="descricao"
                id="cad"
                placeholder="Descrição"
                value={inputs.descricao}
                onChange={(e) => setInputs({ ...inputs, descricao: e.target.value })}
              />
              <br />
              <label>Quantidade: </label>
              <input
                type="number"
                required
                className="quantidade"
                id="cad"
                placeholder="Quantidade"
                value={inputs.quantidade}
                onChange={(e) => setInputs({ ...inputs, quantidade: e.target.value })}
              />
              <br />
              <label>Data: </label>
              <input
                type="date"
                className="data"
                id="cad"
                placeholder="Data"
                value={inputs.data}
                onChange={(e) => setInputs({ ...inputs, data: e.target.value })}
              />
            </div>
            <button onClick={cadastrar} className="cadastrar">
              Cadastrar
            </button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
