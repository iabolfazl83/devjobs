interface Company {
    id: number;
    name: string;
    short_name: string;
}

interface Job {
    id: number;
    name: string;
    company: Company;
}

interface JobsResponse {
    page: number;
    page_count: number;
    results: Job[];
}


export default async function Home() {
    const data = await fetch('https://www.themuse.com/api/public/jobs?page=0');
    const jobs: JobsResponse = await data.json();
    const {results} = jobs;

    return (
        <div>
            <ul>
                {
                    results.map((job) => (
                        <li key={job.id}>
                            {job.name}
                            {" | "}
                            {job.company.name}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}
