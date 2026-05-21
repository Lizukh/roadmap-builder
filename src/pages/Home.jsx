import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoadmaps } from '../context/RoadmapContext'
import { uploadRoadmap } from '../utils/fileHandler'

export default function Home() {
    const { roadmaps, createRoadmap, deleteRoadmap, importRoadmap } = useRoadmaps()
    const [titulo, setTitulo] = useState('')
    const [creando, setCreando] = useState(false)
    const navigate = useNavigate()
    const fileRef = useRef()

    function handleCrear() {
        if (!titulo.trim()) return
        const id = createRoadmap(titulo.trim())
        setTitulo('')
        setCreando(false)
        navigate(`/editor/${id}`)
    }

    async function handleImportar(e) {
        const file = e.target.files[0]
        if (!file) return
        try {
            const data = await uploadRoadmap(file)
            const id = importRoadmap(data)
            navigate(`/editor/${id}`)
        } catch {
            alert('Archivo inválido. Asegúrate de subir un archivo .roadmap')
        }
    }

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <p className="mono gris" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '8px' }}>
                    ROADMAP BUILDER
                </p>
                <h1 style={{ fontSize: '2.4rem', fontWeight: '700' }}>
                    Mis <span className="rojo">Roadmaps</span>
                </h1>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
                <button className="btn-japones" onClick={() => setCreando(!creando)}>
                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                    Nuevo roadmap
                </button>
                <button className="btn-japones dorado" onClick={() => fileRef.current.click()}>
                    <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
                    Importar .roadmap
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".roadmap"
                    style={{ display: 'none' }}
                    onChange={handleImportar}
                />
            </div>

            {creando && (
                <div style={{
                    background: 'var(--papel2)',
                    border: '1px solid var(--borde)',
                    borderLeft: '4px solid var(--rojo)',
                    padding: '20px 24px',
                    marginBottom: '32px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Nombre del roadmap..."
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCrear()}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--borde)',
                            padding: '6px 0',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1rem',
                            color: 'var(--tinta)',
                            outline: 'none'
                        }}
                    />
                    <button className="btn-japones rojo" onClick={handleCrear}>Crear</button>
                    <button className="btn-japones" onClick={() => setCreando(false)}>Cancelar</button>
                </div>
            )}

            {roadmaps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gris)' }}>
                    <p className="mono" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                        NO HAY ROADMAPS AÚN
                    </p>
                    <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                        Crea uno nuevo o importa un archivo .roadmap
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {roadmaps.map(rm => (
                        <div key={rm.id} className="roadmap-card" onClick={() => navigate(`/editor/${rm.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p className="fase-badge">
                                        {rm.phases.length} fase{rm.phases.length !== 1 ? 's' : ''} · {new Date(rm.created_at).toLocaleDateString('es')}
                                    </p>
                                    <h2>{rm.title}</h2>
                                    {rm.mantra && <p className="mantra">{rm.mantra}</p>}
                                </div>
                                <button
                                    className="btn-japones"
                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                    onClick={e => {
                                        e.stopPropagation()
                                        if (confirm(`¿Eliminar "${rm.title}"?`)) deleteRoadmap(rm.id)
                                    }}
                                >
                                    <i className="fas fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}