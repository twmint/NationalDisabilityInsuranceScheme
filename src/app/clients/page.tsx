import Header from "@/components/Header";
import { headers } from "@/lib/headers";
import { GetGenders } from "@/repositories/gender.repository";
import { GetPricingRegions } from "@/repositories/pricingRegion.repository";
import ClientsListView from "./ClientsListView";

export default async function Clients() {
    const [genders, pricingRegions] = await Promise.all([GetGenders(), GetPricingRegions()]);

    return (
        <main className="p-6">
            <Header title={headers.participants.title} subtitle={headers.participants.subtitle} />
            <ClientsListView
                genderOptions={genders.map((gender) => ({ label: gender.label, value: gender.code }))}
                pricingRegionOptions={pricingRegions.map((region) => ({ label: region.label, value: region.code }))}
            />
        </main>
    );
}