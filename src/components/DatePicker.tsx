import React from "react";
import { DatePicker as AntDatePicker, DatePickerProps as AntDatePickerProps, Typography } from "antd";
import dayjs from "dayjs";

export type DatePickerProps = Omit<AntDatePickerProps, "value" | "onChange"> & {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, ...rest }) => {
  return (
    <div>
      {label && (
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
          {label}
        </Typography.Text>
      )}
      <AntDatePicker
        format="DD/MM/YYYY"
        style={{ width: "100%" }}
        value={value ? dayjs(value) : undefined}
        onChange={(date) => onChange?.(date && !Array.isArray(date) ? date.format("YYYY-MM-DD") : undefined)}
        {...rest}
      />
    </div>
  );
};

export default DatePicker;
