import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { FileText, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Relatorios() {
  const [ano, setAno] = useState(new Date().getFullYear())
  const [dadosAnuais, setDadosAnuais] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatorios()
  }, [ano])

  async function fetchRelatorios() {
    setLoading(true)
    try {
      // Simular dados anuais
      const dadosMensais = Array.from({ length: 12 }, (_, i) => ({
        mes: getMonthName(i + 1).substring(0, 3),
        receita: Math.random() * 10000 + 2000,
        despesas: Math.random() * 5000 + 1000,
        lucro: 0,
      }))

      dadosMensais.forEach(d => {
        d.lucro = d.receita - d.despesas
      })

      setDadosAnuais(dadosMensais)

      // Categorias de despesas
      setCategorias([
        { name: 'Aluguel', value: 1200 },
        { name: 'Serviços', value: 800 },
        { name: 'Material', value: 500 },
        { name: 'Marketing', value: 300 },
        { name: 'Impostos', value: 859.20 },
        { name: 'Outros', value: 400 },
      ])
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const receitaTotal = dadosAnuais.reduce((acc, d) => acc + d.receita, 0)
  const despesasTotal = dadosAnuais.reduce((acc, d) => acc + d.despesas, 0)
  const lucroTotal = receitaTotal - despesasTotal

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-sm text-gray-500">Análise detalhada do seu negócio</p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards resumo do ano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Receita Total {ano}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(receitaTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <p className="text-sm text-gray-500">Despesas Total {ano}</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(despesasTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Lucro Líquido {ano}</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(lucroTotal)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita Mensal */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal - {ano}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosAnuais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="receita" fill="#10B981" name="Receita" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lucro por Mês */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Lucro Mensal - {ano}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosAnuais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="lucro"
                stroke="#3B82F6"
                name="Lucro"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Despesas */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorias}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categorias.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Comparativo Receita vs Despesas */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Receita vs Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosAnuais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="receita" fill="#10B981" name="Receita" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margem de lucro */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Margem de Lucro por Mês</h3>
        <div className="space-y-3">
          {dadosAnuais.map(dado => {
            const margem = ((dado.lucro / dado.receita) * 100).toFixed(1)
            return (
              <div key={dado.mes} className="flex items-center gap-4">
                <span className="text-sm font-medium w-10">{dado.mes}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${Math.min(Number(margem), 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">{margem}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
