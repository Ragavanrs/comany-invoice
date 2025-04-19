import React, { useState, useCallback } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Table,
  Select,
  Typography,
  Space,
  Card,
  InputNumber,
  Row,
  Col,
  message
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { generatePDF } from './pdfGenerator';
import "./invoice.css";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const validateGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

const TaxInvoiceForm = () => {
  const [form] = Form.useForm();
  const [gstType, setGstType] = useState('igst'); // 'igst' or 'sgst'
  const [items, setItems] = useState([
    { description: "", hsnCode: "", qty: "", gst: 18, rate: "", amount: 0 },
  ]);

  const handleItemChange = useCallback((index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Calculate amount if qty, rate, or gst changes
    if (field === 'qty' || field === 'rate' || field === 'gst') {
      const qty = field === 'qty' ? value : newItems[index].qty;
      const rate = field === 'rate' ? value : newItems[index].rate;
      const gst = field === 'gst' ? value : newItems[index].gst;

      // Only calculate if both qty and rate are valid numbers
      if (qty && rate) {
        const baseAmount = parseFloat(qty) * parseFloat(rate);
        const gstAmount = (baseAmount * gst) / 100;
        newItems[index].amount = baseAmount + gstAmount;
      } else {
        newItems[index].amount = 0;
      }
    }

    setItems(newItems);
  }, [items]);

  const calculateGSTBreakup = useCallback((baseAmount, gstRate) => {
    if (gstType === 'igst') {
      return {
        igst: (baseAmount * gstRate) / 100,
        cgst: 0,
        sgst: 0
      };
    } else {
      const halfGstRate = gstRate / 2;
      return {
        igst: 0,
        cgst: (baseAmount * halfGstRate) / 100,
        sgst: (baseAmount * halfGstRate) / 100
      };
    }
  }, [gstType]);

  const addItemRow = () => {
    setItems([...items, { description: "", hsnCode: "", qty: "", gst: 18, rate: "", amount: 0 }]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    const baseTotal = items.reduce((total, item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      return total + (qty * rate);
    }, 0);
    const gstBreakup = calculateGSTBreakup(baseTotal, 18); // Using 18% as default GST rate
    const totalGST = gstBreakup.igst + gstBreakup.cgst + gstBreakup.sgst;
    return (baseTotal + totalGST).toFixed(2);
  };

  const validateItems = () => {
    if (!items || items.length === 0) {
      message.error('Please add at least one item');
      return false;
    }

    const invalidItems = items.filter(
      item => !item.description || !item.qty || !item.rate
    );

    if (invalidItems.length > 0) {
      message.error('Please complete all item details (Description, Quantity, and Rate are required)');
      return false;
    }

    return true;
  };

  const onFinish = (values) => {
    if (!validateItems()) {
      return;
    }

    // Format values for PDF generation
    const formattedValues = {
      ...values,
      items: items.map(item => ({
        ...item,
        hsn: item.hsnCode || '',  // Ensure HSN code is never undefined
        qty: item.qty || 0,
        rate: item.rate || 0,
        amount: item.amount || 0
      }))
    };

    generatePDF(formattedValues, gstType);
  };

  const columns = [
    { title: 'S.No', dataIndex: 'index', key: 'index', width: '60px',
      render: (_, __, index) => index + 1 },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (text, _, index) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={text === '' ? 'error' : ''}
          help={text === '' ? 'Required' : null}
        >
          <Input
            value={text}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            placeholder="Item description"
          />
        </Form.Item>
      )
    },
    { title: 'HSN Code', dataIndex: 'hsnCode', key: 'hsnCode',
      render: (text, _, index) => (
        <Input
          value={text}
          onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
          placeholder="HSN code"
        />
      )
    },
    { title: 'Qty', dataIndex: 'qty', key: 'qty',
      render: (value, _, index) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={value === '' || value === null ? 'error' : ''}
          help={value === '' || value === null ? 'Required' : null}
        >
          <InputNumber
            min={0}
            value={value}
            onChange={(value) => handleItemChange(index, 'qty', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    { title: 'GST %', dataIndex: 'gst', key: 'gst',
      render: (value, _, index) => (
        <Select
          value={value}
          onChange={(value) => handleItemChange(index, 'gst', value)}
          style={{ width: '100%' }}
        >
          <Option value={0}>0%</Option>
          <Option value={5}>5%</Option>
          <Option value={12}>12%</Option>
          <Option value={18}>18%</Option>
          <Option value={28}>28%</Option>
        </Select>
      )
    },
    { title: 'Rate', dataIndex: 'rate', key: 'rate',
      render: (value, _, index) => (
        <Form.Item
          style={{ margin: 0 }}
          validateStatus={value === '' || value === null ? 'error' : ''}
          help={value === '' || value === null ? 'Required' : null}
        >
          <InputNumber
            min={0}
            value={value}
            onChange={(value) => handleItemChange(index, 'rate', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    { title: 'Amount', dataIndex: 'amount', key: 'amount',
      render: (value) => value.toFixed(2)
    },
    { title: 'Action', key: 'action',
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => removeItemRow(index)}
        />
      )
    },
  ];

  return (
    <Card>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Tax Invoice Form</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
        }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="invoiceNo"
              label="Invoice No"
              rules={[{ required: true, message: 'Please input invoice number!' }]}
            >
              <Input placeholder="Enter invoice number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true, message: 'Please input customer name!' }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="customerAddress"
              label="Customer Address"
              rules={[{ required: true, message: 'Please input customer address!' }]}
            >
              <TextArea rows={4} placeholder="Enter customer address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="partyGstin"
              label="Party GSTIN"
              rules={[
                {
                  validator: async (_, value) => {
                    if (value && !validateGSTIN(value)) {
                      throw new Error('Invalid GSTIN format!');
                    }
                  },
                },
              ]}
            >
              <Input placeholder="Example: 29ABCDE1234F1Z5" maxLength={15} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="poNo" label="P.O. No">
              <Input placeholder="Enter P.O. number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="dcNo" label="D.C. No">
              <Input placeholder="Enter D.C. number" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="gstType"
              label="GST Type"
              initialValue={gstType}
            >
              <Select onChange={(value) => setGstType(value)}>
                <Option value="igst">IGST</Option>
                <Option value="sgst">SGST + CGST</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Title level={4}>Item Details</Title>
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey={(record, index) => index}
          style={{ marginBottom: '24px' }}
        />
        
        <Space style={{ marginBottom: '24px' }}>
          <Button type="dashed" onClick={addItemRow} icon={<PlusOutlined />}>
            Add Item
          </Button>
        </Space>

        <Row justify="end">
          <Col>
            <Title level={3}>Total: ₹ {calculateTotal()}</Title>
          </Col>
        </Row>

        <Row justify="end">
          <Col>
            <Form.Item
              name="items"
              rules={[
                { 
                  validator: async (_, value) => {
                    if (!items || items.length === 0) {
                      throw new Error('Please add at least one item');
                    }
                    const hasInvalidItems = items.some(
                      item => !item.description || !item.qty || !item.rate
                    );
                    if (hasInvalidItems) {
                      throw new Error('Please complete all item details (Description, Quantity, and Rate are required)');
                    }
                  }
                }
              ]}
            >
              <Button type="primary" htmlType="submit" size="large">
                Generate PDF
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TaxInvoiceForm;