import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Despesa {
  id: string
  descricao: string
  valor: number
  data: string
  categoria: string
  recorrente: boolean
}

const categorias = [
  'Aluguel',
  'Água',
  'Luz',
  'Internet',
  'Telefone',
  'Material de Escritório',
  'Marketing',
  'Transporte',
  'Alimentação',
  'Impostos',
  'Serviços Terceiros',
  'Outros',
]

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Despesa | null>(null)
  const [form, setForm] = useState({
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    categoria: 'Outros',
    recorrente: false,
  })

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => {
    fetchDespesas()
  }, [selectedMonth, selectedYear])

  async function fetchDespesas() {
    try {
      const { data } = await supabase
        .from('despesas')
        .select('*')
        .gte('data', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lte('data', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`)
        .order('data', { ascending: false })

      setDespesas(data || [])
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (editingItem) {
        await supabase.from('despesas').update(form).eq('id', editingItem.id)
      } else {
        await supabase.from('despesas').insert([form])
      }
      setModalOpen(false)
      setEditingItem(null)
      fetchDespesas()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('despesas').delete().eq('id', id)
      fetchDespesas()
    }
  }

  const totalMes = despesas.reduce((acc, d) => acc + d.valor, 0)

  // Agrupar por categoria
  const despesasPorCategoria = categorias.map(cat => ({
    categoria: cat,
    total: despesas.filter(d => d.categoria === cat).reduce((acc, d) => acc + d.valor, 0),
  })).filter(c => c.total > 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Despesas</h2>
          <p className="text-sm text-gray-500">Controle seus gastos mensais</p>
        </div>
        <Button onClick={() => {
          setEditingItem(null)
          setForm({
            descricao: '',
            valor: 0,
            data: new Date().toISOString().split('T')[0],
            categoria: 'Outros',
            recorrente: false,
          })
          setModalOpen(true)
        }}>
          <Plus size={16} className="mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="w-24"
        />
      </div>

      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Total de Despesas em {getMonthName(selectedMonth)}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalMes)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Despesas por categoria */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Por Categoria</h3>
          <div className="space-y-3">
            {despesasPorCategoria.map(item => (
              <div key={item.categoria} className="flex justify-between items-center">
                <span className="text-sm">{item.categoria}</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
            {despesasPorCategoria.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma despesa este mês</p>
            )}
          </div>
        </div>

        {/* Lista de despesas */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Descrição</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Categoria</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Valor</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map(despesa => (
                  <tr key={despesa.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-sm">{formatDate(despesa.data)}</td>
                    <td className="p-4 text-sm font-medium">
                      {despesa.descricao}
                      {despesa.recorrente && (
                        <span className="ml-2 text-xs text-blue-600">(Recorrente)</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {despesa.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-red-600">
                      {formatCurrency(despesa.valor)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(despesa)
                            setForm(despesa)
                            setModalOpen(true)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(despesa.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {despesas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Nenhuma despesa encontrada neste mês
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Despesa' : 'Nova Despesa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Aluguel do escritório"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <select
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.recorrente}
                onChange={e => setForm({ ...form, recorrente: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm font-medium">Despesa Recorrente</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
