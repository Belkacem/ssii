import React, { Component } from 'react';
import { Col, Layout, Row } from 'antd';
import Header from './header';
import Footer from './footer';
import { APP_DESC } from 'app/application/common/config/constants';

class LandingPage extends Component {
  render() {
    return (
      <Layout className="main">
        <Header />
        <Layout.Content>
          <div className="container">
            <Row type="flex" align="middle" justify="center" style={{ flex: 1 }}>
              <Col md={24}>
                <p style={{ textAlign: 'center', color: 'white', fontSize: 36 }}>
                  Welcome <b>to</b>
                  <br />
                  {APP_DESC}
                </p>
              </Col>
            </Row>
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
}

export default LandingPage;
