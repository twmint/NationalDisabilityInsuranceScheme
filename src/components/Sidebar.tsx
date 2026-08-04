"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MoonOutlined,
    SunOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useThemeModeContext } from './ThemeProvider';
import { menuItems, menuRoutes } from '@/lib/menuItems';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { mode, toggle } = useThemeModeContext();
    const pathname = usePathname();
    const activeKey = Object.keys(menuRoutes).find((key) => menuRoutes[key] === pathname) ?? '1';

    return (
        <Sider theme="light" trigger={null} collapsible collapsed={collapsed} width={300}>
            <div className="relative h-full">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className={collapsed ? "hidden" : ""}>
                        <h3>NDIS Portal</h3>
                    </div>
                    <div className={"flex items-center " + (collapsed ? "flex-col gap-3" : "gap-1")}>
                        <Button 
                            icon={<LogoutOutlined />}
                            className="btn-icon"
                        />
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="btn-icon"
                        />
                    </div>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeKey]}
                    items={menuItems}
                    className="gap-1"
                />
                <div className="absolute bottom-0 right-6 mb-4">
                    <Button 
                        onClick={toggle}
                        icon={mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
                        className="btn-icon-b"
                    />
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;