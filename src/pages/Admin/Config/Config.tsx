
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Building2, 
  Truck, 
  MessageSquare, 
  Printer, 
  Search, 
  Loader2, 
  QrCode, 
  Bell,
  MapPin,
  CloudCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import axios from "axios";

import Sidebar from "../../../components/Admin/Sidebar";
import { getConfig, updateConfig } from '../../../services/configService';
import { connectInstance } from '../../../functions/instanceConnect';

type ActiveTab = 'restaurante' | 'taxas' | 'whatsapp' | 'impressao';
type SyncStatus = 'synced' | 'saving' | 'error' | 'idle';

interface ConfigProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

export default function Config({ isDarkMode, toggleTheme }: ConfigProps) {
    const navigate = useNavigate();
    const [id, setId] = useState<number | null>(null);
    const [cnpj, setCnpj] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [nomeFantasia, setNomeFantasia] = useState("");
    const [cep, setCep] = useState("");
    const [tipoLogadouro, setTipoLogadouro] = useState("");
    const [logadouro, setLogadouro] = useState("");
    const [numero, setNumero] = useState("");
    const [quadra, setQuadra] = useState("");
    const [lote, setLote] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [taxaEntrega, setTaxaEntrega] = useState("");
    const [evolutionInstanceName, setEvolutionInstanceName] = useState("");
    const [urlAgenteImpressao, setUrlAgenteImpressao] = useState("");
    const [nomeImpressora, setNomeImpressora] = useState("");
    
    const [printers, setPrinters] = useState<{ name: string; isDefault?: boolean }[]>([]);
    const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [isConnectingInstance, setIsConnectingInstance] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('restaurante');
    const [hasUnread, setHasUnread] = useState(false);

    const isFirstLoad = useRef(true);
    const debounceTimer = useRef<number | null>(null);

    // ✅ Definição do triggerSave ANTES de ser referenciado
    const triggerSave = useCallback(async () => {
        if (isFirstLoad.current || !id) return;
        setSyncStatus('saving');
        try {
            // Converte o preço da máscara (virgula para ponto)
            const valorTaxaNumerico = parseFloat(taxaEntrega.replace(/\./g, '').replace(',', '.')) || 0;

            await updateConfig({ 
              cnpj, 
              razaoSocial, 
              nomeFantasia, 
              cep, 
              tipoLogadouro, 
              logadouro, 
              numero, 
              quadra, 
              lote, 
              bairro, 
              cidade, 
              estado, 
              telefone, 
              email, 
              taxaEntrega: valorTaxaNumerico, 
              evolutionInstanceName, 
              urlAgenteImpressao, 
              nomeImpressora 
            });
            setSyncStatus('synced');
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (error) { 
            setSyncStatus('error'); 
            console.error(error);
        }
    }, [id, cnpj, razaoSocial, nomeFantasia, cep, tipoLogadouro, logadouro, numero, quadra, lote, bairro, cidade, estado, telefone, email, taxaEntrega, evolutionInstanceName, urlAgenteImpressao, nomeImpressora]);

    useEffect(() => {
        const checkUnread = () => { setHasUnread(localStorage.getItem(UNREAD_ORDERS_KEY) === 'true'); };
        checkUnread();
        window.addEventListener('storage-update', checkUnread);

        const fetchConfig = async () => {
            try {
                const configData = await getConfig();
                setId(configData.id);
                setCnpj(configData.cnpj || "");
                setRazaoSocial(configData.razaoSocial || "");
                setNomeFantasia(configData.nomeFantasia || "");
                setCep(configData.cep || "");
                setTipoLogadouro(configData.tipoLogadouro || "");
                setLogadouro(configData.logadouro || "");
                setNumero(configData.numero || "");
                setQuadra(configData.quadra || "");
                setLote(configData.lote || "");
                setBairro(configData.bairro || "");
                setCidade(configData.cidade || "");
                setEstado(configData.estado || "");
                setTelefone(configData.telefone || "");
                setEmail(configData.email || "");
                // Formata o valor inicial para o padrão de máscara (ponto para vírgula)
                setTaxaEntrega(configData.taxaEntrega?.toString().replace('.', ',') || "0,00");
                setEvolutionInstanceName(configData.evolutionInstanceName || "");
                setUrlAgenteImpressao(configData.urlAgenteImpressao || "");
                setNomeImpressora(configData.nomeImpressora || "");
                
                setTimeout(() => { isFirstLoad.current = false; }, 1000);
            } catch (error) { 
                toast.error("Erro ao carregar configurações."); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchConfig();
        return () => window.removeEventListener('storage-update', checkUnread);
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(triggerSave, 1500) as unknown as number;
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [cnpj, razaoSocial, nomeFantasia, cep, tipoLogadouro, logadouro, numero, quadra, lote, bairro, cidade, estado, telefone, email, taxaEntrega, evolutionInstanceName, urlAgenteImpressao, nomeImpressora, triggerSave]);

    const handleBuscarCNPJ = async () => {
      if (!cnpj) return;
      try {
          const res = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpj.replace(/\D/g, '')}`);
          setRazaoSocial(res.data.razao_social);
          setNomeFantasia(res.data.estabelecimento.nome_fantasia || res.data.razao_social);
          toast.info("Dados do CNPJ importados!");
      } catch (e) { toast.error("CNPJ não encontrado"); }
    };

    const handleBuscarCEP = async () => {
      if (!cep) return;
      try {
          const res = await axios.get(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
          if (res.data.erro) return toast.error("CEP não encontrado");
          setLogadouro(res.data.logradouro);
          setBairro(res.data.bairro);
          setCidade(res.data.localidade);
          setEstado(res.data.uf);
          toast.info("Endereço atualizado!");
      } catch (e) { toast.error("Erro ao buscar CEP"); }
    };

    const handleBuscarImpressoras = async () => {
      if (!urlAgenteImpressao) return toast.warning("Informe a URL do agente");
      setIsFetchingPrinters(true);
      try {
          const res = await axios.get(`${urlAgenteImpressao}/printers`);
          setPrinters(res.data);
          toast.success("Lista de impressoras carregada!");
      } catch (e) { toast.error("Não foi possível conectar ao agente local"); } finally { setIsFetchingPrinters(false); }
    };

    const handleConnectInstance = async () => {
      if (!evolutionInstanceName) return toast.warning("Informe o nome da instância");
      setIsConnectingInstance(true);
      try {
          const res = await connectInstance({ 
              serverUrl: 'https://evolution.gs-sabores.com',
              instanceName: evolutionInstanceName,
              apikey: 'B347A5A7E0D3-4690-B878-9B2199F600E4'
          });
          if (res?.base64) {
            setQrCodeBase64(res.base64);
            toast.success("Escaneie o QR Code abaixo");
          }
      } catch (e) { toast.error("Erro ao conectar WhatsApp"); } finally { setIsConnectingInstance(false); }
    };

    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all shadow-sm";
    const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const tabClasses = (tab: ActiveTab) => `flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`;

    if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 shrink-0 transition-colors">
                    <h1 className="text-xl font-black dark:text-slate-100 tracking-tight transition-colors">Ajustes do Sistema</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           {syncStatus === 'saving' && <Loader2 size={12} className="animate-spin text-orange-500" />}
                           {syncStatus === 'synced' && <CloudCheck size={16} className="text-emerald-500" />}
                           {syncStatus === 'error' && <AlertCircle size={16} className="text-rose-500" />}
                           <span className={`text-[10px] font-black uppercase tracking-widest ${syncStatus === 'saving' ? 'text-orange-500' : syncStatus === 'synced' ? 'text-emerald-500' : 'text-slate-400'}`}>
                               {syncStatus === 'saving' ? 'Salvando...' : syncStatus === 'synced' ? `Sincronizado ${lastSaved}` : 'Modo Offline'}
                           </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                        <button 
                            onClick={() => navigate('/admin/order')}
                            className="relative text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors"
                        >
                            <Bell size={22} />
                            {hasUnread && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
                        </button>
                        <div className="h-10 w-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-700">GS</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
                  <div className="max-w-5xl mx-auto">
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto hide-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                              <button onClick={() => setActiveTab('restaurante')} className={tabClasses('restaurante')}><Building2 size={18} /> Empresa</button>
                              <button onClick={() => setActiveTab('taxas')} className={tabClasses('taxas')}><Truck size={18} /> Logística</button>
                              <button onClick={() => setActiveTab('whatsapp')} className={tabClasses('whatsapp')}><MessageSquare size={18} /> WhatsApp</button>
                              <button onClick={() => setActiveTab('impressao')} className={tabClasses('impressao')}><Printer size={18} /> Balcão</button>
                          </div>

                          <div className="p-10">
                              {activeTab === 'restaurante' && (
                                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                              <label className={labelClasses}>CNPJ da Empresa</label>
                                              <div className="flex gap-2">
                                                  <IMaskInput mask="00.000.000/0000-00" className={inputClasses} value={cnpj} onAccept={(v) => setCnpj(v as string)} />
                                                  <button onClick={handleBuscarCNPJ} className="bg-slate-100 dark:bg-slate-800 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-500"><Search size={18}/></button>
                                              </div>
                                          </div>
                                          <div>
                                              <label className={labelClasses}>Nome Fantasia</label>
                                              <input className={inputClasses} value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} placeholder="Ex: GS Sabores" />
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className={labelClasses}>Razão Social</label>
                                              <input className={inputClasses} value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} placeholder="Ex: GS LTDA" />
                                          </div>
                                      </div>
                                      <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                                          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> Localização do Estabelecimento</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                              <div>
                                                  <label className={labelClasses}>CEP</label>
                                                  <div className="flex gap-2">
                                                      <IMaskInput mask="00000-000" className={inputClasses} value={cep} onAccept={(v) => setCep(v as string)} />
                                                      <button onClick={handleBuscarCEP} className="bg-slate-100 dark:bg-slate-800 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-500"><Search size={18}/></button>
                                                  </div>
                                              </div>
                                              <div className="md:col-span-2">
                                                  <label className={labelClasses}>Logradouro / Rua</label>
                                                  <input className={inputClasses} value={logadouro} onChange={e => setLogadouro(e.target.value)} />
                                              </div>
                                              <div>
                                                  <label className={labelClasses}>Número</label>
                                                  <input className={inputClasses} value={numero} onChange={e => setNumero(e.target.value)} />
                                              </div>
                                              <div className="md:col-span-2">
                                                  <label className={labelClasses}>Bairro</label>
                                                  <input className={inputClasses} value={bairro} onChange={e => setBairro(e.target.value)} />
                                              </div>
                                              <div>
                                                  <label className={labelClasses}>Cidade</label>
                                                  <input className={inputClasses} value={cidade} onChange={e => setCidade(e.target.value)} />
                                              </div>
                                              <div>
                                                  <label className={labelClasses}>UF</label>
                                                  <input className={`${inputClasses} text-center uppercase`} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} maxLength={2} />
                                              </div>
                                          </div>
                                      </div>
                                      <div className="pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                              <label className={labelClasses}>Telefone de Atendimento</label>
                                              <IMaskInput mask="(00) 00000-0000" className={inputClasses} value={telefone} onAccept={(v) => setTelefone(v as string)} />
                                          </div>
                                          <div>
                                              <label className={labelClasses}>E-mail Corporativo</label>
                                              <input type="email" className={inputClasses} value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@empresa.com" />
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {activeTab === 'taxas' && (
                                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                      <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-[2rem] border border-orange-100 dark:border-orange-900/20 max-w-xl">
                                          <h3 className="text-sm font-black text-orange-800 dark:text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Truck size={20} /> Taxa de Entrega Fixa</h3>
                                          <p className="text-xs text-orange-600 dark:text-orange-500/70 mb-6 font-medium leading-relaxed">Este valor será aplicado automaticamente no checkout para pedidos que não forem marcados como retirada no local.</p>
                                          <div className="relative">
                                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-black">R$</span>
                                              <IMaskInput 
                                                mask={Number}
                                                scale={2}
                                                radix=","
                                                thousandsSeparator="."
                                                padFractionalZeros={true}
                                                normalizeZeros={true}
                                                mapToRadix={['.']}
                                                className="w-full bg-white dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-900/40 rounded-2xl p-4 pl-12 text-lg font-black text-orange-600 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" 
                                                value={taxaEntrega} 
                                                onAccept={(value) => setTaxaEntrega(value as string)} 
                                                placeholder="0,00"
                                              />
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {activeTab === 'whatsapp' && (
                                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="space-y-6">
                                              <div>
                                                  <label className={labelClasses}>Nome da Instância Evolution</label>
                                                  <input className={inputClasses} value={evolutionInstanceName} onChange={e => setEvolutionInstanceName(e.target.value)} placeholder="Ex: GS_MATRIZ" />
                                              </div>
                                              <button 
                                                onClick={handleConnectInstance} 
                                                disabled={isConnectingInstance} 
                                                className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                              >
                                                  {isConnectingInstance ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={18} />} 
                                                  Conectar WhatsApp
                                              </button>
                                              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-relaxed">Importante: Mantenha o nome da instância idêntico ao configurado no servidor Evolution API.</p>
                                              </div>
                                          </div>
                                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 min-h-[300px] transition-colors relative group">
                                              {qrCodeBase64 ? (
                                                  <div className="space-y-6 text-center animate-in zoom-in duration-500">
                                                      <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-orange-500">
                                                        <img src={qrCodeBase64} alt="Evolution QR Code" className="w-48 h-48 rounded-2xl" />
                                                      </div>
                                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Aguardando Escaneamento</p>
                                                  </div>
                                              ) : (
                                                  <>
                                                      <MessageSquare size={64} className="text-slate-200 dark:text-slate-700 mb-4 transition-colors group-hover:scale-110 duration-500" />
                                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-center max-w-[150px]">O QR Code aparecerá aqui após o clique ao lado.</p>
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {activeTab === 'impressao' && (
                                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="space-y-6">
                                              <div>
                                                  <label className={labelClasses}>URL do Agente de Impressão Local</label>
                                                  <div className="flex gap-2">
                                                      <input className={inputClasses} value={urlAgenteImpressao} onChange={e => setUrlAgenteImpressao(e.target.value)} placeholder="Ex: http://localhost:8080" />
                                                      <button 
                                                        onClick={handleBuscarImpressoras} 
                                                        disabled={isFetchingPrinters} 
                                                        className="bg-slate-100 dark:bg-slate-800 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-500 active:scale-95"
                                                      >
                                                          {isFetchingPrinters ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18}/>}
                                                      </button>
                                                  </div>
                                              </div>
                                              <div>
                                                  <label className={labelClasses}>Impressora Térmica Selecionada</label>
                                                  <select className={`${inputClasses} cursor-pointer`} value={nomeImpressora} onChange={e => setNomeImpressora(e.target.value)}>
                                                      <option value="">Nenhuma selecionada</option>
                                                      {printers.map(p => (
                                                          <option key={p.name} value={p.name}>{p.name} {p.isDefault ? '(Padrão)' : ''}</option>
                                                      ))}
                                                  </select>
                                              </div>
                                          </div>
                                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 transition-colors">
                                              <div className="flex items-center gap-3 mb-4">
                                                <Printer size={24} className="text-orange-500" />
                                                <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">Status do Hardware</h4>
                                              </div>
                                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                Para que a impressão automática funcione, certifique-se de que o <strong>GS Agent</strong> está rodando no computador conectado à impressora térmica.
                                              </p>
                                              <div className="mt-6 flex items-center gap-2">
                                                 <span className={`h-2.5 w-2.5 rounded-full ${urlAgenteImpressao ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{urlAgenteImpressao ? 'Agente Conectado' : 'Aguardando Agente'}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                </div>
            </main>
        </div>
    );
}
