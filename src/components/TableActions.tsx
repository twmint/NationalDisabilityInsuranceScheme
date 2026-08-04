import { Space } from "antd";
import Button from "@/components/Button";

export type TableActionButton<T> = {
    label?: string;
    icon?: React.ReactNode;
    danger?: boolean;
    visible?: boolean;
    onClick: (record: T) => void;
};

export type TableActionsProps<T> = {
    buttons: TableActionButton<T>[];
    record: T;
};

function TableActions<T>({ buttons, record }: TableActionsProps<T>) {
    return (
        <Space size="middle">
            {buttons
                .filter((button) => button.visible !== false)
                .map((button, index) => (
                    <Button
                        key={button.label ?? index}
                        type="default"
                        size="small"
                        style={{ height: 28, padding: "0 10px" }}
                        danger={button.danger}
                        icon={button.icon}
                        onClick={(event) => {
                            event.stopPropagation();
                            button.onClick(record);
                        }}
                    >
                        {button.label}
                    </Button>
                ))}
        </Space>
    );
}

export default TableActions;