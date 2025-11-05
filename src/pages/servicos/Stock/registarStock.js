import { useEffect, useState } from "react";
import Conteinner from "../../../components/Conteinner";
import Content from "../../../components/Content";
import Header from "../../../components/Header";
import Slider from "../../../components/Slider";
import Footer from "../../../components/Footer";
import { useParams } from "react-router-dom";
import mensagem from "../../../components/mensagem";
import repositorioStock from "./Repositorio";
import repositorioMercadoria from "../Mercadorias/Repositorio";
import stock from "./Stock";
import repositorioCaptura from "./Capturas/Repositorio";
import Captura from "./Capturas/Captura";

export default function RegistarStock() {
  const [inputs, setInputs] = useState({
    quantidade: "",
    tipo: "",
    data:"",
    captura:"",
    mercadoria: "",
  });
  const [mercadorias, setMercadorias] = useState([]);
  const { id } = useParams();
  const msg = new mensagem();
  const repositorio = new repositorioStock();
  const usuario= sessionStorage.getItem("idusuarios");
  const repositorioCpt=new repositorioCaptura()
  const [Capturas,setCaptura]=useState([])
  useEffect(() => {
    // Busca de mercadorias ao carregar o componente
    const fetchMercadorias = async () => {
      try {
        console.log(usuario)
        const repositorioMerc = new repositorioMercadoria();
        const data = await repositorioMerc.leitura();
        let  captura=await repositorioCpt.leitura()
        setCaptura(captura)
        setMercadorias(data);
      } catch (error) {
        msg.Erro("Erro ao buscar mercadorias.");
      }

    };
    fetchMercadorias();
  }, []);

  const criaStock = () => {
    return new stock(inputs.quantidade,inputs.quantidade, inputs.tipo,usuario,inputs.data, inputs.mercadoria);
  };

  const validarCampos = () => {
    if (!inputs.quantidade || !inputs.tipo ) {
      msg.Erro("Preencha todos os campos obrigatórios.");
      return false;
    }
    return true;
  };

  function calculaQuantidadeStock() {
    let stock = Capturas.find((e) => e.idcapturas == inputs.captura);
    if (stock) {
      return stock.quantidade-Number(inputs.quantidade)
    }
    else{
      console.log("stock nao encotrado")
    }
  }
  const cadastrar = () => {
    
    if (id) {
      repositorio.editar(id, criaStock());
      msg.sucesso("Stock editado com sucesso.");
    } else {
      if(calculaQuantidadeStock()>=0){
          if (!validarCampos()) return;
          console.log(criaStock())
          repositorio.cadastrar(criaStock());
          repositorioCpt.editar(inputs.captura,new Captura(calculaQuantidadeStock(),0,"",0,"","",0))
          msg.sucesso("Stock cadastrado com sucesso.");
          setInputs({ quantidade: "", tipo: "", mercadoria: "",data:"" }); // Limpar formulário
           }
               else{
                msg.Erro("Stock Insuficiente")
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
            <h1>Registo  de Stock</h1>
            <br />
            <div className="form">
            <label>Stock:</label>
              <select
                className="estoque"
                onChange={(e) =>
                  setInputs({ ...inputs, captura: e.target.value })
                }
              >
                <option value="">Selecione uma Captura
                
                </option>
                {Capturas.filter((e)=>{return e.quantidade>0}).map((estoque) => (
                  <option key={estoque.idcapturas} value={estoque.idcapturas} > 
                   {estoque.idcapturas}. {estoque.tipo} :: {estoque.quantidade}
                  </option>
                ))}
              </select>
              <label>ID:</label>
              <input type="number" value={id || 0} disabled className="id" />
              <br />
              <label>Quantidade (kg): </label>
              <input
                type="number"
                className="quantidade"
                placeholder="Quantidade"
                value={inputs.quantidade==null?null:inputs.quantidade}
                onChange={(e) =>
                  setInputs({ ...inputs, quantidade: e.target.value })
                }
              />
              <br />
              <label>Nome:</label>
              <input
                type="text"
                className="tipo"
                placeholder="Nome"
                value={inputs.tipo}
                onChange={(e) => setInputs({ ...inputs, tipo: e.target.value })}
              />
              <br />
              <label>Data </label>
              <input
                type="date"
                className="dataEntrada"
                value={inputs.data}
                onChange={(e) =>
                  setInputs({ ...inputs, data: e.target.value })
                }
              />
              <br />
              {/* <label>Mercadoria:
                --Opcional
              </label>
              <select
                className="mercadoria"
                value={inputs.mercadoria}
                onChange={(e) =>
                  setInputs({ ...inputs, mercadoria: e.target.value })
                }
              >
                <option value="">Selecione uma Mercadoria</option>
                {mercadorias.map((mercadoria) => (
                  <option
                    key={mercadoria.idmercadoria}
                    value={mercadoria.idmercadoria}
                  >
                    {mercadoria.nome}
                  </option>
                ))}
              </select> */}
            </div>
            <button onClick={cadastrar} className="cadastrarStock">
              Cadastrar
            </button>
          </div>
        </Content>
      </Conteinner>
      <Footer />
    </>
  );
}
