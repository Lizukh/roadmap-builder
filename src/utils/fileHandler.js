// Descargar roadmap como archivo .roadmap
export function downloadRoadmap(roadmap) {
    const content = JSON.stringify(roadmap, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${roadmap.title.replace(/\s+/g, '-').toLowerCase()}.roadmap`
    a.click()
    URL.revokeObjectURL(url)
}

// Subir un archivo .roadmap y devolver el objeto
export function uploadRoadmap(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)
                resolve(data)
            } catch {
                reject(new Error('Archivo inválido'))
            }
        }
        reader.readAsText(file)
    })
}