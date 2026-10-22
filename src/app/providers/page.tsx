import Header from "@/components/Header";
import { headers } from "@/lib/headers";
import ProvidersListView from "./ProvidersListView";

export default function Providers() {
    return (
        <main className="p-6">
            <Header title={headers.providers.title} subtitle={headers.providers.subtitle} />
            <ProvidersListView />
        </main>
    )
}