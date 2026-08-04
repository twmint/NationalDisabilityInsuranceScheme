import Link from 'next/link';
import {
    ContainerOutlined,
    DashboardOutlined,
    DollarOutlined,
    DropboxOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export const menuRoutes: Record<string, string> = {
    '1': '/',
    '2': '/clients',
    '3': '/providers',
    '4-1': '/invoices',
    '4-2': '/invoices/uploads',
    '5': '/rate-sets',
    '6-1': '/settings/app-users',
    '6-2': '/settings/rbac-roles',
    '6-3': '/settings/genders',
    '6-4': '/settings/auth-sessions',
    '6-5': '/settings/audit-logs',
};

function navItem(key: string, label: string, icon?: React.ReactNode) {
    return { key, icon, label: <Link href={menuRoutes[key]}>{label}</Link> };
}

export const menuItems: MenuItem[] = [
    navItem('1', 'Dashboard', <DashboardOutlined />),
    navItem('2', 'Participants', <UserOutlined />),
    navItem('3', 'Providers', <DropboxOutlined />),
    { key: '4', icon: <ContainerOutlined />, label: 'Invoices', children: [
        navItem('4-1', 'Invoice List'),
        navItem('4-2', 'Upload History'),
    ] },
    navItem('5', 'Rate Sets', <DollarOutlined />),
    { key: '6', icon: <SettingOutlined />, label: 'Settings', children: [
        navItem('6-1', 'Users'),
        navItem('6-2', 'User Roles'),
        navItem('6-3', 'Genders'),
        navItem('6-4', 'Auth Sessions'),
        navItem('6-5', 'Audit Logs'),
    ] },
];
