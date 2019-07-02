import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Card, Form, Input, Modal, message } from 'antd';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { PAGE_SIZE } from './constants';
const { confirm } = Modal;

class Resource extends Component {
  save = payload => {
    this.props.dispatch({ type: 'resource/save', payload });
  };
  // 添加角色
  addRole = () => {
    this.save({ editVisible: true, isCreate: true });
  };
  handleCancel = () => {
    this.save({ editVisible: false });
  };
  handleOk = () => {
    const { isCreate } = this.props;
    this.editForm.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        this.props.dispatch({
          type: isCreate ? 'resource/create' : 'resource/update',
          payload: values,
        });
      }
    });
  };
  // 删除选中的
  delAll = () => {
    let that = this;
    const ids = this.props.selectedRowKeys;
    if (!ids.length) {
      message.info('请选择数据');
      return false;
    }
    confirm({
      title: '删除提示',
      content: `你确认要删除${ids.length}数据吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.dispatch({ type: 'resource/delAll', payload: { ids } });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  render() {
    const { editVisible, isCreate, rowData } = this.props; // 从redux中获取数据
    return (
      <Card>
        <Button.Group style={{ marginBottom: 10 }}>
          <Button type="primary" onClick={this.addRole}>
            新增资源
          </Button>
          <Button type="danger" onClick={this.delAll}>
            批量删除
          </Button>
        </Button.Group>
        <EditModal
          visible={editVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrappedComponentRef={inst => (this.editForm = inst)}
          isCreate={isCreate}
          rowData={rowData}
        />
        <ResourceTable {...this.props} save={this.save} />
      </Card>
    );
  }
}

export default connect(state => state.resource)(Resource);

// 表格
class ResourceTable extends Component {
  // 编辑行
  onEdit = record => {
    this.props.save({ rowData: record, isCreate: false, editVisible: true });
  };
  // 删除行
  onDel = record => {
    let that = this;
    confirm({
      title: '删除提示',
      content: `你确认要删除${record.name}角色吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.dispatch({ type: 'resource/del', payload: { id: record.id } });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  render() {
    const columns = [
      {
        title: '角色名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'url地址',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: '父节点id',
        dataIndex: 'parent_id',
        key: 'parent_id',
      },
      {
        title: '最后更新时间',
        dataIndex: 'update_at',
        key: 'update_at',
        align: 'center',
        render: text => {
          return moment(text).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: '操作',
        key: 'operation',
        align: 'center',
        render: (text, record) => {
          return (
            <div>
              <Button onClick={() => this.onEdit(record)}>编辑</Button>
              <Button onClick={() => this.onDel(record)} type="danger" style={{ marginLeft: 10 }}>
                删除
              </Button>
            </div>
          );
        },
      },
    ];
    let { list, pageNum, total, dispatch, loading } = this.props;
    const pagination = {
      current: pageNum,
      pageSize: PAGE_SIZE,
      total,
      showQuickJumper: true,
      showTotal: total => {
        return `共计${total}条`;
      },
      onChange: pageNum => {
        this.props.dispatch({ type: 'resource/save', payload: { pageNum } });
        dispatch(routerRedux.push(`/home/resource?pageNum=${pageNum}`));
      },
    };
    const rowSelection = {
      type: 'checkbox',
      onChange: (selectedRowKeys, selectedRows) => {
        const ids = selectedRows.map(item => item.id);
        this.props.save({ selectedRowKeys: ids });
      },
    };
    return (
      <Table
        dataSource={list}
        rowSelection={rowSelection}
        bordered
        columns={columns}
        pagination={pagination}
        loading={loading}
      />
    );
  }
}

@Form.create()
class EditModal extends Component {
  render() {
    const {
      isCreate,
      visible,
      onOk,
      onCancel,
      rowData,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        title={isCreate ? '新增资源' : '编辑资源'}
        visible={visible}
        onOk={onOk}
        okText="确认"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose={true}
      >
        <Form>
          {!isCreate &&
            getFieldDecorator('id', {
              initialValue: rowData.id,
            })(<Input type="hidden" />)}
          <Form.Item>
            {getFieldDecorator('name', {
              initialValue: rowData.name,
              rules: [{ required: true, message: '请输入资源名!' }],
            })(<Input placeholder="请输入资源名" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('icon', {
              initialValue: rowData.icon,
              rules: [{ required: false, message: '请输入资源的icon!' }],
            })(<Input placeholder="请输入资源名的icon" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('url', {
              initialValue: rowData.url,
              rules: [{ required: true, message: '请输入资源的url!' }],
            })(<Input placeholder="请输入资源名的url" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('parent_id', {
              initialValue: rowData.parent_id,
              rules: [{ required: true, message: '请输入资源的父节点id!' }],
            })(<Input placeholder="请输入资源名的父节点的id" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
