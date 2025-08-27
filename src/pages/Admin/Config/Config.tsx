import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import { IMaskInput } from 'react-imask';
import 'react-toastify/dist/ReactToastify.css';

import { getConfig, updateConfig } from '../../../services/configService';
import { type UpdateConfigPayload } from '../../../types/interfaces-types';

export default function Config() {
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

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito para buscar as configurações do backend
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configData = await getConfig();
                setId(configData.id);
                setCnpj(configData.cnpj);
                setRazaoSocial(configData.razaoSocial);
                setNomeFantasia(configData.nomeFantasia);
                setCep(configData.cep);
                setTipoLogadouro(configData.tipoLogadouro);
                setLogadouro(configData.logadouro);
                setNumero(configData.numero);
                setQuadra(configData.quadra);
                setLote(configData.lote);
                setBairro(configData.bairro);
                setCidade(configData.cidade);
                setEstado(configData.estado);
                setTelefone(configData.telefone);
                setEmail(configData.email);
                setTaxaEntrega(configData.taxaEntrega.toString());
            } catch (error) {
                console.error("Erro ao buscar configurações:", error);
                toast.error("Erro ao carregar as configurações do sistema.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    function limparNumero(valor: string) {
        return valor.replace(/\D/g, '');
    }

    // Função para buscar dados do CNPJ
    const handleBuscarCNPJ = async () => {
        const cnpjFormatado = limparNumero(cnpj);
        if (cnpjFormatado.length !== 14) {
            toast.error("CNPJ inválido.");
            return;
        }

        try {
            const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjFormatado}`, {
                method: 'GET',
                headers: { "Accept": "*/*" },
            });
            if (!response.ok) {
                toast.error("Erro ao buscar o CNPJ. Verifique o número e tente novamente.");
                return;
            }

            const data = await response.json();

            setCep(data.estabelecimento.cep || "");
            setRazaoSocial(data.razao_social || "");
            setNomeFantasia(data.estabelecimento.nome_fantasia || "");
            setTipoLogadouro(data.estabelecimento.tipo_logradouro || "");
            setLogadouro(data.estabelecimento.logradouro || "");
            setNumero(data.estabelecimento.numero || "");
            setBairro(data.estabelecimento.bairro || "");
            setCidade(data.estabelecimento.cidade.nome || "");
            setEstado(data.estabelecimento.estado.sigla || "");
            setEmail(data.estabelecimento.email || "");
            let telefoneCompleto = data.estabelecimento.ddd1 + data.estabelecimento.telefone1;
            setTelefone(telefoneCompleto || "");

        } catch (error) {
            console.error("Erro ao buscar CNPJ:", error);
            toast.error("Ocorreu um erro ao buscar o CNPJ.");
        }
    };

    // Função para buscar dados do CEP
    const handleBuscarCEP = async () => {
        const cepFormatado = limparNumero(cep);
        if (cepFormatado.length !== 8) {
            toast.error("CEP inválido.");
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);
            const data = await response.json();
            if (data.erro) {
                toast.error("CEP não encontrado.");
                return;
            }
            setLogadouro(data.logradouro || "");
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setEstado(data.uf || "");
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            toast.error("Ocorreu um erro ao buscar o CEP.");
        }
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error("Não foi possível obter o ID da configuração para salvar.");
            return;
        }

        setIsSubmitting(true);

        const updatedData: UpdateConfigPayload = {
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
            taxaEntrega: parseFloat(taxaEntrega),
        };

        try {
            // CORREÇÃO: Chama a função de serviço com o payload, sem o id
            await updateConfig(updatedData);
            toast.success("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            toast.error("Erro ao salvar as configurações.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Configurações do Sistema</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Configurações do Sistema</h1>

                        <form onSubmit={handleSubmit}>
                            {/* Seção: Dados do Restaurante */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Dados do Restaurante</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">CNPJ do Restaurante:</label>
                                        <div className="flex items-center">
                                            <IMaskInput
                                                mask="00.000.000/0000-00"
                                                type="text"
                                                placeholder="Digite o CNPJ"
                                                value={cnpj}
                                                onAccept={(value, mask) => setCnpj(value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleBuscarCNPJ}
                                                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
                                            >
                                                Buscar
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Razão Social:</label>
                                        <input
                                            type="text"
                                            placeholder="Digite o nome"
                                            value={razaoSocial}
                                            onChange={(e) => setRazaoSocial(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Nome Fantasia:</label>
                                        <input
                                            type="text"
                                            placeholder="Digite o nome"
                                            value={nomeFantasia}
                                            onChange={(e) => setNomeFantasia(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Endereço Detalhado */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Endereço Detalhado</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">CEP:</label>
                                        <div className="flex items-center">
                                            <IMaskInput
                                                mask="00000-000"
                                                type="text"
                                                placeholder="00000-000"
                                                value={cep}
                                                onAccept={(value, mask) => setCep(value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleBuscarCEP}
                                                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
                                            >
                                                Buscar
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Tipo do Logradouro:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Rua, Avenida..."
                                            value={tipoLogadouro}
                                            onChange={(e) => setTipoLogadouro(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Logradouro:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Rua, Avenida..."
                                            value={logadouro}
                                            onChange={(e) => setLogadouro(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Número:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 123"
                                            value={numero}
                                            onChange={(e) => setNumero(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Quadra:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 10"
                                            value={quadra}
                                            onChange={(e) => setQuadra(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Lote:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 25"
                                            value={lote}
                                            onChange={(e) => setLote(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Bairro:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Centro"
                                            value={bairro}
                                            onChange={(e) => setBairro(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Cidade:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: São Paulo"
                                            value={cidade}
                                            onChange={(e) => setCidade(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Estado:</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: SP"
                                            value={estado}
                                            onChange={(e) => setEstado(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Contato */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Contato</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">Telefone:</label>
                                        <input
                                            type="text"
                                            placeholder="Digite o telefone"
                                            value={telefone}
                                            onChange={(e) => setTelefone(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Email:</label>
                                        <input
                                            type="email"
                                            placeholder="Digite o email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Taxa de Entrega */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Taxa de Entrega</h2>
                                <div>
                                    <label className="block mb-1 font-medium">Taxa de Entrega:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Digite a taxa de Entrega (ex.: 5.00)"
                                        value={taxaEntrega}
                                        onChange={(e) => setTaxaEntrega(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Botão Salvar */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`bg-green-600 text-white px-6 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}