"use client";

import {useSearchStore} from "@/lib/store";

export default function SearchBar() {
    const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

    return (
        <input
            className="border rounded-md px-4 py-1 "
            type="text"
            placeholder="Search jobs..."
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    );
}