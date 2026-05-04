import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout />
      <Toaster position="top-right" richColors />
    </Router>
  )
}

export default App
