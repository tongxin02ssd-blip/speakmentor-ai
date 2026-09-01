import { Layout, Space, Tag, Typography } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

function AppHeader() {
  return (
    <Header className="app-header">
      <div className="header-brand">
        <Space size={10} align="center">
          <div className="brand-icon">
            <AudioOutlined />
          </div>

          <div>
            <Text className="brand-name">SpeakMentor AI</Text>
            <Text className="brand-slogan">
              Practice English in real conversations with AI.
            </Text>
          </div>
        </Space>
      </div>

      <Space size={12}>
        <Tag color="blue">Mock Ready</Tag>
        <Tag>Frontend Project</Tag>
      </Space>
    </Header>
  );
}

export default AppHeader;