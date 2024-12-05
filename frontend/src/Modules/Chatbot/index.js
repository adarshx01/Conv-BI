import React, { useState } from "react";
import { Layout, Input, Button, Card, Avatar, Row, Col } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // Simulate a bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "How can I assist you today?" },
      ]);
    }, 1000);
  };

  return (
    <Layout style={{ height: "90vh" }}>
      {/* Header */}
      <Header style={{ background: "#ffffff", padding: "10px 20px", borderBottom: "1px solid #e0e0e0" }}>
        <h2 style={{ margin: 0, color: "#555", textAlign: "center" }}>
          <RobotOutlined style={{ color: "#96cfbc", marginRight: "8px" }} />
          Chatbot Assistant
        </h2>
      </Header>

      {/* Chat Area */}
      <Content style={{ padding: "20px" }}>
        <div
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {messages.map((message, index) => (
            <Row
              key={index}
              justify={message.sender === "user" ? "end" : "start"}
              style={{ marginBottom: "12px" }}
            >
              <Col span={16}>
                <Card
                  size="small"
                  style={{
                    background:
                      message.sender === "user" ? "#96cfbc" : "#e9d8a6",
                    borderRadius: "10px",
                    color: "#555",
                  }}
                >
                  <Row align="middle">
                    <Avatar
                      size="small"
                      icon={
                        message.sender === "user" ? (
                          <UserOutlined />
                        ) : (
                          <RobotOutlined />
                        )
                      }
                      style={{
                        background:
                          message.sender === "user" ? "#78b6a9" : "#c2a06c",
                        marginRight: "8px",
                      }}
                    />
                    <span>{message.text}</span>
                  </Row>
                </Card>
              </Col>
            </Row>
          ))}
        </div>
      </Content>

      {/* Input Section */}
      <Footer
        style={{
          background: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          padding: "10px 20px",
        }}
      >
        <Row gutter={10}>
          <Col span={20}>
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
