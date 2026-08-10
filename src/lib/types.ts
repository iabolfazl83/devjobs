export interface Company {
    id: number;
    name: string;
    short_name: string;
}

export interface Job {
    id: number;
    name: string;
    company: Company;
}

export interface JobsResponse {
    page: number;
    page_count: number;
    results: Job[];
}