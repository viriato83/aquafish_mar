import { HashRouter as Router, Route, Routes, HashRouter } from "react-router-dom";


import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/servicos/Clientes/Clientes";
import ClientesView from "./pages/servicos/Clientes/ClientesView";
import RegistarStock from "./pages/servicos/Stock.js/registarStock";
import StockView from "./pages/servicos/Stock.js/StockView";
import RegistarMercadoria from "./pages/servicos/Mercadorias/RegistarMercadoria";
import MercadoriaView from "./pages/servicos/Mercadorias/mercadoriaView";
import RegistarVenda from "./pages/servicos/vendas/RegistarVendas";
import VendasView from "./pages/servicos/vendas/VendasView";
import RegistarMortalidade from "./pages/servicos/Mortalidades/registMortalidade";
import MortalidadeView from "./pages/servicos/Mortalidades/mortalidadeView";

export default function AppRouter() {
    return (
    
          <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/registar-clientes/:id" element={<Clientes />} />
                <Route path="/registarclientes" element={<Clientes />} />
                <Route path="/clientesview" element={<ClientesView />} />
                <Route path="/RegistarStock" element={<RegistarStock />} />
                <Route path="/registar-stock/:id" element={<RegistarStock />} />
                <Route path="/stockview" element={<StockView />} />
                <Route path="/registarmercadoria" element={<RegistarMercadoria />} />
                <Route path="/registar-mercadoria/:id" element={<RegistarMercadoria />} />
                <Route path="/mercadoriaview" element={<MercadoriaView />} />
                <Route path="/registarvenda" element={<RegistarVenda />} />
                <Route path="/registar-venda/:id" element={<RegistarVenda />} />
                <Route path="/vendasview" element={<VendasView />} />
                <Route path="/registarmortalidade" element={<RegistarMortalidade />} />
                <Route path="/registar-mortalidade/:id" element={<RegistarMortalidade />} />
                <Route path="/mortalidadeview" element={<MortalidadeView />} />
            </Routes>
        </HashRouter>
       
    );
}
