import {Metadata} from "next";
import {getJobById} from "@/lib/jobs";
import DOMPurify from "isomorphic-dompurify";

export const metadata: Metadata = {
    title: "Job Detail | jobs",
};

export default async function JobsDetailPage({params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;
    const job = await getJobById(id);
    const {name, company, contents,locations, levels, categories} = job;
    const sanitizedContents = DOMPurify.sanitize(contents);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-surface border border-border rounded-lg p-6">
                <h1 className="text-2xl font-semibold">{name}</h1>
                <p className="text-text-muted mt-1">{company.name}</p>
                <div className="flex flex-wrap gap-2 my-3">
                    {locations.map((location) => (
                        <span key={location.name}
                              className="px-2 py-1 text-xs rounded-full bg-background border border-border text-text-muted">
                    {location.name}
                </span>
                    ))}
                    {levels.map((level) => (
                        <span key={level.short_name}
                              className="px-2 py-1 text-xs rounded-full bg-background border border-border text-text-muted">
                    {level.name}
                </span>
                    ))}
                    {categories.map((category) => (
                        <span key={category.name}
                              className="px-2 py-1 text-xs rounded-full bg-background border border-border text-text-muted">
                    {category.name}
                </span>
                    ))}
                </div>
                <div className="prose prose-invert prose-sm max-w-none"
                     dangerouslySetInnerHTML={{__html: sanitizedContents}}/>
            </div>
        </div>
    )
}