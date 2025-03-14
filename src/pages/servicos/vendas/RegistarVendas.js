import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import Footer from "../../../components/Footer";
import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import repositorioStock from "../Stock.js/Repositorio";
 // Adicionar repositório de clientes

import { repositorioVenda } from "./vendasRepositorio";
import vendas from "./Vendas";
import repositorioMercadoria from "../Mercadorias/Repositorio";
import ClienteRepository from "../Clientes/ClienteRepository";
import mercadoria from "../Mercadorias/Mercadoria";
export default function RegistarVenda() {
  const [inputs, setInputs] = useState({
    quantidade: "",
    valorUnitario: "",
    data: "",
    cliente: "",
    mercadoria: "",
  });

  const [clientes, setClientes] = useState([]); // Lista dinâmica de clientes
  const [mercadorias, setMercadorias] = useState([]); // Lista dinâmica de mercadorias
  const { id } = useParams();
  let msg = new mensagem();
  let repositorio = new repositorioVenda();
  const mercadoriaRepo = new repositorioMercadoria();
  let Cadastro =true; //
  let saidas=0;
  useEffect(() => {
    // atualizacao 2025
    // Buscar clientes e mercadorias do backend
    const fetchClientes = async () => {
      const clienteRepo = new ClienteRepository();
      const data = await clienteRepo.leitura(); // Assumindo que listar retorna os clientes
      setClientes(data);
    };

    const fetchMercadorias = async () => {
    
      const data = await mercadoriaRepo.leitura(); // Assumindo que listar retorna as mercadorias
      setMercadorias(data);
    };

  
    fetchClientes();
    fetchMercadorias();
  }, []);

  //atualizacao 2025

  const criaMercadoria = () => {
    let Total = 0; // Inicializa o total
  
    mercadorias.map((merc) => {
    
      if (merc.idmercadoria == inputs.mercadoria) {
            Total = merc.quantidade - Number(inputs.quantidade);
        // Valida se a quantidade restante é válida
        if (Total <= 0) {
          // window.alert("Quantidade insuficiente em estoque.");
          // Total = 0; // Garante que não seja negativo
            Cadastro=false
      
        }if(Total>=0){
          Cadastro=true
        }
      }
    });
  
    // Retorna uma nova instância da mercadoria com o valor correto
    return new mercadoria(
      "", 
      "",
      Total, 
      "",
      null, // A
      "",
      0,
      0
    );
  };
  
  
  const criaVenda = () => {
 
    return new vendas(
      inputs.quantidade,
      inputs.valorUnitario,
      inputs.data,
      inputs.cliente,
      inputs.mercadoria
    );
  };

  const limparFormulario = () => {
    setInputs({
      quantidade: "",
      valorUnitario: "",
      data: "",
      cliente: "",
      mercadoria: "",
    });
  };

  const cadastrar = async () => {
    if (id) {
      repositorio.editar(id, criaVenda());
      msg.sucesso("Venda editada com sucesso.");
      limparFormulario();
    } else {
      if (
        !inputs.quantidade ||
        !inputs.valorUnitario ||
        !inputs.data ||
        !inputs.cliente ||
        !inputs.mercadoria
      ) {
        msg.Erro("Preencha corretamente todos os campos obrigatórios");
        return;
      }
  
      // Verificar estoque antes do cadastro
      const novaMercadoria = criaMercadoria();
  
      if (!Cadastro) {
        msg.Erro("Estoque insuficiente.");
        return;
      }
  
      try {
        // Cadastrar venda
        await repositorio.cadastrar(criaVenda());
  
        // Atualizar mercadoria com estoque atualizado
        await mercadoriaRepo.editar(inputs.mercadoria, novaMercadoria);
  
        // Atualizar saídas
        mercadorias.forEach((merc) => {
          if (merc.idmercadoria == inputs.mercadoria) {
            saidas = merc.q_saidas + Number(inputs.quantidade);
          }
        });
  
        await mercadoriaRepo.editar2(inputs.mercadoria, inputs.data, saidas);
  
        msg.sucesso("Venda cadastrada com sucesso.");
        limparFormulario()
      } catch (error) {
        msg.Erro(`Erro ao cadastrar venda.`);
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
            <h1>Registo de Vendas</h1>
            <br />
            <div className="form">
            <label>ID:</label>
              <input type="number" value={id ? id : 0} disabled className="id" />
              <br />
              <label>Quantidade: kg</label>
              <input
                type="number"
                className="quantidade"
                placeholder="Quantidade em kg"
                value={inputs.quantidade}
                onChange={(e) =>
                  setInputs({ ...inputs, quantidade: e.target.value })
                }
              />
              <br />
              <label>Valor Unitário:</label>
              <input
                type="number"
                className="valorUnitario"
                placeholder="Valor unitário"
                value={inputs.valorUnitario}
                onChange={(e) =>
                  setInputs({ ...inputs, valorUnitario: e.target.value })
                }
              />
              <br />
              <label>Data:</label>
              <input
                type="date"
                className="data"
                value={inputs.data}
                onChange={(e) => setInputs({ ...inputs, data: e.target.value })}
              />
              <br />
              <label>Cliente:</label>
              <select
                className="cliente"
                value={inputs.cliente}
                onChange={(e) =>
                  setInputs({ ...inputs, cliente: e.target.value })
                }
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idclientes} value={cliente.idclientes}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
              <br />
              <label>Mercadoria:</label>
              <select
                className="mercadoria"
                value={inputs.mercadoria}
                onChange={(e) =>
                  setInputs({ ...inputs, mercadoria: e.target.value })
                }
              >
                <option value="">Selecione uma mercadoria</option>
                {mercadorias.map((mercadoria) => (
                  <option
                    key={mercadoria.idmercadoria}
                    value={mercadoria.idmercadoria}
                  >
                    {mercadoria.nome}
                  </option>
                ))}
              </select>
              <br />
            </div>
            <button onClick={cadastrar} className="cadastrarVenda">
              Cadastrar
            </button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
