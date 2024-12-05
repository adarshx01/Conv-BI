import React, { useState } from "react";
import { Layout, Table, Input, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;

const Dashboard = () => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([
    {
      key: "1",
      dashboard: "Executive Dashboard",
      lastUpdated: "2 days ago",
      createdBy: "John Doe",
    },
    {
      key: "2",
      dashboard: "Marketing Dashboard",
      lastUpdated: "5 days ago",
      createdBy: "Jane Smith",
    },
    {
      key: "3",
      dashboard: "Product Dashboard",
      lastUpdated: "1 days ago",
      createdBy: "Emily Davis",
    },
    {
      key: "4",
      dashboard: "Sales Dashboard",
      lastUpdated: "2 days ago",
      createdBy: "Adam Johnson",
    },
    {
      key: "5",
      dashboard: "Support Dashboard",
      lastUpdated: "5 days ago",
      createdBy: "Sophia Wilson",
    },
    {
      key: "6",
      dashboard: "Engineering Dashboard",
      lastUpdated: "1 days ago",
      createdBy: "Robert Lee",
    },
    {
      key: "7",
      dashboard: "Executive Dashboard",
      lastUpdated: "2 days ago",
      createdBy: "John Doe",
    },
    {
      key: "8",
      dashboard: "Marketing Dashboard",
      lastUpdated: "5 days ago",
      createdBy: "Jane Smith",
    },
    {
      key: "9",
      dashboard: "Product Dashboard",
      lastUpdated: "1 days ago",
      createdBy: "Emily Davis",
    },
    {
      key: "10",
      dashboard: "Sales Dashboard",
      lastUpdated: "2 days ago",
      createdBy: "Adam Johnson",
    },
    {
      key: "11",
      dashboard: "Support Dashboard",
      lastUpdated: "5 days ago",
      createdBy: "Sophia Wilson",
    },
    {
      key: "12",
      dashboard: "Engineering Dashboard",
      lastUpdated: "1 days ago",
      createdBy: "Robert Lee",
    },
  ]);

  const columns = [
    {
      title: "Dashboard",
      dataIndex: "dashboard",
      key: "dashboard",
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          style={{
            background: "#96cfbc",
            color: "#ffff",
            borderColor: "#96cfbc",
            fontWeight:500,
          }}
          onClick={() => console.log(`View ${record.dashboard}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const filteredData = data.filter((item) =>
    item.dashboard.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Content style={{ margin: "16px", background: "#fff", padding: "16px" }}>
      <h2>Canned Dashboards</h2>

      {/* Search Bar */}
      <Space style={{ marginBottom: 16, display: "flex" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search Dashboard"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ minWidth: 400 }}
        />
      </Space>

      {/* Table */}
      <Table columns={columns} dataSource={filteredData} />
    </Content>
  );
};

export default Dashboard;
