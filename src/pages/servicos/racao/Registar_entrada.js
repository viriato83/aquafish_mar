import React, { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import Footer from "../../../components/Footer";
import Mensagem from "../../../components/mensagem";
import { useParams } from "react-router-dom";
import { Racao } from "./racao";
import repositorioRacao from "./repositorio";

export default function Registar_entrada() {
  const { id } = useParams();
  const [inputs, setInputs] = useState({
    tipo: "",
    quantidade: "",
    quantidade_disp: "",
    data_entrada: "",
    valor_uni: "",
  });
  const repositorio= new repositorioRacao()
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setMsg(new Mensagem());
  }, []);

  const limparFormulario = () => {
    setInputs({
      tipo: "",
      quantidade: "",
      quantidade_disp: "",
      data_entrada: "",
      valor_uni: "",
    });
  };

  const criaRacao = () => {
    return new Racao(
      inputs.tipo,
      parseInt(inputs.quantidade),
      parseInt(inputs.quantidade),
      inputs.data_entrada,
      0,    // quantidade_saida inicial
      parseFloat(inputs.valor_uni),
      parseInt(inputs.quantidade) * parseFloat(inputs.valor_uni) // valor_tot calculado
    );
  };

  const  cadastrar = async ()  => {
    if (!repositorio || !msg) return;

    if (id) {
      await repositorio.editar(id, criaRacao());
    } else {
      if (!inputs.tipo || !inputs.quantidade || !inputs.data_entrada || !inputs.valor_uni) {
        msg.Erro("Preencha todos os campos obrigatórios!");
      } else {
        await repositorio.cadastrar(criaRacao());
        console.log(criaRacao())
        limparFormulario();
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
            <h1>Registro de Entrada de Ração</h1>
            <br />
            <div className="form">
              <label>ID:</label>
              <input type="number" value={id ? id : 0} disabled className="id" />
              <br />

              <label>Tipo:</label>
              <input
                type="text"
                required
                className="tipo"
                placeholder="Tipo de Ração"
                value={inputs.tipo}
                onChange={(e) => setInputs({ ...inputs, tipo: e.target.value })}
              />
              <br />

              <label>Quantidade:</label>
              <input
                type="number"
                required
                className="quantidade"
                placeholder="Quantidade (kg ou unid.)"
                value={inputs.quantidade}
                onChange={(e) => setInputs({ ...inputs, quantidade: e.target.value })}
              />
              <br />

             

              <label>Data de entrada:</label>
              <input
                type="date"
                required
                className="data_entrada"
                value={inputs.data_entrada}
                onChange={(e) => setInputs({ ...inputs, data_entrada: e.target.value })}
              />
              <br />

              <label>Valor unitário (MZN):</label>
              <input
                type="number"
                step="0.01"
                required
                className="valor_uni"
                placeholder="Valor unitário"
                value={inputs.valor_uni}
                onChange={(e) => setInputs({ ...inputs, valor_uni: e.target.value })}
              />
              <br />
            </div>

            <button onClick={cadastrar} className="cadastrar">Cadastrar</button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
