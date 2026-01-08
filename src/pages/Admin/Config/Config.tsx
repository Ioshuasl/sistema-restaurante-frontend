
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Building2, Truck, MessageSquare, Printer, Loader2, CloudCheck, Palette
} from 'lucide-react';
import Sidebar from "../../../components/Admin/Sidebar";
import { getConfig, updateConfig } from '../../../services/configService';

import RestauranteTab from "../../../components/Admin/Config/RestauranteTab";
import AparenciaTab from "../../../components/Admin/Config/AparenciaTab";
import MobilePreview from "../../../components/Admin/Config/MobilePreview";
import { IMaskInput } from "react-imask";

type ActiveTab = 'restaurante' | 'taxas' | 'whatsapp' | 'impressao' | 'aparencia';
type SyncStatus = 'synced' | 'saving' | 'error' | 'idle';

export default function Config({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) {
    const [configData, setConfigData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('restaurante');
    const isFirstLoad = useRef(true);
    const debounceTimer = useRef<number | null>(null);

    const triggerSave = useCallback(async () => {
        if (isFirstLoad.current || !configData?.id) return;
        setSyncStatus('saving');
        try {
            const taxa = typeof configData.taxaEntrega === 'string' 
                ? parseFloat(configData.taxaEntrega.replace(/\./g, '').replace(',', '.')) 
                : configData.taxaEntrega;

            await updateConfig({ ...configData, taxaEntrega: taxa || 0 });
            setSyncStatus('synced');
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (error) { setSyncStatus('error'); }
    }, [configData]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const c = await getConfig();
                setConfigData({
                    ...c,
                    taxaEntrega: c.taxaEntrega?.toString().replace('.', ',') || "0,00"
                });
                setTimeout(() => { isFirstLoad.current = false; }, 1000);
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(triggerSave, 1500) as any;
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [configData, triggerSave]);

    const handleChange = (field: string, value: any) => {
        setConfigData((prev: any) => ({ ...prev, [field]: value }));
    };

    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 transition-all dark:text-slate-100 placeholder:text-slate-400";
    const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const tabClasses = (tab: ActiveTab) => `flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`;

    if (isLoading || !configData) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
            <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-black dark:text-slate-100 tracking-tight">Painel de Configurações</h1>
                    <div className="flex items-center gap-2">
                       {syncStatus === 'saving' ? <Loader2 size={12} className="animate-spin text-orange-500" /> : <CloudCheck size={16} className="text-emerald-500" />}
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{syncStatus === 'saving' ? 'Salvando...' : `Salvo ${lastSaved || ''}`}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-6xl mx-auto">
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 overflow-x-auto hide-scrollbar">
                              <button onClick={() => setActiveTab('restaurante')} className={tabClasses('restaurante')}><Building2 size={18} /> Empresa</button>
                              <button onClick={() => setActiveTab('aparencia')} className={tabClasses('aparencia')}><Palette size={18} /> Aparência</button>
                              <button onClick={() => setActiveTab('taxas')} className={tabClasses('taxas')}><Truck size={18} /> Taxas</button>
                              <button onClick={() => setActiveTab('whatsapp')} className={tabClasses('whatsapp')}><MessageSquare size={18} /> WhatsApp</button>
                              <button onClick={() => setActiveTab('impressao')} className={tabClasses('impressao')}><Printer size={18} /> Impressão</button>
                          </div>

                          <div className="p-10">
                              {activeTab === 'restaurante' && <RestauranteTab data={configData} onChange={handleChange} inputClasses={inputClasses} labelClasses={labelClasses} />}
                              
                              {activeTab === 'aparencia' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                  <AparenciaTab data={configData} onChange={handleChange} inputClasses={inputClasses} />
                                  <MobilePreview data={configData} />
                                </div>
                              )}

                              {activeTab === 'taxas' && (
                                <div className="max-w-md space-y-6">
                                  <h3 className={labelClasses}>Taxa de Entrega</h3>
                                  <IMaskInput mask={Number} scale={2} radix="," thousandsSeparator="." padFractionalZeros={true} className={inputClasses} value={configData.taxaEntrega} onAccept={(v) => handleChange('taxaEntrega', v)} />
                                </div>
                              )}

                              {activeTab === 'whatsapp' && (
                                <div className="max-w-md space-y-6">
                                  <h3 className={labelClasses}>Instância Evolution API</h3>
                                  <input className={inputClasses} value={configData.evolutionInstanceName} onChange={e => handleChange('evolutionInstanceName', e.target.value)} />
                                </div>
                              )}

                              {activeTab === 'impressao' && (
                                <div className="max-w-md space-y-6">
                                  <h3 className={labelClasses}>URL Agente de Impressão</h3>
                                  <input className={inputClasses} value={configData.urlAgenteImpressao} onChange={e => handleChange('urlAgenteImpressao', e.target.value)} />
                                  <h3 className={labelClasses}>Nome da Impressora</h3>
                                  <input className={inputClasses} value={configData.nomeImpressora} onChange={e => handleChange('nomeImpressora', e.target.value)} />
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
