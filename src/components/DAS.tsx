import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Calculator, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DAS() {
  const [dasList, setDasList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchDAS()
  }, [ano])

  async function fetchDAS() {
    try {
      const { data } = await supabase
        .from('das')
        .select('*')
        .eq('ano', ano)
        .order('mes')

      if (!data || data.length === 0) {
        // Criar registros DAS para todos os meses
        const dasPadrao = Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          ano: ano,
          valor: 71.60, // Valor do DAS MEI em 2024
          data_vencimento: `${ano}-${String(i + 1).padStart(2, '0')}-20`,
          status: i + 1 < new Date().getMonth() + 1 ? 'pendente' : 'pendente',
        }))

        await supabase.from('das').upsert(dasPadrao, { 
          onConflict: 'mes,ano' 
        })
        
        const { data: newData } = await supabase
          .from('das')
          .select('*')
          .eq('ano', ano)
          .order('mes')
        
        setDasList(newData || dasPadrao)
      } else {
        setDasList(data)
      }
    } catch (error) {
      console.error('Erro ao carregar DAS:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePagar(id: string) {
    try {
      await supabase
        .from('das')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString()
        })
        .eq('id', id)
      fetchDAS()
    } catch (error) {
      console.error('Erro ao atualizar DAS:', error)
    }
  }

  const totalPendente = dasList
    .filter(d => d.status === 'pendente' || d.status === 'atrasado')
    .reduce((acc, d) => acc + d.valor, 0)

  const totalPago = dasList
    .filter(d => d.status === 'pago')
    .reduce((acc, d) => acc + d.valor, 0)

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pendente: { icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50', label: 'Pendente' },
    pago: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Pago' },
    atrasado: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Atrasado' },
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DAS - MEI</h2>
          <p className="text-sm text-gray-500">Documento de Arrecadação do Simples Nacional</p>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className="w-24"
          />
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Gerar DAS
          </Button>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Valor Mensal</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(71.60)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500">Total Pendente</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Total Pago em {ano}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Lista de DAS */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Mês</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Vencimento</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Ação</th>
              </tr>
            </thead>
            <tbody>
              {dasList.map(das => {
                const status = statusConfig[das.status]
                const StatusIcon = status.icon
                
                return (
                  <tr key={`${das.mes}-${das.ano}`} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium">
                      {getMonthName(das.mes)}/{das.ano}
                    </td>
                    <td className="p-4 text-sm">
                      {formatDate(das.data_vencimento)}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">
                      {formatCurrency(das.valor)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {(das.status === 'pendente' || das.status === 'atrasado') && (
                          <Button
                            size="sm"
                            onClick={() => handlePagar(das.id)}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                        {das.status === 'pago' && (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Pago em {formatDate(das.data_pagamento)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações importantes */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações Importantes</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• O DAS deve ser pago até o dia 20 de cada mês</li>
          <li>• O valor atual do DAS MEI é de R$ 71,60 (INSS + ISS/ICMS)</li>
          <li>• O pagamento pode ser feito pelo App MEI, site da Receita ou bancos autorizados</li>
          <li>• Mantenha os comprovantes de pagamento por pelo menos 5 anos</li>
          <li>• Atrasos geram multa de 0,33% ao dia (máximo 20%) + juros Selic</li>
        </ul>
      </div>
    </div>
  )
}
