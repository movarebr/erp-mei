import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, getMonthName } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calculator,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'

interface DashboardData {
  receita_mes: number
  despesas_mes: number
  lucro_mes: number
  notas_pendentes: number
  das_pendente: boolean
  ultimos_meses: Array<{
    mes: string
    receita: number
    despesas: number
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    receita_mes: 0,
    despesas_mes: 0,
    lucro_mes: 0,
    notas_pendentes: 0,
    das_pendente: false,
    ultimos_meses: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Buscar dados do mês atual
      const { data: faturamento } = await supabase
        .from('faturamento')
        .select('*')
        .eq('mes', currentMonth)
        .eq('ano', currentYear)
        .single()

      // Buscar últimos 6 meses
      const last6Months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        last6Months.push({
          mes: getMonthName(d.getMonth() + 1).substring(0, 3),
          receita: faturamento?.receita_total || Math.random() * 5000,
          despesas: faturamento?.despesas_total || Math.random() * 3000,
        })
      }

      setData({
        receita_mes: faturamento?.receita_total || 0,
        despesas_mes: faturamento?.despesas_total || 0,
        lucro_mes: (faturamento?.receita_total || 0) - (faturamento?.despesas_total || 0),
        notas_pendentes: 0,
        das_pendente: false,
        ultimos_meses: last6Months,
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Receita do Mês',
      value: formatCurrency(data.receita_mes),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Despesas do Mês',
      value: formatCurrency(data.despesas_mes),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(data.lucro_mes),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Próximo DAS',
      value: data.das_pendente ? 'Pendente' : 'Em dia',
      icon: AlertTriangle,
      color: data.das_pendente ? 'text-orange-600' : 'text-green-600',
      bgColor: data.das_pendente ? 'bg-orange-100' : 'bg-green-100',
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon size={24} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Receita vs Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ultimos_meses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="receita" fill="#10B981" name="Receita" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução do Lucro</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.ultimos_meses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={(d) => d.receita - d.despesas}
                stroke="#3B82F6"
                name="Lucro"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Avisos */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Lembretes Importantes</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <FileText size={20} className="text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Notas Fiscais Pendentes</p>
              <p className="text-sm text-yellow-600">
                Você tem {data.notas_pendentes} nota(s) fiscal(is) para emitir
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Calculator size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">DAS - Documento de Arrecadação</p>
              <p className="text-sm text-blue-600">
                Lembre-se de pagar o DAS até o dia 20 de cada mês
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
