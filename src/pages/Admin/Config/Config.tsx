import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";

export default function Config() {
    // Estados dos campos
    const [cnpj, setCnpj] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [nomeFantasia, setNomeFantasia] = useState("")
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
    const [taxaFrete, setTaxaFrete] = useState("");

    function limparNumero(valor:any) {
        return valor.replace(/\D/g, '');
    }

    // Função para buscar dados do CNPJ
    const handleBuscarCNPJ = async () => {

        const cnpjFormatado = await limparNumero(cnpj)

        if (cnpjFormatado.length !== 14) {
            alert("CNPJ inválido.");
            return;
        }

        try {
            const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjFormatado}`, {
                method: 'GET',
                headers: {
                    "Accept": "*/*"
                },
            });
            if (!response.ok) {
                alert("Erro ao buscar o CNPJ. Verifique o número e tente novamente.");
                return;
            }

            const data = await response.json();
            console.log(data)

            setRazaoSocial(data.razao_social || "");
            setNomeFantasia(data.estabelecimento.nome_fantasia)
            setCep(data.estabelecimento.cep)
            setTipoLogadouro(data.estabelecimento.tipo_logradouro || "")
            setLogadouro(data.estabelecimento.logradouro || "");
            setNumero(data.estabelecimento.numero || "")
            setBairro(data.estabelecimento.bairro || "");
            setCidade(data.estabelecimento.cidade.nome || "");
            setEstado(data.estabelecimento.estado.sigla || "");
            setEmail(data.estabelecimento.email || "")
            let telefoneCompleto = data.estabelecimento.ddd1 + data.estabelecimento.telefone1
            setTelefone(telefoneCompleto || "")

        } catch (error) {
            console.error("Erro ao buscar CNPJ:", error);
            alert("Ocorreu um erro ao buscar o CNPJ.");
        }
    };

    // Função para buscar dados do CEP
    const handleBuscarCEP = async () => {

        const cepFormatado = await limparNumero(cep)

        if (cepFormatado.length !== 8) {
            alert("CEP inválido.");
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);
            const data = await response.json();
            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }
            setLogadouro(data.logradouro || "");
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setEstado(data.uf || "");
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Ocorreu um erro ao buscar o CEP.");
        }
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dadosConfig = {
            cnpj,
            razaoSocial,
            nomeFantasia,
            endereco: {
                cep,
                logadouro,
                numero,
                quadra,
                lote,
                bairro,
                cidade,
                estado,
            },
            contato: {
                telefone,
                email,
            },
            taxaFrete,
        };

        console.log("Dados enviados:", dadosConfig);

        // Aqui você pode enviar os dados para o backend com fetch ou axios
        // ...
    };

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
                                            <input
                                                type="text"
                                                placeholder="Digite o CNPJ"
                                                value={cnpj}
                                                onChange={(e) => setCnpj(e.target.value)}
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
                                            <input
                                                type="text"
                                                placeholder="Digite o CEP"
                                                value={cep}
                                                onChange={(e) => setCep(e.target.value)}
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
                                    {[
                                        { label: "Tipo do Logadouro", value: tipoLogadouro, setter: setTipoLogadouro },
                                        { label: "Logadouro", value: logadouro, setter: setLogadouro },
                                        { label: "Número", value: numero, setter: setNumero },
                                        { label: "Quadra", value: quadra, setter: setQuadra },
                                        { label: "Lote", value: lote, setter: setLote },
                                        { label: "Bairro", value: bairro, setter: setBairro },
                                        { label: "Cidade", value: cidade, setter: setCidade },
                                        { label: "Estado", value: estado, setter: setEstado },
                                    ].map((field) => (
                                        <div key={field.label}>
                                            <label className="block mb-1 font-medium">{field.label}:</label>
                                            <input
                                                type="text"
                                                placeholder={`Digite ${field.label.toLowerCase()}`}
                                                value={field.value}
                                                onChange={(e) => field.setter(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    ))}
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

                            {/* Seção: Taxa de Frete */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Taxa de Frete</h2>
                                <div>
                                    <label className="block mb-1 font-medium">Taxa de Frete:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Digite a taxa de frete (ex.: 5.00)"
                                        value={taxaFrete}
                                        onChange={(e) => setTaxaFrete(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Botão Salvar */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
