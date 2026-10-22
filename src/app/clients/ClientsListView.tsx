"use client";

import { Form, Switch } from "antd";
import ListView from "@/components/ListView";
import Button from "@/components/Button";
import Textbox from "@/components/Textbox";
import DropdownList, { DropdownOption } from "@/components/DropdownList";
import DatePicker from "@/components/DatePicker";
import { CheckCircleTwoTone, CheckOutlined, CloseCircleTwoTone, CloseOutlined } from "@ant-design/icons";
import { Client } from "@/repositories/client.repository";
import dayjs from "dayjs";

export default function ClientsListView({
    genderOptions,
    pricingRegionOptions,
}: {
    genderOptions: DropdownOption[];
    pricingRegionOptions: DropdownOption[];
}) {
    return (
        <ListView<Client>
            resourcePath="/clients"
            entityLabel="Participant"
            columns={[
                { key: "first_name", label: "First Name" },
                { key: "last_name", label: "Last Name" },
                { key: "gender_label", label: "Gender" },
                { key: "dob", label: "Date of Birth", render: (value) => (value ? dayjs(value as string).format("DD/MM/YYYY") : "") },
                { key: "ndis_number", label: "NDIS Number" },
                { key: "email", label: "Email" },
                { key: "phone_number", label: "Phone Number" },
                { key: "address", label: "Address" },
                { key: "unit_building", label: "Unit/Building" },
                { key: "pricing_region", label: "Pricing Region" },
                { key: "status", label: "Active", render: (value) => (value === "active" ? <CheckCircleTwoTone /> : <CloseCircleTwoTone />), align: "center", width: 80 },
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
            renderForm={(record, actions) => (
                <div className="flex flex-col">
                    <Form.Item name="first_name" label="First Name" rules={[{ required: true, whitespace: true, message: "First name is required." }]}>
                        <Textbox placeholder="eg. John" />
                    </Form.Item>
                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true, whitespace: true, message: "Last name is required." }]}>
                        <Textbox placeholder="eg. Doe" />
                    </Form.Item>
                    <Form.Item name="gender_code" label="Gender" rules={[{ required: true, message: "Gender is required." }]}>
                        <DropdownList options={genderOptions} />
                    </Form.Item>
                    <Form.Item
                        name="dob"
                        label="Date of Birth"
                        rules={[{ required: true, message: "Date of birth is required." }]}
                    >
                        <DatePicker disabledDate={(current) => current.isAfter(dayjs(), "day")} />
                    </Form.Item>
                    <Form.Item  
                        name="ndis_number"
                        label="NDIS Number"
                        rules={[
                            { required: true, message: "NDIS number is required." },
                            { pattern: /^\d{1,16}$/, message: "NDIS number must be digits only, max 16 digits." },
                        ]}
                    >
                        <Textbox placeholder="eg. 432143214" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "A valid email is required." }]}>
                        <Textbox type="email" placeholder="eg. john.doe@example.com" />
                    </Form.Item>
                    <Form.Item
                        name="phone_number"
                        label="Phone Number"
                        rules={[{ pattern: /^\d{3,16}$/, message: "Phone number must be digits only, 3-16 digits." }]}
                    >
                        <Textbox placeholder="eg. 1234567890" />
                    </Form.Item>
                    <Form.Item name="address" label="Address" rules={[{ required: true, whitespace: true, message: "Address is required." }]}>
                        <Textbox />
                    </Form.Item>
                    <Form.Item name="unit_building" label="Unit/Building">
                        <Textbox />
                    </Form.Item>
                    <Form.Item name="pricing_region" label="Pricing Region" rules={[{ required: true, message: "Pricing region is required." }]}>
                        <DropdownList options={pricingRegionOptions} />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Active"
                        getValueProps={(value) => ({ checked: (value ?? "active") === "active" })}
                        normalize={(checked) => (checked ? "active" : "inactive")}
                    >
                        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={actions.cancel} disabled={actions.submitting}>
                            Cancel
                        </Button>
                        <Button type="primary" loading={actions.submitting} onClick={actions.submit}>
                            Save
                        </Button>
                    </div>
                </div>
            )}
        >
            {(ctx) => (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <Button type="default" onClick={ctx.refresh}>
                            Refresh
                        </Button>
                        <Button type="primary" onClick={() => ctx.openDrawer()}>
                            Add Participant
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Textbox
                            label="First Name, Last Name, NDIS number, Email"
                            placeholder="Search first name, last name, NDIS number or email"
                            value={ctx.search}
                            onChange={(e) => ctx.setSearch(e.target.value)}
                        />
                        <DropdownList
                            label="Gender"
                            placeholder="All genders"
                            options={genderOptions}
                            value={ctx.filterValues.gender}
                            onChange={(value) => ctx.setFilterValue("gender", value)}
                        />
                        <DropdownList
                            label="Pricing Region"
                            placeholder="All pricing regions"
                            options={pricingRegionOptions}
                            value={ctx.filterValues.pricingRegion}
                            onChange={(value) => ctx.setFilterValue("pricingRegion", value)}
                        />
                        <DropdownList
                            label="Active"
                            placeholder="All Statuses"
                            options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                            ]}
                            value={ctx.filterValues.status}
                            onChange={(value) => ctx.setFilterValue("status", value)}
                        />
                    </div>
                </div>
            )}
        </ListView>
    );
}