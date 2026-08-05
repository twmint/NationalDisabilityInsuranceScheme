"use client";

import { Drawer, FormInstance } from "antd";
import EntryForm from "@/components/EntryForm";

export type FormDrawerActions = {
    submit: () => void;
    cancel: () => void;
    submitting: boolean;
};

export type FormDrawerProps<T> = {
    open: boolean;
    title: string;
    width?: number;
    submitting?: boolean;
    form: FormInstance;
    record?: T;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
    children: (actions: FormDrawerActions) => React.ReactNode;
};

function FormDrawer<T extends Record<string, unknown>>({
    open,
    title,
    width = 380,
    submitting = false,
    form,
    record,
    onClose,
    onSubmit,
    children,
}: FormDrawerProps<T>) {
    const actions: FormDrawerActions = {
        submit: () => form.submit(),
        cancel: onClose,
        submitting,
    };

    return (
        <Drawer title={title} open={open} onClose={onClose} size={width}>
            <EntryForm<T> form={form} onSubmit={onSubmit} record={record}>
                {children(actions)}
            </EntryForm>
        </Drawer>
    );
}

export default FormDrawer;
