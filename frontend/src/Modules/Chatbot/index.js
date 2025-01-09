import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Card, Avatar, Row, Col, Tabs } from "antd";
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined,
  AudioOutlined
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const categories = [
  {
    title: "Sales Strategies",
    description: "Get tailored advice on increasing property visibility and driving sales.",
  },
  {
    title: "Negotiation Tactics",
    description: "Learn expert negotiation tips to close deals effectively.",
  },
  {
    title: "Marketing Insights",
    description: "Discover the best marketing strategies to showcase your properties.",
  },
  {
    title: "General Support",
    description: "Need help with something else? Ask away, and we'll guide you.",
  },
];

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;
    
    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Thank you for your message: "${input}". How can I assist you further?` },
      ]);
    }, 1000);
  };

  return (
    <Layout style={{ height: "90vh" }}>
      <Header style={{ 
        background: "#ffffff", 
        padding: "0", 
        borderBottom: "1px solid #e0e0e0"
      }}>
        <Tabs defaultActiveKey="general" className="custom-tabs">
          <TabPane tab="General" key="general" />
          <TabPane tab="Sales GPT" key="sales" />
          <TabPane tab="Project Tracker" key="project" />
        </Tabs>
      </Header>

      <Content style={{ padding: "20px" }}>
        <div
          ref={scrollRef}
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <Row
                key={index}
                justify={message.sender === "user" ? "end" : "start"}
                style={{ marginBottom: "12px" }}
              >
                <Col span={16}>
                  <Card
                    size="small"
                    style={{
                      background: message.sender === "user" ? "#96cfbc" : "#e9d8a6",
                      borderRadius: "10px",
                      color: "#555",
                    }}
                  >
                    <Row align="middle">
                      <Avatar
                        size="small"
                        icon={message.sender === "user" ? <UserOutlined /> : <RobotOutlined />}
                        style={{
                          background: message.sender === "user" ? "#78b6a9" : "#c2a06c",
                          marginRight: "8px",
                        }}
                      />
                      <span>{message.text}</span>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ))
          ) : (
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                How can I assist you today?
              </h1>
              <p style={{ color: "#666", marginBottom: "32px" }}>
                Get expert guidance powered by AI agents specializing in Sales, Marketing, and Negotiation.
                Choose the agent that suits your needs and start your conversation with ease.
              </p>
              <Row gutter={[16, 16]}>
                {categories.map((category) => (
                  <Col span={12} key={category.title}>
                    <Card hoverable style={{ cursor: "pointer" }}>
                      <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>{category.title}</h3>
                      <p style={{ color: "#666", fontSize: "14px" }}>{category.description}</p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </Content>

      <Footer
        style={{
          background: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          padding: "10px 20px",
        }}
      >
        <Row gutter={10}>
          <Col span={2}>
            <Button
              icon={<AudioOutlined />}
              style={{
                width: "100%",
                borderRadius: "10px",
              }}
            />
          </Col>
          <Col span={18}>
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              style={{
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              style={{
                width: "100%",
                borderRadius: "10px",
                background: "#0c3049",
                border: "none",
              }}
            >
              Send
            </Button>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
};

export default ChatbotPage;