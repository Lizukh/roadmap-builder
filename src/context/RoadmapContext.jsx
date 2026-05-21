import { createContext, useContext, useState, useEffect } from 'react'
import { getRoadmaps, saveRoadmaps } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const RoadmapContext = createContext()

export function RoadmapProvider({ children }) {
    // ✅ Lazy initializer — evita el warning de useEffect + setState
    const [roadmaps, setRoadmaps] = useState(() => getRoadmaps())

    // Guardar en localStorage cada vez que cambia
    useEffect(() => {
        saveRoadmaps(roadmaps)
    }, [roadmaps])

    function createRoadmap(title) {
        const nuevo = {
            id: uuidv4(),
            title: title || 'Mi Roadmap',
            mantra: '',
            created_at: new Date().toISOString(),
            phases: []
        }
        setRoadmaps(prev => [...prev, nuevo])
        return nuevo.id
    }

    function updateRoadmap(id, changes) {
        setRoadmaps(prev =>
            prev.map(r => r.id === id ? { ...r, ...changes } : r)
        )
    }

    function deleteRoadmap(id) {
        setRoadmaps(prev => prev.filter(r => r.id !== id))
    }

    function importRoadmap(data) {
        const importado = { ...data, id: uuidv4() }
        setRoadmaps(prev => [...prev, importado])
        return importado.id
    }

    return (
        <RoadmapContext.Provider value={{
            roadmaps,
            createRoadmap,
            updateRoadmap,
            deleteRoadmap,
            importRoadmap
        }}>
            {children}
        </RoadmapContext.Provider>
    )
}

// ✅ Hook separado — evita el warning de fast refresh
export function useRoadmaps() {
    return useContext(RoadmapContext)
}