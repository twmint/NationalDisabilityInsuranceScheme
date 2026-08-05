"use client";

import React, { useCallback, useEffect, useState } from "react";
import { App, Form, Table } from "antd";
import APIManager, { APIError } from "@/lib/apiManager";
import { useDebounce } from "@/hooks/useDebounce";
import TableActions, { TableActionButton } from "@/components/TableActions";
import FormDrawer, { FormDrawerActions } from "@/components/FormDrawer";

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
    deleteRow: (row: T) => void;
};

export type ListViewProps<T extends Record<string, unknown> & { id?: number | string }> = {
    resourcePath: string;
    entityLabel: string;
    columns: ListViewColumn<T>[];
    renderActions?: (row: T, ctx: ListViewContext<T>) => TableActionButton<T>[];
    children: (ctx: ListViewContext<T>) => React.ReactNode;
    renderForm?: (record: T | undefined, actions: FormDrawerActions) => React.ReactNode;
    drawerWidth?: number;
};

function ListView<T extends Record<string, unknown> & { id?: number | string }>({
    resourcePath,
    entityLabel,
    columns,
    renderActions,
    children,
    renderForm,
    drawerWidth,
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
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const { modal, message } = App.useApp();
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
            const fetchedTotal = body.total ?? 0;
            const maxPage = Math.max(1, Math.ceil(fetchedTotal / pageSize));

            if (page > maxPage) {
                setPage(maxPage);
                return;
            }
            setRows(body.data ?? []);
            setTotal(fetchedTotal);
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
        deleteRow: (row) => handleDelete(row),
    };

    async function handleSubmit(data: Record<string, unknown>) {
        setSubmitting(true);
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

            if (error instanceof APIError && error.details) {
                const formFields = new Set(form.getFieldsError().map((field) => String(field.name[0])));
                const entries = Object.entries(error.details);
                const actionable = entries.filter(([field]) => formFields.has(field));
                const nonActionable = entries.filter(([field]) => !formFields.has(field));

                if (actionable.length > 0) {
                    form.setFields(actionable.map(([field, errorMessage]) => ({ name: field, errors: [errorMessage] })));
                }
                
                if (nonActionable.length > 0) {
                    message.error(nonActionable.map(([, errorMessage]) => errorMessage).join(" "));
                } else if (actionable.length === 0) {
                    message.error(error.message);
                }
            } else {
                const description = error instanceof APIError ? error.message : "Something went wrong. Please try again.";
                message.error(description);
            }
        } finally {
            setSubmitting(false);
        }
    };

    function handleDelete(row: T) {
        modal.confirm({
            title: `Delete ${entityLabel}?`,
            content: "This action cannot be undone.",
            okText: "Delete",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await APIManager.getInstance().delete(`${resourcePath}/${row.id}`);
                    ctx.refresh();
                } catch (error) {
                    console.error("Error deleting entry:", error);
                    const description = error instanceof APIError ? error.message : "Something went wrong. Please try again.";
                    message.error(description);
                }
            },
        });
    }

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
            <FormDrawer<T>
                open={drawerOpen}
                title={selectedRow ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
                width={drawerWidth}
                submitting={submitting}
                form={form}
                record={selectedRow ?? undefined}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
            >
                {(actions) => renderForm(selectedRow ?? undefined, actions)}
            </FormDrawer>}
        </div>
    );
};

export default ListView;
