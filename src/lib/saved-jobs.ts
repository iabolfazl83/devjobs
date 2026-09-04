import db from "@/lib/db";
import {SavedJobRow} from "@/lib/types";

export function getSavedJobs(): SavedJobRow[] {
    return db.prepare('SELECT * FROM saved_jobs').all() as SavedJobRow[];
}