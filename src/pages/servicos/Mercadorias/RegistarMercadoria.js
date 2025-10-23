import Select from "react-select";
import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import Footer from "../../../components/Footer";
import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import repositorioStock from "../Stock.js/Repositorio";
import Mercadoria from "./Mercadoria";
import repositorioMercadoria from "./Repositorio";
import stock from "../Stock.js/Stock";

export default function RegistarMercadoria() {
  const [inputs, setInputs] = useState({
    nome: "",
    tipo: "",
    quantidade: "",
    dataEntrada: "",
    valorUnitario: "",
    dataSaida: "",
    estoque: "",
  });
  const [estoques, setEstoques] = useState([]);
  const { id } = useParams();
  let msg = new mensagem();
  let repositorio = new repositorioMercadoria();
<<<<<<< HEAD
  const usuario = sessionStorage.getItem("idusuarios");

  useEffect(() => {
    const fetchEstoques = async () => {
      const estoqueRepo = new repositorioStock();
      const data = await estoqueRepo.leitura();
=======
  const usuario= sessionStorage.getItem("idusuarios");
  const estoqueRepo = new repositorioStock();
  useEffect(() => {
    // msg =;
  
    
    // Buscar estoques do backend
    const fetchEstoques = async () => {
   
      const data = await estoqueRepo.leitura(); // Assumindo que `listar` retorna os estoques
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
      setEstoques(data);
    };
    fetchEstoques();
<<<<<<< HEAD
  }, []);
  // 🔹 Agrupar os estoques por data (ex: dataEntrada ou dataCriacao)
  const estoquesAgrupados = Object.values(
    estoques.reduce((grupos, item) => {
      const data = item.data||"Sem data";
      if (!grupos[data]) {
        grupos[data] = {
          label: `Data: ${data}`,
          options: [],
        };
      }
      grupos[data].options.push({
        value: item.idstock,
        label: `${item.idstock}. ${item.tipo} (${item.quantidade} kg)`,
      });
      return grupos;
    }, {})
  );

  function calculaQuantidadeStock() {
    let stock = estoques.find((e) => e.idstock === inputs.estoque);
    if (stock) return stock.quantidade / 3;
  }
  
  console.log(calculaQuantidadeStock())
=======
   
  }, []);
  function calculaQuantidadeStock() {
    let stock = estoques.find((e) => e.idstock == inputs.estoque);
    if (stock) {
      return stock.quantidade-Number(inputs.quantidade)
    }
    else{
      console.log("stock nao encotrado")
    }
  }
  
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
  const criaMercadoria = () => {
    return new Mercadoria(
      inputs.nome,
      "Entrada",
      calculaQuantidadeStock(),
      calculaQuantidadeStock(),
      inputs.dataEntrada,
      inputs.valorUnitario,
      inputs.dataSaida,
      usuario,
      inputs.estoque
    );
  };

  const limparFormulario = () => {
    setInputs({
      nome: "",
      tipo: "",
      quantidade: "",
      dataEntrada: "",
      valorUnitario: "",
      dataSaida: "",
      estoque: "",
    });
  };

<<<<<<< HEAD
  const cadastrar = () => {
    if (
      !inputs.nome ||
      !inputs.dataEntrada ||
      !inputs.valorUnitario ||
      !inputs.estoque
    ) {
      msg.Erro("Preencha corretamente todos os campos obrigatórios");
      return;
    }

=======

  const cadastrar =  async() => {
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
    if (id) {
      repositorio.editar(id, criaMercadoria());
      msg.sucesso("Mercadoria editada com sucesso.");
    } else {
<<<<<<< HEAD
      repositorio.cadastrar(criaMercadoria());
      msg.sucesso("Mercadoria cadastrada com sucesso.");
=======
      if (
        !inputs.nome ||
    
        !inputs.quantidade ||
        !inputs.dataEntrada ||
        !inputs.valorUnitario ||
        !inputs.estoque
      ) {
        msg.Erro("Preencha corretamente todos os campos obrigatórios");
      } else {
             if(calculaQuantidadeStock()>0){
              await repositorio.cadastrar(criaMercadoria());
             
              localStorage.setItem("quantidade",JSON.stringify(quantidade))
              msg.sucesso("Mercadoria cadastrada com sucesso.");
              limparFormulario(); // Limpa o formulário após cadastrar
              setTimeout(() => {
                window.location.reload();
              }, 2000);
             }
             else{
              msg.Erro("Stock Insuficiente")
             }
      }
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
    }

    limparFormulario();
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <>
      <Header />
      <Conteinner>
        <Slider />
        <Content>
          <div className="Cadastro">
            <h1>Registo de Mercadorias</h1>
            <br />
            <div className="form">
              <label>Nome:</label>
              <input
                type="text"
                placeholder="Nome da mercadoria"
                value={inputs.nome}
<<<<<<< HEAD
=======
             
                onChange={(e) => setInputs({ ...inputs, nome: e.target.value })}
              />
              {/* <br />
              <label>Tipo:</label>
              <input
                type="text"
                className="tipo"
                placeholder="Saída ou Entrada"
                value={inputs.tipo}
                onChange={(e) => setInputs({ ...inputs, tipo: e.target.value })}
              /> */}
              <br />
              <label>Quantidade</label>
              <input
                type="number"
                className="quantidade"
                placeholder="Quantidade Unitaria"
                value={inputs.quantidade==null?null:inputs.quantidade}
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
                onChange={(e) =>
                  setInputs({ ...inputs, nome: e.target.value })
                }
              />
              <br />

              <label>Data de Entrada:</label>
              <input
                type="date"
                value={inputs.dataEntrada}
                onChange={(e) =>
                  setInputs({ ...inputs, dataEntrada: e.target.value })
                }
              />
              <br />

              <label>Valor Unitário:</label>
              <input
                type="number"
                placeholder="Valor unitário"
                value={inputs.valorUnitario}
                onChange={(e) =>
                  setInputs({ ...inputs, valorUnitario: e.target.value })
                }
              />
              <br />
<<<<<<< HEAD

              <label>Gaiolas:</label>
              <Select
                options={estoquesAgrupados}
                placeholder="Selecione uma Gaiola"
                onChange={(option) =>
                  setInputs({ ...inputs, estoque: option?.value || "" })
                }
                value={
                  inputs.estoque
                    ? estoquesAgrupados
                        .flatMap((g) => g.options)
                        .find((opt) => opt.value === inputs.estoque)
                    : null
                }
              />
=======
              <label>Stock:</label>
              <select
                className="estoque"
                onChange={(e) =>
                  setInputs({ ...inputs, estoque: e.target.value })
                }
              >
                <option value="">Selecione um Stock
                
                </option>
                {estoques.map((estoque) => (
                  <option key={estoque.idstock} value={estoque.idstock} >
                   {estoque.idstock}. {estoque.tipo} :: {estoque.quantidade}
                  </option>
                ))}
              </select>
>>>>>>> 98bfafe (Salvar alterações locais antes de merge)
            </div>

            <button onClick={cadastrar} className="cadastrarMercadoria">
              Cadastrar
            </button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
