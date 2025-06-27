import api from "./apiService";

//função para criar uma nova situação de pedido
export async function createSituacaoPedido(situacaoPedido: {nome: string,descricao:string,pedido_id:number}){
    const response = await api.post('/situacao-pedido', situacaoPedido)
    return response.data
}

//função para buscar todas as situações de pedidos
export async function getAllSituacaoPedidos(){
    const response = await api.get('/situacao-pedido')
    return response.data
}

//função para buscar situação de pedido pelo ID
export async function getSituacaoPedidoById(id:number){
    const response = await api.get(`/situacao-pedido/${id}`)
    return response.data
}

//função para atualizar situação de pedido
export async function updateSituacaoPedido(id:number, situacaoPedido: {nome: string,descricao:string,pedido_id:number}){
    const response = await api.put(`/situacao-pedido/${id}`, situacaoPedido)
    return response.data
}

//função para deletar situação de pedido
export async function deleteSituacaoPedido(id:number){
    const response = await api.delete(`/situacao-pedido/${id}`)
    return response.data
}