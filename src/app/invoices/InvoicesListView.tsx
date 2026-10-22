"use client";

import ListView from "@/components/ListView";
import Button from "@/components/Button";
import Textbox from "@/components/Textbox";
import DropdownList, { DropdownOption } from "@/components/DropdownList";
import DatePicker from "@/components/DatePicker";
import { Invoice } from "@/repositories/invoice.repository";
import { UploadOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from "dayjs";


export default function InvoicesListView({
    participantOptions,
    providerOptions
}: {
    participantOptions: DropdownOption[];
    providerOptions: DropdownOption[];
}) {
    return (
        <ListView<Invoice> 
            resourcePath="/invoices"
            entityLabel="Invoice"
            columns={[
                { key: "participant", label: "Participant" },
                { key: "provider", label: "Provider" },
                { key: "invoice_number", label: "Invoice Number" },
                { key: "source", label: "Source", render: (value) => (value === "uploaded" ? "Uploaded" : "Manual") },
                { key: "status", label: "Status", render: (value) => (value === "completed" ? "Completed" : "Drafted") },
                { key: "invoice_date", label: "Invoice Date" },
                { key: "expected_amount", label: "Expected Amount", align: "right" },
                { key: "amount", label: "Amount", align: "right" },
            ]}
            renderActions={(row, ctx) => [
                {
                    label: "Edit",
                    onClick: () => ctx.openDrawer(row),
                },
                {
                    label: "Delete",
                    danger: true,
                    onClick: () => ctx.deleteRow(row),
                },
            ]}
        >
            {(ctx) => (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <Button type="default" onClick={ctx.refresh}>
                            Refresh
                        </Button>
                        <Button type="primary" onClick={() => ctx.openDrawer()}>
                            Add Invoice
                        </Button>
                        <Button type="default" onClick={() => {}} icon={<UploadOutlined />}>
                            Upload Invoices
                        </Button>
                        <Button type="default" onClick={() => {}} icon={<HistoryOutlined />}>
                            Upload History
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Textbox label="Invoice Number" placeholder="Search invoice number" 
                            value={ctx.search} onChange={(e) => ctx.setSearch(e.target.value)} />
                        <DropdownList label="Participant" placeholder="All participants" value={ctx.filterValues.participant} 
                            onChange={(value) => ctx.setFilterValue("participant", value)} options={participantOptions} />
                        <DropdownList label="Provider" placeholder="All providers" value={ctx.filterValues.provider} 
                            onChange={(value) => ctx.setFilterValue("provider", value)} options={providerOptions} />
                        <DatePicker label="Invoice Date" placeholder="Invoice Date" value={ctx.filterValues.invoiceDate}
                            onChange={(value) => ctx.setFilterValue("invoiceDate", value ? dayjs(value).format("YYYY-MM-DD") : undefined)} />
                        <DropdownList label="Source" placeholder="All sources" value={ctx.filterValues.source}
                            onChange={(value) => ctx.setFilterValue("source", value)}
                            options={[
                                { value: "uploaded", label: "Uploaded" },
                                { value: "manual", label: "Manual" },
                            ]}
                        />

                    </div>
                </div>
            )}
        </ListView>
    );
}