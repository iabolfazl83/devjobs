import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";
import {REMOTE_LOCATION} from "@/lib/catalog/text";

/**
 * Rule-based role classifier.
 *
 * The Muse's own categories are unreliable for our purposes — e.g. "Retail
 * Associate" and "Produce Associate" are filed under "Software Engineering" —
 * so we classify from the job title instead. Rules run in order and the first
 * match wins, which lets specific roles ("Full Stack") beat generic ones
 * ("Software Engineer").
 *
 * `minEvidence` guards titles that are only *sometimes* tech: a "Test Engineer"
 * at a rocket company, a "Research Scientist" at a pharma company, or a
 * "Product Manager" for a retailer's sourcing team only count when the
 * description mentions enough hard tech skills.
 */
interface RoleRule {
    role: RoleId;
    pattern: RegExp;
    minEvidence?: number;
}

const ROLE_RULES: RoleRule[] = [
    {role: "leadership", minEvidence: 1, pattern: /\b(engineering manager|manager,?\s+(?:software\s+)?engineering|(?:director|head|vp|vice president)(?:,|\s+of)?\s+(?:software\s+)?(?:engineering|data|platform|infrastructure|technology)|cto|chief (?:technology|information) officer)\b/i},
    {role: "product", minEvidence: 1, pattern: /\b(product manager|product owner|product management|product lead|head of product|director,?\s+(?:of\s+)?product|technical program manager|tpm|program manager,?\s+(?:technical|engineering|software)|scrum master|agile coach|(?:technical|it|software|digital)\s+project manager)\b/i},
    {role: "design", pattern: /\b((?:ux|ui|product|interaction|visual|web|motion|service|content)\s*(?:\/\s*(?:ux|ui)\s*)?designer|ux|user experience|user research(?:er)?|design (?:lead|manager|director|technologist))\b/i},
    {role: "security", pattern: /\b(security (?:engineer|analyst|architect|specialist|consultant|researcher|operations|administrator|developer)|(?:application|cloud|network|information|product|offensive|data)\s+security|cyber\s?security|infosec|penetration tester|appsec|soc analyst|identity (?:and|&) access)\b/i},
    {role: "ml", pattern: /\b(machine learning|ml|mlops|ai|artificial intelligence|deep learning|nlp|computer vision|data scientist|genai|llms?)\b/i},
    {role: "ml", pattern: /\b(applied scientist|research scientist|research engineer)\b/i, minEvidence: 2},
    {role: "data", pattern: /\b(data\s+(?:engineer(?:ing)?|analyst|architect|platform|warehouse|modeler|infrastructure|analytics|visuali[sz]ation|governance|science)|analytics engineer|business intelligence|bi\s+(?:developer|engineer|analyst)|dba|database (?:administrator|engineer|developer)|etl|big data)\b/i},
    {role: "devops", pattern: /\b(devops|dev ops|site reliability|sre|platform engineer|infrastructure engineer|cloud (?:engineer|architect|operations|platform)|build engineer|release engineer|kubernetes)\b/i},
    {role: "qa", pattern: /\b(qa|quality assurance|sdet|software (?:test|quality)|test automation|automation test(?:er|ing)?)\b/i},
    {role: "qa", pattern: /\btest engineer\b/i, minEvidence: 2},
    {role: "mobile", pattern: /\b(ios|android|mobile (?:engineer|developer|software)|react native|flutter)\b/i},
    {role: "embedded", pattern: /\b(embedded|firmware|fpga|rtos|kernel engineer|device driver)\b/i},
    {role: "fullstack", pattern: /\b(full[\s-]?stack)\b/i},
    {role: "frontend", pattern: /\b(front[\s-]?end|ui (?:engineer|developer)|web developer|javascript (?:engineer|developer)|react (?:engineer|developer)|angular developer)\b/i},
    {role: "backend", pattern: /(?:\b(?:back[\s-]?end|api engineer|server[\s-]side|distributed systems)\b|\b(?:java|python|golang|go|\.net|php|ruby|node(?:\.js)?|scala|rust)\s+(?:developer|engineer|programmer)\b|(?:c\+\+|c#)\s+(?:developer|engineer|programmer)\b)/i},
    {role: "it", pattern: /\b((?:it|i\.t\.)\s+(?:support|specialist|technician|analyst|administrator|manager|engineer|operations)|help ?desk|service desk|desktop support|systems? administrator|sysadmin|network (?:engineer|administrator|technician|architect)|data cent(?:er|re) (?:technician|engineer|operations)|technical support|support engineer)\b/i},
    {role: "software", pattern: /\b(software|developer|programmer|swe|applications? (?:engineer|developer)|web engineer|(?:solutions?|cloud|enterprise|technical) architect|solutions? engineer)\b/i},
];

/** Titles that are never tech roles, regardless of what the upstream category says. */
const NON_TECH_TITLE = /\b(retail|cashier|store|merchandis\w*|warehouse|driver|nurs(?:e|ing)|pharmac\w*|veterinar\w*|cook|chef|custodian|janitor|stocker|meat|produce|deli|bakery|optometrist|lpn|rn|cna|physician|therapist|dental|caregiver|teller|freight|forklift|tire|automotive|mechanic|hvac|plumb\w*|electrician|welder|machinist|assembler|sales associate|cosmetolog\w*|barista|housekeep\w*|lifeguard|security officer|guard)\b/i;

/** Physical-engineering disciplines: a "Solutions Architect, Civil" isn't a software job. */
const HARDWARE_DISCIPLINE = /\b(mechanical|civil|electrical|chemical|structural|manufacturing|hvac|aerospace|propulsion|construction|geotechnical|rf|antenna|avionics|hardware|piping|cnc|plc)\b/i;

/** Broader list, used only for the evidence-based generic bucket. */
const NON_SOFTWARE_ENGINEERING = new RegExp(
    `${HARDWARE_DISCIPLINE.source}|\\b(process|environmental|materials|industrial|fluids?|thermal|launch|optic(?:s|al)|laser|photonics|welding|reliability|field|facilities|design engineer|power|nuclear|biomedical|clinical|quality engineer|supplier|production)\\b`,
    "i",
);

const GENERIC_TECHNICAL = /\b(engineer|architect|technologist|scientist|analyst|administrator|consultant|specialist)\b/i;

/** Go-to-market roles at tech companies ("Account Manager - Cybersecurity") aren't engineering jobs. */
const GO_TO_MARKET = /\b(account (?:manager|executive|director)|sales|business development|recruit(?:er|ing)|talent acquisition|marketing|copywriter|communications|public relations|customer success manager|partner manager)\b/i;
const HANDS_ON = /\b(engineer|developer|scientist|analyst|architect|designer)\b/i;
// Not "programmer": CNC and PLC programmers are machine-shop roles.
const SOFTWARE_WORD = /\b(software|developer)\b/i;

/** Roles where a hardware word in the title is expected rather than disqualifying. */
const HARDWARE_TOLERANT = new Set<RoleId>(["it", "embedded"]);

/**
 * @param techEvidence number of hard tech skills found in the description.
 * @returns the role, or `null` when the job isn't a tech role and should be dropped.
 */
export function classifyRole(title: string, techEvidence: number): RoleId | null {
    if (GO_TO_MARKET.test(title) && !HANDS_ON.test(title)) return null;

    for (const {role, pattern, minEvidence = 0} of ROLE_RULES) {
        if (!pattern.test(title) || techEvidence < minEvidence) continue;
        // "RF Front-End Module Design Engineer" is a chip job, not a React job.
        if (!HARDWARE_TOLERANT.has(role) && HARDWARE_DISCIPLINE.test(title) && !SOFTWARE_WORD.test(title)) return null;
        return role;
    }

    if (NON_TECH_TITLE.test(title)) return null;
    if (GENERIC_TECHNICAL.test(title) && !NON_SOFTWARE_ENGINEERING.test(title) && techEvidence >= 3) {
        return "software";
    }
    return null;
}

const FRONTEND_SKILLS = new Set(["react", "nextjs", "angular", "vue", "svelte", "html-css", "tailwind", "redux"]);
const BACKEND_SKILLS = new Set(["nodejs", "django", "flask", "fastapi", "spring", "rails", "dotnet", "rest", "grpc", "microservices", "kafka", "redis", "postgres", "mysql", "mongodb"]);
const MOBILE_SKILLS = new Set(["ios", "android", "react-native", "flutter", "swift", "kotlin"]);

/**
 * A generic "Software Engineer" title says little, but the stack usually does:
 * when the description is clearly frontend- or backend-heavy, use that instead.
 */
export function refineRole(role: RoleId, skills: string[]): RoleId {
    if (role !== "software") return role;
    const top = skills.slice(0, 6);
    const count = (set: Set<string>) => top.filter((skill) => set.has(skill)).length;
    const frontend = count(FRONTEND_SKILLS);
    const backend = count(BACKEND_SKILLS);

    if (count(MOBILE_SKILLS) >= 2) return "mobile";
    if (frontend >= 2 && backend >= 2) return "fullstack";
    if (frontend >= 2 && backend === 0) return "frontend";
    if (backend >= 2 && frontend === 0) return "backend";
    return role;
}

const MUSE_LEVEL_TO_SENIORITY: Record<string, SeniorityId> = {
    "internship": "intern",
    "entry level": "entry",
    "mid level": "mid",
    "senior level": "senior",
    "management": "manager",
};

// Case-sensitive on the numeral so "I" the pronoun can't match, insensitive on the noun.
const ROMAN_LEVEL_I = /\b(?:[Ee]ngineer|[Dd]eveloper|[Aa]nalyst|[Ss]cientist|[Dd]esigner)\s+I\b(?!I)/;
const ROMAN_LEVEL_II = /\b(?:[Ee]ngineer|[Dd]eveloper|[Aa]nalyst|[Ss]cientist|[Dd]esigner)\s+II\b(?!I)/;

/** Title signals win over the upstream level, which is often missing or generic. */
export function classifySeniority(title: string, museLevels: string[], role: RoleId): SeniorityId {
    if (/\b(intern|internship|co-?op|apprentice(?:ship)?)\b/i.test(title)) return "intern";
    if (/\b(director|head of|vp|vice president|chief|cto|cio)\b/i.test(title) || role === "leadership") return "manager";
    if (role !== "product" && /\bmanager\b/i.test(title)) return "manager";
    if (/\b(staff|principal|lead|distinguished|fellow|architect)\b/i.test(title)) return "lead";
    if (/\b(senior|sr|snr)\b/i.test(title) || /\b(?:III|IV)\b/.test(title) || /\blevel\s*(?:3|4)\b/i.test(title)) return "senior";
    if (/\b(junior|jr|entry[\s-]level|graduate|new grad|early career)\b/i.test(title) || ROMAN_LEVEL_I.test(title)) return "entry";
    if (ROMAN_LEVEL_II.test(title) || /\b(mid[\s-]level|intermediate)\b/i.test(title)) return "mid";

    for (const level of museLevels) {
        const mapped = MUSE_LEVEL_TO_SENIORITY[level.toLowerCase()];
        if (mapped) return mapped;
    }
    return "mid";
}

export function detectWorkMode(title: string, locations: string[], text: string): WorkMode {
    if (locations.includes(REMOTE_LOCATION) || /\bremote\b/i.test(title)) return "remote";
    if (/\bhybrid\b/i.test(title) || /\bhybrid\b/i.test(text)) return "hybrid";
    return "onsite";
}
