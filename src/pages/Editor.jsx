import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoadmaps } from '../context/RoadmapContext'
import { downloadRoadmap } from '../utils/fileHandler'
import { v4 as uuidv4 } from 'uuid'

export default function Editor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { roadmaps, updateRoadmap } = useRoadmaps()
    const roadmap = roadmaps.find(r => r.id === id)

    const [editandoTitulo, setEditandoTitulo] = useState(false)
    const [editandoMantra, setEditandoMantra] = useState(false)

    if (!roadmap) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <p className="mono gris">Roadmap no encontrado.</p>
                <button className="btn-japones" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Volver
                </button>
            </div>
        )
    }

    function setTitle(val) { updateRoadmap(id, { title: val }) }
    function setMantra(val) { updateRoadmap(id, { mantra: val }) }

    function addPhase() {
        const nueva = {
            id: uuidv4(), title: 'Nueva fase', time: '',
            order: roadmap.phases.length + 1, open: true, items: []
        }
        updateRoadmap(id, { phases: [...roadmap.phases, nueva] })
    }

    function updatePhase(phaseId, changes) {
        updateRoadmap(id, {
            phases: roadmap.phases.map(p => p.id === phaseId ? { ...p, ...changes } : p)
        })
    }

    function deletePhase(phaseId) {
        updateRoadmap(id, { phases: roadmap.phases.filter(p => p.id !== phaseId) })
    }

    function togglePhase(phaseId) {
        updatePhase(phaseId, { open: !roadmap.phases.find(p => p.id === phaseId).open })
    }

    function addItem(phaseId) {
        const phase = roadmap.phases.find(p => p.id === phaseId)
        updatePhase(phaseId, { items: [...phase.items, { id: uuidv4(), text: 'Nuevo elemento', done: false }] })
    }

    function updateItem(phaseId, itemId, changes) {
        const phase = roadmap.phases.find(p => p.id === phaseId)
        updatePhase(phaseId, {
            items: phase.items.map(i => i.id === itemId ? { ...i, ...changes } : i)
        })
    }

    function deleteItem(phaseId, itemId) {
        const phase = roadmap.phases.find(p => p.id === phaseId)
        updatePhase(phaseId, { items: phase.items.filter(i => i.id !== itemId) })
    }

    function progreso(phase) {
        if (phase.items.length === 0) return null
        const done = phase.items.filter(i => i.done).length
        return `${done}/${phase.items.length}`
    }

    return (
        <div>
            {/* Topbar sticky */}
            <div className="editor-topbar">
                <button className="btn-japones" onClick={() => navigate('/')}>
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Volver
                </button>
                <span className="mono gris" style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}>
                    ROADMAP BUILDER
                </span>
                <button className="btn-japones dorado" onClick={() => downloadRoadmap(roadmap)}>
                    <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
                    Descargar .roadmap
                </button>
            </div>

            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 80px' }}>

                {/* Header estilo japonés */}
                <div className="editor-header">
                    <span className="kanji-bg">道</span>
                    <p className="subtitulo-jp">— MI ROADMAP —</p>

                    {editandoTitulo ? (
                        <input
                            autoFocus
                            value={roadmap.title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={() => setEditandoTitulo(false)}
                            onKeyDown={e => e.key === 'Enter' && setEditandoTitulo(false)}
                            style={{
                                fontSize: '2.8rem', fontFamily: 'var(--font-serif)', fontWeight: '700',
                                background: 'transparent', border: 'none', borderBottom: '2px solid var(--rojo)',
                                outline: 'none', textAlign: 'center', width: '80%', color: 'var(--tinta)',
                                display: 'block', margin: '0 auto 10px'
                            }}
                        />
                    ) : (
                        <h1 onClick={() => setEditandoTitulo(true)} title="Clic para editar">
                            {roadmap.title.split(' ').map((word, i) =>
                                i === roadmap.title.split(' ').length - 1
                                    ? <span key={i} className="rojo">{word}</span>
                                    : <span key={i}>{word} </span>
                            )}
                        </h1>
                    )}

                    <p className="autor-line">
                        Lizukh · {new Date(roadmap.created_at).toLocaleDateString('es', { year: 'numeric', month: 'long' })}
                    </p>

                    <div className="sello" title="Roadmap activo">
                        <i className="fas fa-pen-nib"></i>
                    </div>
                </div>

                {/* Mantra editable */}
                <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '-24px' }}>
                    {editandoMantra ? (
                        <input
                            autoFocus
                            value={roadmap.mantra}
                            onChange={e => setMantra(e.target.value)}
                            onBlur={() => setEditandoMantra(false)}
                            onKeyDown={e => e.key === 'Enter' && setEditandoMantra(false)}
                            placeholder="Tu mantra o subtítulo..."
                            style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: 'transparent',
                                border: 'none', borderBottom: '1px solid var(--dorado)', outline: 'none',
                                textAlign: 'center', width: '60%', color: 'var(--dorado)', letterSpacing: '0.08em'
                            }}
                        />
                    ) : (
                        <p
                            className="mono dorado"
                            style={{ fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.08em' }}
                            onClick={() => setEditandoMantra(true)}
                        >
                            {roadmap.mantra || '+ Agregar mantra'}
                        </p>
                    )}
                </div>

                {/* Fases */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {roadmap.phases.map((phase, idx) => (
                        <PhaseBlock
                            key={phase.id}
                            phase={phase}
                            index={idx}
                            onToggle={() => togglePhase(phase.id)}
                            onUpdatePhase={(changes) => updatePhase(phase.id, changes)}
                            onDeletePhase={() => { if (confirm(`¿Eliminar la fase "${phase.title}"?`)) deletePhase(phase.id) }}
                            onAddItem={() => addItem(phase.id)}
                            onUpdateItem={(itemId, changes) => updateItem(phase.id, itemId, changes)}
                            onDeleteItem={(itemId) => deleteItem(phase.id, itemId)}
                            progreso={progreso(phase)}
                        />
                    ))}
                </div>

                {/* Agregar fase */}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button className="btn-japones rojo" onClick={addPhase}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                        Agregar fase
                    </button>
                </div>

                {/* Footer con mantra */}
                {roadmap.mantra && (
                    <div className="mantra-footer">
                        <p className="mantra-jp">継続は力なり</p>
                        <p className="mantra-texto">{roadmap.mantra} — Lizukh</p>
                    </div>
                )}

            </div>
        </div>
    )
}

function PhaseBlock({ phase, index, onToggle, onUpdatePhase, onDeletePhase, onAddItem, onUpdateItem, onDeleteItem, progreso }) {
    const [editTitle, setEditTitle] = useState(false)
    const [editTime, setEditTime] = useState(false)

    return (
        <div className="phase-block">
            <div className="phase-header" onClick={onToggle}>
                <span className="phase-number">FASE {String(index + 1).padStart(2, '0')}</span>

                <div style={{ flex: 1 }}>
                    {editTitle ? (
                        <input
                            autoFocus
                            value={phase.title}
                            onChange={e => onUpdatePhase({ title: e.target.value })}
                            onBlur={() => setEditTitle(false)}
                            onKeyDown={e => e.key === 'Enter' && setEditTitle(false)}
                            onClick={e => e.stopPropagation()}
                            style={{
                                fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '700',
                                background: 'transparent', border: 'none', borderBottom: '1px solid var(--rojo)',
                                outline: 'none', width: '100%', color: 'var(--tinta)'
                            }}
                        />
                    ) : (
                        <h3
                            style={{ fontSize: '1.2rem', margin: 0, cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); setEditTitle(true) }}
                        >
                            {phase.title}
                        </h3>
                    )}

                    {editTime ? (
                        <input
                            autoFocus
                            value={phase.time}
                            onChange={e => onUpdatePhase({ time: e.target.value })}
                            onBlur={() => setEditTime(false)}
                            onKeyDown={e => e.key === 'Enter' && setEditTime(false)}
                            onClick={e => e.stopPropagation()}
                            placeholder="Período de tiempo..."
                            style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'transparent',
                                border: 'none', borderBottom: '1px solid var(--dorado)', outline: 'none',
                                color: 'var(--dorado)', letterSpacing: '0.08em', marginTop: '4px', width: '100%'
                            }}
                        />
                    ) : (
                        <p
                            className="mono dorado"
                            style={{ fontSize: '0.7rem', margin: '4px 0 0', letterSpacing: '0.08em', cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); setEditTime(true) }}
                        >
                            {phase.time || '+ Período de tiempo'}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {progreso && (
                        <span className="mono gris" style={{ fontSize: '0.7rem' }}>{progreso}</span>
                    )}
                    <button
                        onClick={e => { e.stopPropagation(); onDeletePhase() }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gris)', padding: '4px' }}
                    >
                        <i className="fas fa-xmark"></i>
                    </button>
                    <i
                        className={`fas ${phase.open ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                        style={{ color: 'var(--gris)', fontSize: '0.85rem' }}
                    ></i>
                </div>
            </div>

            {phase.open && (
                <div className="phase-content">
                    {phase.items.map(item => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            onToggle={() => onUpdateItem(item.id, { done: !item.done })}
                            onUpdateText={(text) => onUpdateItem(item.id, { text })}
                            onDelete={() => onDeleteItem(item.id)}
                        />
                    ))}
                    <button
                        className="btn-japones"
                        style={{ fontSize: '0.7rem', padding: '6px 14px', marginTop: '12px' }}
                        onClick={onAddItem}
                    >
                        <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
                        Elemento
                    </button>
                </div>
            )}
        </div>
    )
}

function ItemRow({ item, onToggle, onUpdateText, onDelete }) {
    const [editando, setEditando] = useState(false)

    return (
        <div className={`roadmap-item ${item.done ? 'done' : ''}`}>
            <input type="checkbox" checked={item.done} onChange={onToggle} />
            {editando ? (
                <input
                    autoFocus
                    value={item.text}
                    onChange={e => onUpdateText(e.target.value)}
                    onBlur={() => setEditando(false)}
                    onKeyDown={e => e.key === 'Enter' && setEditando(false)}
                    style={{
                        flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                        background: 'transparent', border: 'none', borderBottom: '1px solid var(--borde)',
                        outline: 'none', color: 'var(--tinta)'
                    }}
                />
            ) : (
                <span
                    style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', cursor: 'pointer' }}
                    onClick={() => setEditando(true)}
                >
                    {item.text}
                </span>
            )}
            <button
                onClick={onDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gris)', padding: '0 4px' }}
            >
                <i className="fas fa-xmark"></i>
            </button>
        </div>
    )
}