import {
    Bug, BrainCircuit, Cloud, CodeXml, Cpu, Crown, Database, Layers, LayoutTemplate, LucideIcon, Network, Palette, Server,
    ShieldCheck, Smartphone, Target,
} from "lucide-react";
import {RoleId} from "@/lib/catalog/types";

export const ROLE_ICON: Record<RoleId, LucideIcon> = {
    frontend: LayoutTemplate,
    backend: Server,
    fullstack: Layers,
    mobile: Smartphone,
    devops: Cloud,
    data: Database,
    ml: BrainCircuit,
    security: ShieldCheck,
    qa: Bug,
    embedded: Cpu,
    design: Palette,
    product: Target,
    it: Network,
    leadership: Crown,
    software: CodeXml,
};
