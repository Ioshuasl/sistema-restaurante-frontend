
import axios, { AxiosError } from "axios";

interface EvolutionInstanceConnection {
  pairingCode: string | null;
  code: string;
  base64: string; 
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

  if (!serverUrl || !serverUrl.startsWith("http")) {
    console.error("URL do servidor inválida.");
    return null;
  }
  if (!instanceName) return null;

  const endpoint = `${serverUrl}/instance/connect/${instanceName}`;

  try {
    const response = await axios.get<EvolutionInstanceConnection>(endpoint, {
      headers: {
        "apikey": apikey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: unknown) {
    // Fix: Cast error to AxiosError after verifying with isAxiosError to resolve property access on 'unknown'
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Erro Evolution API:", axiosError.response?.data || axiosError.message);
    }
    return null;
  }
}