import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";

export interface RoleMeta {
    id: RoleId;
    label: string;
    blurb: string;
}

/** Display order matters: this is the order roles appear in filters and on the landing page. */
export const ROLES: RoleMeta[] = [
    {id: "frontend", label: "Frontend", blurb: "React, TypeScript, web UI"},
    {id: "backend", label: "Backend", blurb: "APIs, services, distributed systems"},
    {id: "fullstack", label: "Full-stack", blurb: "End-to-end product engineering"},
    {id: "mobile", label: "Mobile", blurb: "iOS, Android, cross-platform"},
    {id: "devops", label: "DevOps & Cloud", blurb: "Infra, SRE, platform"},
    {id: "data", label: "Data", blurb: "Data engineering & analytics"},
    {id: "ml", label: "AI & ML", blurb: "Machine learning, data science"},
    {id: "security", label: "Security", blurb: "AppSec, cloud & cyber security"},
    {id: "qa", label: "QA & Testing", blurb: "Automation, SDET, quality"},
    {id: "embedded", label: "Embedded", blurb: "Firmware, systems, hardware-near"},
    {id: "design", label: "Design", blurb: "Product, UX & UI design"},
    {id: "product", label: "Product", blurb: "PM, TPM & delivery"},
    {id: "it", label: "IT & Support", blurb: "Networks, sysadmin, support"},
    {id: "leadership", label: "Eng. Leadership", blurb: "Managers, directors, heads of"},
    {id: "software", label: "Software Eng.", blurb: "Generalist software roles"},
];

export const ROLE_BY_ID: Record<RoleId, RoleMeta> = Object.fromEntries(
    ROLES.map((role) => [role.id, role]),
) as Record<RoleId, RoleMeta>;

export const SENIORITIES: { id: SeniorityId; label: string }[] = [
    {id: "intern", label: "Internship"},
    {id: "entry", label: "Entry level"},
    {id: "mid", label: "Mid level"},
    {id: "senior", label: "Senior"},
    {id: "lead", label: "Lead / Staff"},
    {id: "manager", label: "Management"},
];

export const SENIORITY_LABEL: Record<SeniorityId, string> = Object.fromEntries(
    SENIORITIES.map((level) => [level.id, level.label]),
) as Record<SeniorityId, string>;

export const WORK_MODES: { id: WorkMode; label: string }[] = [
    {id: "remote", label: "Remote"},
    {id: "hybrid", label: "Hybrid"},
    {id: "onsite", label: "On-site"},
];

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
};

/** Upstream "Large Size" → "Large company". */
export function companySizeLabel(size: string | null): string | null {
    if (!size) return null;
    return `${size.replace(/\s*size$/i, "")} company`;
}
