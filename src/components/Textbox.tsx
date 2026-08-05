"use client";

import React from "react";
import { Input, InputProps, Typography } from "antd";

export type TextboxProps = InputProps & {
  label?: string;
  placeholder?: string;
};

const Textbox: React.FC<TextboxProps> = ({ label, ...rest }) => {
  return (
    <div>
      {label && (
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
          {label}
        </Typography.Text>
      )}
      <Input {...rest} />
    </div>
  );
};

export default Textbox;
