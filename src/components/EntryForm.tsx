"use client";

import { Form, FormInstance } from "antd"

export type EntryFormProps<T> = {
    children: React.ReactNode;
    onSubmit: (data: Record<string, unknown>) => void;
    record?: T;
    form?: FormInstance;
};

function EntryForm<T extends Record<string, unknown>>({ children, onSubmit, record, form }: EntryFormProps<T>) {
    return (
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={record}>
            { children }
        </Form>
    )
}

export default EntryForm
