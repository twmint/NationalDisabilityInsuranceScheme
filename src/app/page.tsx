import Header from "@/components/Header";
import { headers } from "@/lib/headers";

export default function Dashboard() {
  return (
    <div className="p-6">
      <Header title={headers.dashboard.title} subtitle={headers.dashboard.subtitle} />
    </div>
  );
}
