import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  RobotOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import "./style.css"; // Import external CSS file

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false); // Start with expanded state (collapsed: false)

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}  // Correcting collapse behavior
      className="sidebar-container"
    >
      {/* Toggle Button */}
      <div
        className={`sidebar-toggle ${collapsed ? "" : "sidebar-toggle-expanded"}`}
        onClick={toggleCollapse}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      {/* Menu Items */}
      <Menu
        mode="inline"
        theme="dark"
        defaultSelectedKeys={["1"]}
        className="sidebar-menu"
        inlineCollapsed={collapsed}  // Ensure this is passed to Menu component
      >
        <Menu.Item
          key="1"
          icon={<DashboardOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/dashboard" className="sidebar-menu-item-link">
            Canned Dashboards
          </Link>
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<RobotOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/chatbot" className="sidebar-menu-item-link">
            Chatbot
          </Link>
        </Menu.Item>
        <Menu.Item
          key="3"
          icon={<BarChartOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/reportbuilder" className="sidebar-menu-item-link">
          Report Builder
          </Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<DatabaseOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/upload" className="sidebar-menu-item-link">
            Data Sources
          </Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<DatabaseOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/chartreport" className="sidebar-menu-item-link">
            ChartReport
          </Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<DatabaseOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/reportdesigner" className="sidebar-menu-item-link">
          RDesigner
          </Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<DatabaseOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/UpdatedCanva" className="sidebar-menu-item-link">
          UpdatedCanva
          </Link>
        </Menu.Item>

      </Menu>
    </Sider>
  );
};

export default Sidebar;
