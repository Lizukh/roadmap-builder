import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RoadmapProvider } from './context/RoadmapContext'
import Home from './pages/Home'
import Editor from './pages/Editor'

function App() {
  return (
    <RoadmapProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </BrowserRouter>
    </RoadmapProvider>
  )
}

export default App