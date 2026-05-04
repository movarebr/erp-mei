export interface Client {
  id: string
  nome: string
  cpf_cnpj?: string
  email?: string
  telefone?: string
  endereco?: string
  created_at: string
}

export interface NotaFiscal {
  id: string
  numero: string
  cliente_id: string
  cliente_nome: string
  valor: number
  data_emissao: string
  descricao: string
  status: 'pendente' | 'emitida' | 'cancelada'
  pdf_url?: string
}

export interface Faturamento {
  id: string
  mes: number
  ano: number
  receita_total: number
  despesas_total: number
  lucro_liquido: number
  notas_emitidas: number
}

export interface Despesa {
  id: string
  descricao: string
  valor: number
  data: string
  categoria: string
  comprovante_url?: string
  recorrente: boolean
}

export interface DAS {
  id: string
  mes: number
  ano: number
  valor: number
  data_vencimento: string
  status: 'pendente' | 'pago' | 'atrasado'
  comprovante_url?: string
}

export interface Categoria {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
}
