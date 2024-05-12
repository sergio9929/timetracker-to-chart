export function convertDuration(seconds: number, time_unit: TimeUnit = 'h'): number {
    switch (time_unit) {
        case 'h':
            return seconds / 60 / 60
        case 'm':
            return seconds / 60
        case 's':
        default:
            return seconds
    }
}

export function formatDate(date: Date) {
    return new Date(date).toISOString().split('T')[0];
}

export function formatDuration(duration: number) {
    const hours = Math.floor(duration)
    const minutes = Math.round((duration % 1) * 60)

    if (hours === 0) return `${minutes}min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}min`
}

export function getIntermediateDates(startDate: Date, endDate: Date): Date[] {
    const intermediateDates: Date[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        intermediateDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return intermediateDates;
}