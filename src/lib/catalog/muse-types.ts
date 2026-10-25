/** Raw response shapes from The Muse public API (https://www.themuse.com/developers/api/v2). */

export interface MuseNamed {
    name: string;
}

export interface MuseLevel {
    name: string;
    short_name: string;
}

export interface MuseJob {
    id: number;
    name: string;
    contents: string;
    publication_date: string;
    short_name: string;
    type: string;
    locations: MuseNamed[];
    levels: MuseLevel[];
    categories: MuseNamed[];
    tags: { name: string; short_name: string }[];
    refs: { landing_page: string };
    company: { id: number; short_name: string; name: string };
}

export interface MuseCompany {
    id: number;
    name: string;
    short_name: string;
    description: string;
    locations: MuseNamed[];
    industries: MuseNamed[];
    size: { name: string; short_name: string } | null;
    refs: {
        landing_page?: string;
        jobs_page?: string;
        logo_image?: string;
        f1_image?: string;
        f2_image?: string;
        f3_image?: string;
    };
}

export interface MusePage<T> {
    page: number;
    page_count: number;
    items_per_page: number;
    total: number;
    results: T[];
}
