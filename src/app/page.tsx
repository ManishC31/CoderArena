import { AlgorithmsSection } from "@/components/landing/algorithms-section";
import { CtaSection } from "@/components/landing/cta-section";
import { EditorSection } from "@/components/landing/editor-section";
import { GitHubSection } from "@/components/landing/github-section";
import { Hero } from "@/components/landing/hero";
import { PracticeSection } from "@/components/landing/practice-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { TemplatesSection } from "@/components/landing/templates-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <>
      <SiteHeader user={user} />
      <main className="flex-1">
        <Hero signedIn={Boolean(user)} />
        <TemplatesSection />
        <EditorSection />
        <GitHubSection />
        <PracticeSection />
        <AlgorithmsSection />
        <WorkflowSection />
        <CtaSection signedIn={Boolean(user)} />
      </main>
      <SiteFooter />
    </>
  );
}
