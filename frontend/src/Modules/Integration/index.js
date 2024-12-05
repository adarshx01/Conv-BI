import React, { useState } from "react";
import { Layout, Button, Upload, Progress, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./style.css"; // Import the stylesheet

const { Content } = Layout;
const { Title, Text } = Typography;

const UploadPage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const dummyRequest = ({ onProgress, onSuccess }) => {
    setUploading(true);
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        onProgress({ percent: progress });
        setUploadProgress(progress);
      } else {
        clearInterval(interval);
        setUploading(false);
        onSuccess("ok");
      }
    }, 600);
  };

  return (
    <>
      {/* Main Content */}
      <Content className="content">
        {/* Header */}
        <Title level={2}>Welcome to Insight</Title>
        <Text className="description">
          You have no data. Get started by uploading a file or connecting a data source.
        </Text>

        {/* Buttons */}
        <div className="button-group">
          <Upload customRequest={dummyRequest} showUploadList={false}>
            <Button
              type="primary"
              className="upload-button"
              disabled={uploading}
              icon={<UploadOutlined />}
            >
              Upload
            </Button>
          </Upload>
          <Button className="connect-button">Connect a Data Source</Button>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="progress-container">
            <Text>Uploading...</Text>
            <Progress
              percent={uploadProgress}
              status="active"
              strokeColor={{
                from: "#96cfbc",
                to: "#439397",
                direction: "to right",
              }}
              trailColor="#E6E6E6"
            />
          </div>
        )}
      </Content>
    </>
  );
};

export default UploadPage;
