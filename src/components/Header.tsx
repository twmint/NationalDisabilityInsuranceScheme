import React from "react";
import { Card } from 'antd';

const Header: React.FC<{ title: string, subtitle: string}> = ({ title, subtitle } : { title: string, subtitle: string }) => {
    return (
        <header className="mb-5">
            <Card
                title={title}
                variant="borderless"
                styles={{
                    header: { borderBottom: "none", padding: "12px 20px 0", fontSize: "22px", fontWeight: 600 },
                    body: { padding: "0px 20px 25px" },
                }}
            >
                <p className="m-0 text-muted-f">{subtitle}</p>
            </Card>
        </header>
    )
}

export default Header