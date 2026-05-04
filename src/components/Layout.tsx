import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Users,
  FileText,
  Calculator,
  BarChart3,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Dashboard from './Dashboard'
import Faturamento from './Faturamento'
import Despesas from './Despesas'
import Clientes from './Clientes'
import NotasFiscais from './NotasFiscais'
import DAS from './DAS'
import Relatorios from './Relatorios'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/faturamento', label: 'Faturamento', icon: TrendingUp },
  { path: '/despesas', label: 'Despesas', icon: Receipt },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/notas-fiscais', label: 'Notas Fiscais', icon: FileText },
  { path: '/das', label: 'DAS', icon: Calculator },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">ERP MEI</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h1 className="text-xl font-bold text-primary mb-6">ERP MEI</h1>
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">ERP MEI</h1>
            <p className="text-sm text-gray-500 mt-1">Gestão Simplificada</p>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">MEI Ativo</p>
                <p className="text-xs text-gray-500">CNPJ: **.*****/0001-**</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faturamento" element={<Faturamento />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/notas-fiscais" element={<NotasFiscais />} />
            <Route path="/das" element={<DAS />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
