import React, { useState } from "react";
import { Layout, Select, Checkbox, Table, Row, Col, Button, Space } from "antd";
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, RadarChartOutlined, AreaChartOutlined, BulbOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import { Bar, Pie, Line, Radar, Doughnut, PolarArea, Bubble, Scatter } from "react-chartjs-2";
import "./style.css";

// Register the required components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  BubbleController,
  RadarController,
  PolarAreaController,
  DoughnutController,
  ScatterController,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  BubbleController,
  RadarController,
  PolarAreaController,
  DoughnutController,
  ScatterController
);

const { Content } = Layout;
const { Option } = Select;

const dataSets = {
  sales: [
    { date: "2024-01-01", amount: 500, product: "Product A" },
    { date: "2024-01-02", amount: 700, product: "Product B" },
    { date: "2024-01-03", amount: 200, product: "Product C" },
  ],
  users: [
    { date: "2024-01-01", amount: 10, product: "User A" },
    { date: "2024-01-02", amount: 15, product: "User B" },
    { date: "2024-01-03", amount: 8, product: "User C" },
  ],
  products: [
    { date: "2024-01-01", amount: 50, product: "Widget A" },
    { date: "2024-01-02", amount: 70, product: "Widget B" },
    { date: "2024-01-03", amount: 20, product: "Widget C" },
  ],
};

const ReportBuilder = () => {
  const [selectedData, setSelectedData] = useState("sales");
  const [chartType, setChartType] = useState("bar");
  const [selectedFields, setSelectedFields] = useState([
    "date",
    "amount",
    "product",
  ]);

  const data = dataSets[selectedData];

  // Configure Chart Data
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: selectedData.charAt(0).toUpperCase() + selectedData.slice(1),
        data: data.map((item) => item.amount),
        backgroundColor: ["#96cfbc", "#439397", "#276074"],
        borderColor: "#0c3049",
        borderWidth: 1,
      },
    ],
  };

  // Table Columns
  const columns = selectedFields.map((field) => ({
    title: field.charAt(0).toUpperCase() + field.slice(1),
    dataIndex: field,
    key: field,
  }));

  // Handle Field Selection
  const handleFieldChange = (checkedValues) => {
    setSelectedFields(checkedValues);
  };

  // Handle Chart Type Selection
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  return (
    <Layout>
      <Content className="layout-content">
        <Row gutter={[16, 16]}>
          {/* Charts on the Left */}
          <Col span={16}>
            <div className="chart-container">
              <div className="chart-canvas" style={{ height: "400px" }}>
                {chartType === "bar" && (
                  <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "pie" && (
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "line" && (
                  <Line data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "bubble" && (
                  <Bubble data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "radar" && (
                  <Radar data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "polar" && (
                  <PolarArea data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "doughnut" && (
                  <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
                )}
                {chartType === "scatter" && (
                  <Scatter data={chartData} options={{ maintainAspectRatio: false }} />
                )}
              </div>
            </div>
          </Col>

          {/* Filters and Graph Icons on the Right */}
          <Col span={8}>
            <div className="filter-panel">
              <div className="filter-title">Filters</div>

              {/* Dropdown for Table Selection */}
              <Select
                defaultValue="sales"
                style={{ width: "100%", marginBottom: "16px" }}
                onChange={setSelectedData}
              >
                <Option value="sales">Sales Data</Option>
                <Option value="users">User Data</Option>
                <Option value="products">Product Data</Option>
              </Select>

              {/* Checkbox for Fields */}
              <Checkbox.Group
                options={[
                  { label: "Date", value: "date" },
                  { label: "Amount", value: "amount" },
                  { label: "Product", value: "product" },
                ]}
                defaultValue={["date", "amount", "product"]}
                onChange={handleFieldChange}
              />

              <div className="chart-icons">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("bar")}
                    >
                      <BarChartOutlined style={{ fontSize: "30px" }} />
                      Bar Chart
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("pie")}
                    >
                      <PieChartOutlined style={{ fontSize: "30px" }} />
                      Pie Chart
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("line")}
                    >
                      <LineChartOutlined style={{ fontSize: "30px" }} />
                      Line Chart
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("radar")}
                    >
                      <RadarChartOutlined style={{ fontSize: "30px" }} />
                      Radar Chart
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("polar")}
                    >
                      <AppstoreAddOutlined style={{ fontSize: "30px" }} />
                      Polar Area
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("doughnut")}
                    >
                      <BulbOutlined style={{ fontSize: "30px" }} />
                      Doughnut Chart
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleChartTypeChange("scatter")}
                    >
                      <AreaChartOutlined style={{ fontSize: "30px" }} />
                      Scatter Chart
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>

        {/* Table for Data */}
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          style={{ marginTop: "16px" }}
        />
      </Content>
    </Layout>
  );
};

export default ReportBuilder;
