// Em um arquivo como src/services/evolutionApiService.ts

import axios, { AxiosError } from "axios";


interface EvolutionInstanceConnection {
  pairingCode: string | null;
  code: string;
  base64: string; // Contém a string da imagem do QR Code em base64
  count: number;
}

export interface EvolutionConnectionParams {
  serverUrl: string;
  instanceName: string;
  apikey: string;
}

export async function connectInstance(
  params: EvolutionConnectionParams
): Promise<EvolutionInstanceConnection | null> {
  const { serverUrl, instanceName, apikey } = params;

  // Validação de parâmetros (ainda útil para verificações em tempo de execução)
  if (!serverUrl || !serverUrl.startsWith("http")) {
    console.error("❌ URL do servidor inválida. Verifique a variável de ambiente.");
    return null;
  }
  if (!instanceName) {
    console.error("❌ Nome da instância inválido.");
    return null;
  }
  if (!apikey) {
    console.error("❌ API Key inválida.");
    return null;
  }

  const endpoint = `${serverUrl}/instance/connect/${instanceName}`;

  try {
    // Usamos o tipo genérico no axios para que `response.data` já venha tipado corretamente.
    const response = await axios.get<EvolutionInstanceConnection>(endpoint, {
      headers: {
        "apikey": apikey,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Conexão com a instância bem-sucedida:", response.data);
    return response.data;

  } catch (error: unknown) {
    // Tratamento de erro mais robusto e tipado
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        "❌ Erro de API ao conectar à instância:",
        axiosError.response?.data || axiosError.message
      );
    } else {
      console.error(
        "❌ Ocorreu um erro inesperado:",
        (error as Error).message
      );
    }
    return null;
  }
}