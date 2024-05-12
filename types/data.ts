export type FileTimetracker = {
    total: number
    sessions: FileSession[]
}

export type FileSession = {
    begin: string
    end: string
    duration: number
}

export type Timetracker = {
    total: number
    sessions: Session[]
}

export type Session = {
    date: Date
    time_unit: TimeUnit
    duration: number
}

export type TimeUnit = 's' | 'm' | 'h'