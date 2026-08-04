import React from "react";
import { DatePicker, Typography } from "antd";

const { RangePicker } = DatePicker;

export type DateRangePickerProps = Omit<React.ComponentProps<typeof RangePicker>, "placeholder"> & {
  label?: string;
  placeholder: [string, string];
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({ label, placeholder, ...rest }) => {
  return (
    <div>
      {label && (
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
          {label}
        </Typography.Text>
      )}
      <RangePicker placeholder={placeholder} style={{ width: "100%" }} {...rest} />
    </div>
  );
};

export default DateRangePicker;
