import React, { useState } from "react"
import { Layout, Menu, Avatar, Button, Typography, Modal, Upload, message, Select } from "antd"
import { Link } from "react-router-dom"
import {
  DashboardOutlined,
  RobotOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  UserOutlined,
  UploadOutlined,
  InboxOutlined,
} from "@ant-design/icons"

const { Sider } = Layout
const { Text } = Typography
const { Option } = Select

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState("Zoho Data")

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const handleFileUpload = (info) => {
    const { status } = info.file
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="sidebar-container"
      width={256}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #e0e0e0",
      }}
    >
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {!collapsed && (
          <Typography.Title level={4} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
        )}
        <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={toggleCollapse} />
      </div>
      <Menu mode="inline" theme="dark" defaultSelectedKeys={["1"]} className="sidebar-menu" inlineCollapsed={collapsed}>
        <Menu.Item
          key="upload"
          icon={<UploadOutlined />}
          onClick={() => setIsUploadModalVisible(true)}
          style={{ marginLeft: "0.4rem", width: "85%" }}
        >
          Upload
        </Menu.Item>
        <Menu.Item
          key="1"
          icon={<DashboardOutlined className="sidebar-menu-item-icon" />}
          className="sidebar-menu-item"
        >
          <Link to="/dashboard" className="sidebar-menu-item-link">
            Dashboards
          </Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<RobotOutlined className="sidebar-menu-item-icon" />} className="sidebar-menu-item">
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
            <Button icon={<MessageOutlined />} onClick={handleNewChat} block style={{ marginBottom: "16px" }}>
              New Chat
            </Button>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Recent Chats
            </Text>
            <Menu mode="inline" theme="light" selectedKeys={[currentChatId]}>
              {chats.map((chat) => (
                <Menu.Item key={chat.id} onClick={() => setCurrentChatId(chat.id)}>
                  {chat.title}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "16px",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button
          type="text"
          block
          style={{ textAlign: "left" }}
          icon={<Avatar size="small" icon={<UserOutlined />} style={{ marginRight: "8px" }} />}
        >
          {!collapsed && (
            <div style={{ display: "inline-block" }}>
              <div style={{ fontWeight: "500" }}>Project Manager</div>
              <div style={{ fontSize: "12px", color: "#666" }}>View Profile</div>
            </div>
          )}
        </Button>
      </div>
      <Modal
        title="Upload your Excel or CSV Files"
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
      >
        <div style={{ display: "flex", justifyContent: "left" }}>
          <span style={{textAlign:"right",marginTop:"0.2rem",marginRight:"0.4rem",fontSize:"1rem"}}>Upload to : </span>
          <Select
            style={{ width: "40%", marginBottom: "16px" }}
            value={selectedDataSource}
            onChange={(value) => setSelectedDataSource(value)}
          >
            <Option value="Zoho Data">Zoho Data</Option>
            <Option value="Ainsyt Data">Ainsyt Data</Option>
          </Select>
        </div>
        <Upload.Dragger
          name="file"
          multiple={true}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76" // Replace with your actual upload endpoint
          onChange={handleFileUpload}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for Excel (.xlsx, .xls) and CSV (.csv) files.</p>
        </Upload.Dragger>
      </Modal>
    </Sider>
  )
}

export default Sidebar

