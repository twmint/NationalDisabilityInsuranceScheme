"use client";

import React from "react";
import { Select, SelectProps, Typography } from "antd";

export type DropdownOption = {
  label: string;
  value: string;
};

export type DropdownListProps = SelectProps & {
  label?: string;
  placeholder?: string;
};

const DropdownList: React.FC<DropdownListProps> = ({ label, showSearch = true, ...rest }) => {
  return (
    <div>
    {label && (
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
        {label}
      </Typography.Text>
    )}
      <Select showSearch={showSearch} style={{ width: "100%" }} {...rest} allowClear />
    </div>
  );
};

export default DropdownList;
