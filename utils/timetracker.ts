export function transformData(json: Record<string, any>): Timetracker {
    if (!json?.total || !json?.sessions) {
        return {
            total: 0,
            sessions: [],
        };
    }

    const timetracker = json as FileTimetracker

    const time_unit: TimeUnit = 'h'
    const groupedObject: Record<string, FileSession[]> = {}

    if (timetracker.sessions?.length) {
        for (const session of timetracker.sessions) {
            var inputDate = new Date(session.begin);
            inputDate.setHours(0, 0, 0, 0)

            const date = inputDate.toISOString()
            if (!groupedObject[date]) {
                groupedObject[date] = []
            }
            groupedObject[date].push(session)
        }
    }

    const finalArray: Session[] = Object.entries(groupedObject).map(([date, item]) => {
        const duration = item?.reduce((acc: number, e: any) => acc + convertDuration(e.duration, time_unit), 0)

        return {
            date: new Date(date),
            time_unit,
            duration: Math.round(duration * 100) / 100,
        }
    })
    const total = convertDuration(timetracker.total, time_unit)

    return {
        total: total,
        sessions: finalArray
    }
}