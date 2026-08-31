export interface Company {
    id: number;
    name: string;
    short_name: string;
}

export interface Location {
    name: string;
}

export interface Level {
    name: string;
    short_name: string;
}

export interface Category {
    name: string;
}

export interface Job {
    id: number;
    name: string;
    company: Company;
    contents: string;
    locations: Location[];
    levels: Level[];
    categories: Category[];
}

export interface JobsResponse {
    page: number;
    page_count: number;
    results: Job[];
}

export interface SavedJobRow {
    id: number;
    job_id: number;
    saved_at: string;
}