"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Drawer, Form, message, Table } from "antd";
import APIManager, { APIError } from "@/lib/apiManager";
import { useDebounce } from "@/hooks/useDebounce";
import TableActions, { TableActionButton } from "@/components/TableActions";
import EntryForm from "@/components/EntryForm";

export type ListViewColumn<T> = {
    key: string;
    label: string;
    render?: (value: unknown, record: T) => React.ReactNode;
    align?: "left" | "right" | "center";
    width?: number | string;
};

export type ListViewContext<T> = {
    search: string;
    setSearch: (value: string) => void;
    filterValues: Record<string, string | undefined>;
    setFilterValue: (key: string, value: string | undefined) => void;
    refresh: () => void;
    openDrawer: (row?: T) => void;
};

export type ListViewProps<T extends Record<string, unknown> & { id?: number | string }> = {
    resourcePath: string;
    entityLabel: string;
    columns: ListViewColumn<T>[];
    renderActions?: (row: T, ctx: ListViewContext<T>) => TableActionButton<T>[];
    children: (ctx: ListViewContext<T>) => React.ReactNode;
    renderForm?: (record: T | undefined) => React.ReactNode;
};

function ListView<T extends Record<string, unknown> & { id?: number | string }>({
    resourcePath,
    entityLabel,
    columns,
    renderActions,
    children,
    renderForm,
}: ListViewProps<T>) {
    const [search, setSearch] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string | undefined>>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [rows, setRows] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);
    const [form] = Form.useForm();
    const debouncedSearch = useDebounce(search, 350);

    useEffect(() => {
        if (drawerOpen) {
            form.resetFields();
        }
    }, [drawerOpen, selectedRow, form]);

    const loadRows = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set("search", debouncedSearch);
            for (const [key, value] of Object.entries(filterValues)) {
                if (value) params.set(key, value);
            }
            params.set("page", String(page));
            params.set("pageSize", String(pageSize));

            const body = await APIManager.getInstance().get<{ data: T[]; total: number }>(
                `${resourcePath}?${params.toString()}`
            );
            setRows(body.data ?? []);
            setTotal(body.total ?? 0);
        } catch (error) {
            console.error("Error loading rows:", error);
        } finally {
            setLoading(false);
        }
    }, [resourcePath, debouncedSearch, filterValues, page, pageSize]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch must re-run when search/filters/page change
        loadRows();
    }, [loadRows]);

    const setFilterValue = useCallback((key: string, value: string | undefined) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    }, []);

    const ctx: ListViewContext<T> = {
        search,
        setSearch: (value) => { setSearch(value); setPage(1); },
        filterValues,
        setFilterValue,
        refresh: () => loadRows(),
        openDrawer: (row) => { setSelectedRow(row ?? null); setDrawerOpen(true); },
    };

    async function handleSubmit(data: Record<string, unknown>) {
        try {
            if (selectedRow) {
                await APIManager.getInstance().patch(`${resourcePath}/${selectedRow.id}`, data);
            } else {
                await APIManager.getInstance().post(resourcePath, data);
            }
            ctx.refresh();
            setDrawerOpen(false);
        } catch (error) {
            console.error("Error saving entry:", error);
            const description = error instanceof APIError ? error.message : "Something went wrong. Please try again.";
            message.error(description);
        }
    };

    return (
        <div>
            {children(ctx)}
            <div className="mt-5">
                <Table<T>
                    rowKey={(record) => String(record.id)}
                    loading={loading}
                    dataSource={rows}
                    scroll={{ x: "max-content" }}
                    columns={[
                        ...columns.map((column) => ({ title: column.label, dataIndex: column.key, key: column.key, render: column.render, align: column.align, width: column.width })),
                        ...(renderActions
                            ? [{
                                title: "Actions",
                                key: "actions",
                                fixed: "right" as const,
                                width: 160,
                                render: (_: unknown, record: T) => (
                                    <TableActions buttons={renderActions(record, ctx)} record={record} />
                                ),
                            }]
                            : []),
                    ]}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total,
                        showTotal: (total) => <span className="text-muted-f">Total: {total}</span>,
                        showSizeChanger: true,
                        onShowSizeChange: (current, size) => { setPageSize(size); },
                        onChange: (nextPage) => setPage(nextPage),
                    }}
                />
            </div>
            {renderForm &&
            <Drawer
                title={selectedRow ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <EntryForm<T> form={form} onSubmit={handleSubmit} record={selectedRow ?? undefined}>
                    {renderForm(selectedRow ?? undefined)}
                </EntryForm>
            </Drawer>}
        </div>
    );
};

export default ListView;
