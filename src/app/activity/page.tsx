import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityLedger } from "@/components/activity/ActivityLedger";

export const metadata: Metadata = {
  title: "Activity Ledger — Intelligence Workspace",
  description:
    "Audit trail lengkap: setiap perubahan data (siapa, kapan, dari nilai apa ke nilai apa) tercatat otomatis oleh trigger Postgres.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        icon={ScrollText}
        title="Activity Ledger"
        description="Audit trail court-grade: setiap INSERT / UPDATE / DELETE pada tabel inti tercatat otomatis oleh trigger Postgres — siapa pelakunya, kapan, dan diff old → new. Gaya git-log, data langsung dari audit_log (tanpa cache)."
      />
      <ActivityLedger />
    </div>
  );
}
