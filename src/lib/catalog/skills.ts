/**
 * Skill dictionary + extractor.
 *
 * Upstream listings have no structured "skills" field, so the pipeline derives
 * one by scanning the description text. Patterns are deliberately conservative:
 * many tech names are also English words ("Go", "Rust", "Swift", "React",
 * "Spring"), so those are case-sensitive or need surrounding context.
 */

export type SkillGroup = "language" | "frontend" | "backend" | "data" | "cloud" | "mobile" | "design" | "practice";

export interface SkillDef {
    id: string;
    label: string;
    group: SkillGroup;
    patterns: RegExp[];
}

export const SKILL_GROUPS: { id: SkillGroup; label: string }[] = [
    {id: "language", label: "Languages"},
    {id: "frontend", label: "Frontend"},
    {id: "backend", label: "Backend & APIs"},
    {id: "data", label: "Data & AI"},
    {id: "cloud", label: "Cloud & DevOps"},
    {id: "mobile", label: "Mobile"},
    {id: "design", label: "Design"},
    {id: "practice", label: "Practices & tools"},
];

export const SKILLS: SkillDef[] = [
    // Languages
    {id: "javascript", label: "JavaScript", group: "language", patterns: [/\bjavascript\b/i, /\bES6\b/]},
    {id: "typescript", label: "TypeScript", group: "language", patterns: [/\btypescript\b/i]},
    {id: "python", label: "Python", group: "language", patterns: [/\bpython\b/i]},
    {id: "java", label: "Java", group: "language", patterns: [/\bjava\b(?!\s*script)/i]},
    {id: "kotlin", label: "Kotlin", group: "language", patterns: [/\bkotlin\b/i]},
    {id: "swift", label: "Swift", group: "language", patterns: [/\bSwift(?:UI)?\b/]},
    {id: "go", label: "Go", group: "language", patterns: [/\bgolang\b/i, /(?:^|[,/(]\s*|\band\s|\bor\s)Go(?=\s*(?:[,/)]|\band\b|\bor\b))/]},
    {id: "rust", label: "Rust", group: "language", patterns: [/\bRust\b/]},
    {id: "cpp", label: "C++", group: "language", patterns: [/\bC\+\+/]},
    {id: "csharp", label: "C#", group: "language", patterns: [/\bC#/]},
    {id: "ruby", label: "Ruby", group: "language", patterns: [/\bRuby\b/]},
    {id: "php", label: "PHP", group: "language", patterns: [/\bPHP\b/]},
    {id: "scala", label: "Scala", group: "language", patterns: [/\bScala\b/]},
    {id: "sql", label: "SQL", group: "language", patterns: [/\bSQL\b/]},
    {id: "bash", label: "Bash / Shell", group: "language", patterns: [/\bbash\b/i, /\bshell script(?:ing|s)?\b/i]},
    {id: "elixir", label: "Elixir", group: "language", patterns: [/\bElixir\b/]},

    // Frontend
    {id: "react", label: "React", group: "frontend", patterns: [/\bReact(?:\.js|JS)?\b(?!\s+Native)/]},
    {id: "nextjs", label: "Next.js", group: "frontend", patterns: [/\bNext\.js\b/i, /\bNextJS\b/i]},
    {id: "angular", label: "Angular", group: "frontend", patterns: [/\bAngular(?:JS)?\b/]},
    {id: "vue", label: "Vue", group: "frontend", patterns: [/\bVue(?:\.js|JS)?\b/]},
    {id: "svelte", label: "Svelte", group: "frontend", patterns: [/\bSvelte(?:Kit)?\b/]},
    {id: "html-css", label: "HTML & CSS", group: "frontend", patterns: [/\bHTML5?\b/, /\bCSS3?\b/]},
    {id: "tailwind", label: "Tailwind", group: "frontend", patterns: [/\btailwind\b/i]},
    {id: "redux", label: "Redux", group: "frontend", patterns: [/\bRedux\b/]},
    {id: "graphql", label: "GraphQL", group: "frontend", patterns: [/\bgraphql\b/i]},

    // Backend
    {id: "nodejs", label: "Node.js", group: "backend", patterns: [/\bNode\.?js\b/i]},
    {id: "django", label: "Django", group: "backend", patterns: [/\bDjango\b/]},
    {id: "flask", label: "Flask", group: "backend", patterns: [/\bFlask\b/]},
    {id: "fastapi", label: "FastAPI", group: "backend", patterns: [/\bFastAPI\b/i]},
    {id: "spring", label: "Spring", group: "backend", patterns: [/\bSpring\s?(?:Boot|Framework|MVC|Cloud)\b/i]},
    {id: "rails", label: "Rails", group: "backend", patterns: [/\bRuby on Rails\b/i, /\bRails\b/]},
    {id: "dotnet", label: ".NET", group: "backend", patterns: [/(?:^|\s|ASP)\.NET\b/, /\bdotnet\b/i]},
    {id: "rest", label: "REST APIs", group: "backend", patterns: [/\bREST(?:ful)?\b/, /\brestful\b/i]},
    {id: "grpc", label: "gRPC", group: "backend", patterns: [/\bgRPC\b/i]},
    {id: "microservices", label: "Microservices", group: "backend", patterns: [/\bmicro-?services?\b/i]},
    {id: "kafka", label: "Kafka", group: "backend", patterns: [/\bKafka\b/i]},
    {id: "redis", label: "Redis", group: "backend", patterns: [/\bRedis\b/i]},
    {id: "postgres", label: "PostgreSQL", group: "backend", patterns: [/\bpostgres(?:ql)?\b/i]},
    {id: "mysql", label: "MySQL", group: "backend", patterns: [/\bmysql\b/i]},
    {id: "mongodb", label: "MongoDB", group: "backend", patterns: [/\bmongo(?:db)?\b/i]},
    {id: "elasticsearch", label: "Elasticsearch", group: "backend", patterns: [/\belastic\s?search\b/i]},
    {id: "salesforce", label: "Salesforce", group: "backend", patterns: [/\bSalesforce\b/]},
    {id: "sap", label: "SAP", group: "backend", patterns: [/\bSAP\b/]},

    // Data & AI
    {id: "machine-learning", label: "Machine Learning", group: "data", patterns: [/\bmachine learning\b/i]},
    {id: "deep-learning", label: "Deep Learning", group: "data", patterns: [/\bdeep learning\b/i]},
    {id: "llm", label: "LLMs / GenAI", group: "data", patterns: [/\bLLMs?\b/, /\blarge language models?\b/i, /\bgenerative AI\b/i, /\bGenAI\b/i]},
    {id: "nlp", label: "NLP", group: "data", patterns: [/\bNLP\b/, /\bnatural language processing\b/i]},
    {id: "computer-vision", label: "Computer Vision", group: "data", patterns: [/\bcomputer vision\b/i]},
    {id: "pytorch", label: "PyTorch", group: "data", patterns: [/\bpytorch\b/i]},
    {id: "tensorflow", label: "TensorFlow", group: "data", patterns: [/\btensorflow\b/i]},
    {id: "scikit-learn", label: "scikit-learn", group: "data", patterns: [/\bscikit-learn\b/i, /\bsklearn\b/i]},
    {id: "pandas", label: "pandas", group: "data", patterns: [/\bpandas\b/i, /\bnumpy\b/i]},
    {id: "spark", label: "Spark", group: "data", patterns: [/\b(?:Apache\s|Py)?Spark\b/]},
    {id: "airflow", label: "Airflow", group: "data", patterns: [/\bAirflow\b/i]},
    {id: "dbt", label: "dbt", group: "data", patterns: [/\bdbt\b/]},
    {id: "snowflake", label: "Snowflake", group: "data", patterns: [/\bSnowflake\b/]},
    {id: "databricks", label: "Databricks", group: "data", patterns: [/\bDatabricks\b/i]},
    {id: "hadoop", label: "Hadoop", group: "data", patterns: [/\bHadoop\b/i]},
    {id: "tableau", label: "Tableau", group: "data", patterns: [/\bTableau\b/]},
    {id: "power-bi", label: "Power BI", group: "data", patterns: [/\bPower\s?BI\b/i]},
    {id: "looker", label: "Looker", group: "data", patterns: [/\bLooker\b/]},

    // Cloud & DevOps
    {id: "aws", label: "AWS", group: "cloud", patterns: [/\bAWS\b/, /\bAmazon Web Services\b/i]},
    {id: "azure", label: "Azure", group: "cloud", patterns: [/\bAzure\b/]},
    {id: "gcp", label: "GCP", group: "cloud", patterns: [/\bGCP\b/, /\bGoogle Cloud\b/i]},
    {id: "docker", label: "Docker", group: "cloud", patterns: [/\bdocker\b/i, /\bcontaineri[sz]ation\b/i]},
    {id: "kubernetes", label: "Kubernetes", group: "cloud", patterns: [/\bkubernetes\b/i, /\bK8s\b/i]},
    {id: "terraform", label: "Terraform", group: "cloud", patterns: [/\bterraform\b/i]},
    {id: "ansible", label: "Ansible", group: "cloud", patterns: [/\bansible\b/i]},
    {id: "ci-cd", label: "CI/CD", group: "cloud", patterns: [/\bCI\s?\/\s?CD\b/i, /\bcontinuous (?:integration|delivery|deployment)\b/i]},
    {id: "linux", label: "Linux", group: "cloud", patterns: [/\blinux\b/i, /\bunix\b/i]},
    {id: "git", label: "Git", group: "cloud", patterns: [/\bGit\b(?!Hub|Lab)/, /\bGitHub\b/, /\bGitLab\b/]},
    {id: "observability", label: "Observability", group: "cloud", patterns: [/\bobservability\b/i, /\bprometheus\b/i, /\bgrafana\b/i, /\bdatadog\b/i]},

    // Mobile
    {id: "ios", label: "iOS", group: "mobile", patterns: [/\biOS\b/]},
    {id: "android", label: "Android", group: "mobile", patterns: [/\bAndroid\b/]},
    {id: "react-native", label: "React Native", group: "mobile", patterns: [/\bReact Native\b/i]},
    {id: "flutter", label: "Flutter", group: "mobile", patterns: [/\bFlutter\b/]},

    // Design
    {id: "figma", label: "Figma", group: "design", patterns: [/\bfigma\b/i]},
    {id: "sketch", label: "Sketch", group: "design", patterns: [/\bSketch\b(?=\s*(?:,|\/|\)|and|or|app))/]},
    {id: "prototyping", label: "Prototyping", group: "design", patterns: [/\bprototyp(?:e|es|ing)\b/i]},
    {id: "user-research", label: "User Research", group: "design", patterns: [/\buser research\b/i, /\busability testing\b/i]},
    {id: "design-systems", label: "Design Systems", group: "design", patterns: [/\bdesign systems?\b/i]},
    // Not a bare "accessibility" — EEO boilerplate ("accessibility accommodations") is everywhere.
    {id: "accessibility", label: "Accessibility", group: "design", patterns: [/\bWCAG\b/, /\ba11y\b/i, /\b(?:web|digital|product) accessibility\b/i, /\baccessibility (?:standards|best practices|guidelines)\b/i]},

    // Practices & tools
    {id: "agile", label: "Agile / Scrum", group: "practice", patterns: [/\bagile\b/i, /\bscrum\b/i]},
    {id: "testing", label: "Automated Testing", group: "practice", patterns: [/\b(?:unit|integration|automated|end-to-end) test(?:s|ing)?\b/i, /\b(?:Jest|Cypress|Playwright|Selenium|pytest|JUnit)\b/]},
    {id: "system-design", label: "System Design", group: "practice", patterns: [/\bsystems? design\b/i, /\bdistributed systems?\b/i]},
    {id: "security-eng", label: "Security", group: "practice", patterns: [/\bOWASP\b/, /\bpenetration testing\b/i, /\bthreat model(?:l)?ing\b/i, /\bSIEM\b/, /\bzero trust\b/i]},
    {id: "embedded-c", label: "Embedded C", group: "practice", patterns: [/\bembedded C\b/i, /\bRTOS\b/, /\bfirmware\b/i, /\bFPGA\b/]},
];

export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(SKILLS.map((skill) => [skill.id, skill]));

export function skillLabel(id: string): string {
    return SKILL_BY_ID[id]?.label ?? id;
}

/** Soft skills that shouldn't count as evidence a job is technical. */
const NON_EVIDENCE = new Set(["agile", "sap", "salesforce", "accessibility", "prototyping", "system-design"]);

export interface ExtractedSkills {
    /** Skill ids, most-mentioned first. */
    skills: string[];
    /** How many hard tech skills were found — used by the classifier as a "this is a tech job" signal. */
    techEvidence: number;
}

// Global copies of every pattern, compiled once, so we can count matches.
const COUNTERS = SKILLS.map((skill) => skill.patterns.map((pattern) => new RegExp(pattern.source, pattern.flags + "g")));

export function extractSkills(text: string, companyName = "", limit = 10): ExtractedSkills {
    const company = companyName.toLowerCase();
    const hits: { id: string; count: number; order: number }[] = [];

    SKILLS.forEach((skill, order) => {
        // A company's own name isn't a skill requirement ("Salesforce" at Salesforce).
        if (company && company.includes(skill.label.toLowerCase())) return;

        const count = COUNTERS[order].reduce((sum, counter) => sum + (text.match(counter)?.length ?? 0), 0);
        if (count > 0) hits.push({id: skill.id, count, order});
    });

    hits.sort((a, b) => b.count - a.count || a.order - b.order);
    return {
        skills: hits.slice(0, limit).map((hit) => hit.id),
        techEvidence: hits.filter((hit) => !NON_EVIDENCE.has(hit.id)).length,
    };
}
