const KEY = 'roadmaps_data'

export function getRoadmaps() {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
}

export function saveRoadmaps(roadmaps) {
    localStorage.setItem(KEY, JSON.stringify(roadmaps))
}