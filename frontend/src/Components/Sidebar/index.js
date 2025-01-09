import React, { useState } from "react";
import { Layout, Menu, Avatar, Button, Typography } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  RobotOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  UserOutlined
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="sidebar-container"
      width={256}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #e0e0e0"
      }}
    >
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {!collapsed && <Typography.Title level={4} style={{ margin: 0 }}>Dashboard</Typography.Title>}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapse}
        />
      </div>

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
          key="4"
          icon={<DatabaseOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
          onClick={toggleCollapse}
        >
          <Link to="/reportdesigner" className="sidebar-menu-item-link">
          Report Builder
          </Link>
        </Menu.Item>

      </Menu>

      {!collapsed && (
        <>
          <div style={{ padding: "16px" }}>
            <Button
              icon={<MessageOutlined />}
              onClick={handleNewChat}
              block
              style={{ marginBottom: "16px" }}
            >
              New Chat
            </Button>
            
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Recent Chats
            </Text>
            <Menu mode="inline" theme="light" selectedKeys={[currentChatId]}>
              {chats.map((chat) => (
                <Menu.Item
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  {chat.title}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </>
      )}

      <div style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: "16px",
        borderTop: "1px solid #e0e0e0"
      }}>
        <Button
          type="text"
          block
          style={{ textAlign: "left" }}
          icon={
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ marginRight: "8px" }}
            />
          }
        >
          {!collapsed && (
            <div style={{ display: "inline-block" }}>
              <div style={{ fontWeight: "500" }}>Project Manager</div>
              <div style={{ fontSize: "12px", color: "#666" }}>View Profile</div>
            </div>
          )}
        </Button>
      </div>
    </Sider>
  );
};

export default Sidebar;