import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Receita {
  id: string
  descricao: string
  valor: number
  data: string
  cliente: string
  forma_pagamento: string
  categoria: string
}

export default function Faturamento() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Receita | null>(null)
  const [form, setForm] = useState({
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    forma_pagamento: 'PIX',
    categoria: 'Serviços',
  })

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => {
    fetchReceitas()
  }, [selectedMonth, selectedYear])

  async function fetchReceitas() {
    try {
      const { data } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lte('data', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`)
        .order('data', { ascending: false })

      setReceitas(data || [])
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (editingItem) {
        await supabase.from('receitas').update(form).eq('id', editingItem.id)
      } else {
        await supabase.from('receitas').insert([form])
      }
      setModalOpen(false)
      setEditingItem(null)
      fetchReceitas()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('receitas').delete().eq('id', id)
      fetchReceitas()
    }
  }

  const totalMes = receitas.reduce((acc, r) => acc + r.valor, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faturamento</h2>
          <p className="text-sm text-gray-500">Controle suas receitas mensais</p>
        </div>
        <Button onClick={() => {
          setEditingItem(null)
          setForm({
            descricao: '',
            valor: 0,
            data: new Date().toISOString().split('T')[0],
            cliente: '',
            forma_pagamento: 'PIX',
            categoria: 'Serviços',
          })
          setModalOpen(true)
        }}>
          <Plus size={16} className="mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Filtro de mês */}
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

      {/* Total do mês */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Total de Receitas em {getMonthName(selectedMonth)}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalMes)}</p>
      </div>

      {/* Lista de receitas */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Descrição</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Pagamento</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {receitas.map(receita => (
                <tr key={receita.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{formatDate(receita.data)}</td>
                  <td className="p-4 text-sm font-medium">{receita.descricao}</td>
                  <td className="p-4 text-sm">{receita.cliente}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {receita.forma_pagamento}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-medium text-green-600">
                    {formatCurrency(receita.valor)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(receita)
                          setForm(receita)
                          setModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(receita.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {receitas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma receita encontrada neste mês
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Consultoria mensal"
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
              <label className="text-sm font-medium">Cliente</label>
              <Input
                value={form.cliente}
                onChange={e => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <select
                value={form.forma_pagamento}
                onChange={e => setForm({ ...form, forma_pagamento: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              >
                <option>PIX</option>
                <option>Transferência</option>
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>Boleto</option>
              </select>
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
