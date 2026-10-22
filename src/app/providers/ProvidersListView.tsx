"use client";

import { Form, Switch } from "antd";
import ListView from "@/components/ListView";
import Button from "@/components/Button";
import Textbox from "@/components/Textbox";
import DropdownList from "@/components/DropdownList";
import { CheckCircleTwoTone, CheckOutlined, CloseCircleTwoTone, CloseOutlined } from "@ant-design/icons";
import { Provider } from "@/repositories/provider.repository";

export default function ProvidersListView() {
    return (
        <ListView<Provider>
            resourcePath="/providers"
            entityLabel="Provider"
            columns={[
                { key: "abn", label: "ABN" },
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "phone_number", label: "Phone Number" },
                { key: "address", label: "Address" },
                { key: "unit_building", label: "Unit/Building" },
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
                    <Form.Item name="abn" label="ABN" rules={[{ required: true, whitespace: true, message: "ABN is required." }, { pattern: /^\d{1,11}$/, message: "ABN must be digits only, max 11 digits." }]}>
                        <Textbox placeholder="eg. 38129236246" />
                    </Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: "Name is required." }]}>
                        <Textbox placeholder="eg. Flexi Support" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, whitespace: true, message: "Email is required." }, { type: "email", message: "Email must be a valid email address." }]}>
                        <Textbox type="email" placeholder="eg. accounts@example.com.au" />
                    </Form.Item>
                    <Form.Item
                        name="phone_number"
                        label="Phone Number"
                        rules={[{ pattern: /^\d{3,16}$/, message: "Phone number must be digits only, 3-16 digits." }]}
                    >
                        <Textbox placeholder="eg. 0395603333" />
                    </Form.Item>
                    <Form.Item name="address" label="Address" rules={[{ required: true, whitespace: true, message: "Address is required." }]}>
                        <Textbox />
                    </Form.Item>
                    <Form.Item name="unit_building" label="Unit/Building">
                        <Textbox />
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
                            Add Provider
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Textbox
                            label="ABN, Name, Email"
                            placeholder="Search ABN, name or email"
                            value={ctx.search}
                            onChange={(e) => ctx.setSearch(e.target.value)}
                        />
                        <DropdownList
                            label="Active"
                            placeholder="All statuses"
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
