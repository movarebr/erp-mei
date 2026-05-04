import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface NotaFiscal {
  id: string
  numero: string
  cliente_id: string
  cliente_nome: string
  valor: number
  data_emissao: string
  descricao: string
  status: 'pendente' | 'emitida' | 'cancelada'
}

export default function NotasFiscais() {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NotaFiscal | null>(null)
  const [form, setForm] = useState({
    numero: '',
    cliente_nome: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    descricao: '',
    status: 'pendente' as 'pendente' | 'emitida' | 'cancelada',
  })

  useEffect(() => {
    fetchNotas()
  }, [])

  async function fetchNotas() {
    try {
      const { data } = await supabase
        .from('notas_fiscais')
        .select('*')
        .order('data_emissao', { ascending: false })

      setNotas(data || [])
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (editingItem) {
        await supabase.from('notas_fiscais').update(form).eq('id', editingItem.id)
      } else {
        await supabase.from('notas_fiscais').insert([form])
      }
      setModalOpen(false)
      setEditingItem(null)
      fetchNotas()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      await supabase.from('notas_fiscais').delete().eq('id', id)
      fetchNotas()
    }
  }

  const totalNotas = notas.reduce((acc, n) => acc + n.valor, 0)
  const pendentes = notas.filter(n => n.status === 'pendente').length
  const emitidas = notas.filter(n => n.status === 'emitida').length

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    emitida: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notas Fiscais</h2>
          <p className="text-sm text-gray-500">Gerencie suas notas fiscais</p>
        </div>
        <Button onClick={() => {
          setEditingItem(null)
          setForm({
            numero: '',
            cliente_nome: '',
            valor: 0,
            data_emissao: new Date().toISOString().split('T')[0],
            descricao: '',
            status: 'pendente',
          })
          setModalOpen(true)
        }}>
          <Plus size={16} className="mr-2" />
          Nova Nota Fiscal
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Total em Notas</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalNotas)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Notas Emitidas</p>
          <p className="text-2xl font-bold text-green-600">{emitidas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
        </div>
      </div>

      {/* Lista de notas */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Nº Nota</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Descrição</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notas.map(nota => (
                <tr key={nota.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium">{nota.numero || '---'}</td>
                  <td className="p-4 text-sm">{formatDate(nota.data_emissao)}</td>
                  <td className="p-4 text-sm">{nota.cliente_nome}</td>
                  <td className="p-4 text-sm">{nota.descricao}</td>
                  <td className="p-4 text-sm text-right font-medium">
                    {formatCurrency(nota.valor)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[nota.status]}`}>
                        {nota.status.charAt(0).toUpperCase() + nota.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(nota)
                          setForm(nota)
                          setModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(nota.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notas.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Nenhuma nota fiscal cadastrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Número da Nota</label>
              <Input
                value={form.numero}
                onChange={e => setForm({ ...form, numero: e.target.value })}
                placeholder="Número da NFS-e"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Input
                value={form.cliente_nome}
                onChange={e => setForm({ ...form, cliente_nome: e.target.value })}
                placeholder="Nome do cliente"
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
              <label className="text-sm font-medium">Data de Emissão</label>
              <Input
                type="date"
                value={form.data_emissao}
                onChange={e => setForm({ ...form, data_emissao: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição do Serviço</label>
              <Input
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição do serviço prestado"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              >
                <option value="pendente">Pendente</option>
                <option value="emitida">Emitida</option>
                <option value="cancelada">Cancelada</option>
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
