import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Import the external CSS file

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Login Success:", values);
    onLogin(); // Update authentication status
    navigate("/dashboard"); // Navigate to the dashboard
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="centered-container">
        <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Welcome!</h1>
        <p style={{ fontSize: "1.2rem", textAlign: "center", maxWidth: "400px" }}>
          Sign in to access your dashboard and explore our features.
        </p>
      </div>

      {/* Right Section */}
      <div className="login-form-container">
        <div className="login-form-box">
          <h2 className="form-title">Sign in to your account</h2>
          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember this account</Checkbox>
            </Form.Item>

            <div className="forgot-password">
              <a href="#">Forgot your password?</a>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Continue
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
