import React, { useState, useEffect } from "react";
import { Tabs, Card, Tag, Empty, Spin, Statistic, Row, Col, Button } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";
import CreateLearningModal from "../path/to/CreateLearningModal"; // Adjust the path to your modal component
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  PauseCircleOutlined, 
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  ExperimentOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const LearningDashboard = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    recent: 0,
    byTemplate: {}
  });

  useEffect(() => {
    const loadUserLearning = async () => {
      if (!snap.currentUser?.uid) {
        return;
      }

      try {
        setLoading(true);
        const userLearning = await LearningService.getLearningByUserId(snap.currentUser.uid);
        
        // Sort by timestamp in descending order
        userLearning.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        state.learningEntries = userLearning;

        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const templateCounts = {};
        const completed = userLearning.filter(entry => entry.status === "Completed").length;
        const inProgress = userLearning.filter(entry => entry.status === "In Progress").length;
        const recent = userLearning.filter(entry => new Date(entry.timestamp) > oneWeekAgo).length;
        
        userLearning.forEach(entry => {
          const template = entry.template || "general";
          templateCounts[template] = (templateCounts[template] || 0) + 1;
        });

        setStats({
          total: userLearning.length,
          completed,
          inProgress,
          recent,
          byTemplate: templateCounts
        });

      } catch (err) {
        console.error("Failed to fetch learning entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserLearning();
  }, [snap.currentUser?.uid]);

  const handleViewDetails = (learning) => {
    state.selectedLearning = learning;
    state.learningDetailsModalOpened = true;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Completed":
        return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
      case "In Progress":
        return <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>;
      case "On Hold":
        return <Tag color="warning" icon={<PauseCircleOutlined />}>On Hold</Tag>;
      case "Planned":
        return <Tag color="default" icon={<CalendarOutlined />}>Planned</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getTemplateIcon = (template) => {
    switch (template) {
      case "project":
        return <ExperimentOutlined />;
      case "certification":
        return <TrophyOutlined />;
      case "challenge":
        return <ExperimentOutlined />;
      case "workshop":
        return <TeamOutlined />;
      default:
        return <BookOutlined />;
    }
  };

  const getTemplateLabel = (template) => {
    switch (template) {
      case "project":
        return "Project";
      case "certification":
        return "Certification";
      case "challenge":
        return "Challenge";
      case "workshop":
        return "Workshop";
      default:
        return "General";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderLearningCard = (learning) => (
    <Card 
      key={learning.id} 
      className="learning-card"
      title={
        <div className="learning-card-title">
          <span className="template-icon">{getTemplateIcon(learning.template)}</span>
          <span>{learning.topic}</span>
        </div>
      }
      extra={getStatusTag(learning.status)}
      onClick={() => handleViewDetails(learning)}
    >
      <div className="card-content">
        <p className="template-tag">{getTemplateLabel(learning.template)}</p>
        <p className="description">{learning.description}</p>
        <div className="card-footer">
          <span className="timestamp">{formatDate(learning.timestamp)}</span>
          <Button type="link" onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(learning);
          }}>
            Details
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="learning-dashboard">
      <div className="dashboard-header">
        <h2>Learning Dashboard</h2>
        {/* New Button for Creating Learning Entries */}
        <Button 
          type="primary" 
          onClick={() => {
            console.log("Opening Create Learning Modal");
            state.createLearningModalOpened = true;
          }}
        >
          Add New Learning
        </Button>
      </div>

      <div className="stats-section">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Learning Entries" 
                value={stats.total} 
                prefix={<BookOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Completed" 
                value={stats.completed} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="In Progress" 
                value={stats.inProgress} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Added This Week" 
                value={stats.recent} 
                prefix={<CalendarOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="learning-content">
        <Tabs defaultActiveKey="all" className="learning-tabs">
          <TabPane tab="All Learning" key="all">
            <div className="learning-grid">
              {snap.learningEntries?.length > 0 ? (
                snap.learningEntries.map(learning => renderLearningCard(learning))
              ) : (
                <Empty description="No learning entries found" />
              )}
            </div>
          </TabPane>
          
          {/* Other Tabs Here */}
          
        </Tabs>
      </div>

      {/* Render the Create Learning Modal */}
      {state.createLearningModalOpened && <CreateLearningModal />}
    </div>
  );
};

export default LearningDashboard;
