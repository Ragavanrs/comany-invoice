import React from 'react';
import { Layout } from 'antd';
import './App.css';
import TaxInvoiceForm from './TaxInvoice';
import 'antd/dist/reset.css';

const { Content } = Layout;

function App() {
  return (
    <Layout className="layout">
      <Content style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
        <div className="site-layout-content">
          <TaxInvoiceForm />
        </div>
      </Content>
    </Layout>
  );
}

export default App;