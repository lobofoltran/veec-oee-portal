import { KpiCards } from "./_components/kpi-cards";
import { MachinesTable } from "./_components/machines-table";
import { OeeChart } from "./_components/oee-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <KpiCards />
      <OeeChart />
      <MachinesTable />
    </div>
  )
}

