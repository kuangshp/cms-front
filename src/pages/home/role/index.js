import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Card, Form, Input, Modal, message } from 'antd';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { PAGE_SIZE } from './constants';
const { confirm } = Modal;

class Role extends Component {
  save = payload => {
    this.props.dispatch({ type: 'role/save', payload });
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
          type: isCreate ? 'role/createRole' : 'role/updateRole',
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
        that.props.dispatch({ type: 'role/delAll', payload: { ids } });
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
            新增角色
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
        <RoleTable {...this.props} save={this.save} />
      </Card>
    );
  }
}

export default connect(state => state.role)(Role);

// 表格
class RoleTable extends Component {
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
        that.props.dispatch({ type: 'role/delRole', payload: { id: record.id } });
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
    let { roleList, pageNum, total, dispatch, loading } = this.props;
    const pagination = {
      current: pageNum,
      pageSize: PAGE_SIZE,
      total,
      showQuickJumper: true,
      showTotal: total => {
        return `共计${total}条`;
      },
      onChange: pageNum => {
        this.props.dispatch({ type: 'role/save', payload: { pageNum } });
        dispatch(routerRedux.push(`/home/role?pageNum=${pageNum}`));
      },
    };
    // 选择横
    const rowSelection = {
      type: 'checkbox',
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.save({ selectedRowKeys, selectedRows });
      },
    };

    // 操作行
    const onRow = record => {
      return {
        onClick: () => {
          console.log(record);
          let selectedRowKeys = this.props.selectedRowKeys;
          let selectedRows = this.props.selectedRows;
          let index = selectedRowKeys.indexOf(record.id);
          if (index === -1) {
            this.props.save({
              selectedRowKeys: [...selectedRowKeys, record.id],
              selectedRows: [...selectedRows, record],
            });
          } else {
            this.props.save({
              selectedRowKeys: [
                ...selectedRowKeys.slice(0, index),
                ...selectedRowKeys.slice(index + 1),
              ],
              selectedRows: [...selectedRows.slice(0, index), ...selectedRows.slice(index + 1)],
            });
          }
        },
      };
    };
    return (
      <Table
        dataSource={roleList}
        rowSelection={rowSelection}
        bordered
        columns={columns}
        pagination={pagination}
        loading={loading}
        rowKey={row => row.id}
        onRow={onRow}
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
        title={isCreate ? '新增角色' : '编辑角色'}
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
              rules: [{ required: true, message: '请输入角色名!' }],
            })(<Input placeholder="请输入角色名" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
