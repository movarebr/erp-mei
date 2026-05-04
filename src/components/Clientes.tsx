import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Pencil, Trash2, Search, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj?: string
  email?: string
  telefone?: string
  endereco?: string
  created_at: string
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Cliente | null>(null)
  const [form, setForm] = useState({
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    try {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('nome')

      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (editingItem) {
        await supabase.from('clientes').update(form).eq('id', editingItem.id)
      } else {
        await supabase.from('clientes').insert([form])
      }
      setModalOpen(false)
      setEditingItem(null)
      fetchClientes()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await supabase.from('clientes').delete().eq('id', id)
      fetchClientes()
    }
  }

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone?.includes(search)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500">Gerencie seus clientes</p>
        </div>
        <Button onClick={() => {
          setEditingItem(null)
          setForm({ nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '' })
          setModalOpen(true)
        }}>
          <Plus size={16} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map(cliente => (
          <div key={cliente.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingItem(cliente)
                    setForm({
                      nome: cliente.nome,
                      cpf_cnpj: cliente.cpf_cnpj || '',
                      email: cliente.email || '',
                      telefone: cliente.telefone || '',
                      endereco: cliente.endereco || '',
                    })
                    setModalOpen(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{cliente.nome}</h3>
            <div className="space-y-2">
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={14} />
                  <span>{cliente.email}</span>
                </div>
              )}
              {cliente.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} />
                  <span>{cliente.telefone}</span>
                </div>
              )}
              {cliente.cpf_cnpj && (
                <p className="text-xs text-gray-400">
                  {cliente.cpf_cnpj.length === 11 ? 'CPF' : 'CNPJ'}: {cliente.cpf_cnpj}
                </p>
              )}
            </div>
          </div>
        ))}
        {filteredClientes.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CPF/CNPJ</label>
              <Input
                value={form.cpf_cnpj || ''}
                onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })}
                placeholder="Apenas números"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email || ''}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={form.telefone || ''}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Endereço</label>
              <Input
                value={form.endereco || ''}
                onChange={e => setForm({ ...form, endereco: e.target.value })}
                placeholder="Endereço completo"
              />
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
