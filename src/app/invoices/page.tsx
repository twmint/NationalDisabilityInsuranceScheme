import Header from "@/components/Header";
import { headers } from "@/lib/headers";
import { GetClientOptions } from "@/repositories/client.repository";
import { GetProviderOptions } from "@/repositories/provider.repository";
import InvoicesListView from "./InvoicesListView";

export default async function Invoices() {
    const [clients, providers] = await Promise.all([GetClientOptions(), GetProviderOptions()]);

    return (
        <main className="p-6">
            <Header title={headers.invoiceList.title} subtitle={headers.invoiceList.subtitle} />
            <InvoicesListView
                participantOptions={clients.map((client) => ({ label: `${client.first_name} ${client.last_name}`, value: String(client.id) }))}
                providerOptions={providers.map((provider) => ({ label: provider.name, value: String(provider.id) }))}
            />
        </main>
    );
}
