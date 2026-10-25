import type {Metadata} from "next";
import {getCatalog, toCompanySummary} from "@/lib/server/catalog";
import {Container, PageHeader} from "@/components/layout/Section";
import {CompanyDirectory} from "@/components/companies/CompanyDirectory";
import {formatNumber} from "@/lib/format";

export const metadata: Metadata = {
    title: "Companies hiring",
    description: "Browse tech companies with open roles — industries, size, remote-friendliness and what they're hiring for.",
};

export default function CompaniesPage() {
    const {companies, stats} = getCatalog();
    return (
        <>
            <PageHeader
                title="Companies hiring now"
                description={`${formatNumber(stats.companyCount)} companies with ${formatNumber(stats.jobCount)} open tech roles between them.`}
            />
            <Container className="py-8">
                <CompanyDirectory companies={companies.map(toCompanySummary)}/>
            </Container>
        </>
    );
}
