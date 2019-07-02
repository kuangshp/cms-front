import React, { Component } from 'react';
import {
  Form,
  Input,
  Card,
  Table,
  Button,
  Modal,
  Icon,
  Radio,
  Row,
  Col,
  Select,
  message,
} from 'antd';
import { connect } from 'dva';
import { PAGE_SIZE } from './constants';
import { routerRedux } from 'dva/router';
import moment from 'moment';
const { confirm } = Modal;
const { Option } = Select;

class User extends Component {
  save = payload => {
    this.props.dispatch({ type: 'user/save', payload });
  };
  // 确认按钮事件
  handleOk = () => {
    this.editForm.props.form.validateFields((err, values) => {
      if (!err) {
        let { gender, ...obj } = values;
        const filterData = Object.keys(obj).reduce((mock, cur) => {
          if (obj[cur]) {
            mock[cur] = obj[cur];
          }
          return mock;
        }, {});
        const data = { ...filterData, gender: gender * 1 };
        const { isCreate } = this.props;
        this.props.dispatch({
          type: isCreate ? 'user/createUser' : 'user/updateUser',
          payload: data,
        });
      }
    });
  };
  // 取消按钮事件
  handleCancel = () => {
    this.save({ editVisible: false });
  };
  // 添加用户
  addUser = () => {
    this.save({ editVisible: true, isCreate: true });
  };
  // 批量删除用户
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
        that.props.dispatch({ type: 'user/delAll', payload: { ids } });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 搜索
  searchHadle = () => {
    let values = this.searchForm.props.form.getFieldsValue();
    if (Number.parseInt(values.gender) === -1) {
      delete values.gender;
    }
    // 去除空的字段
    const filterData = Object.keys(values).reduce((mock, cur) => {
      if (values[cur]) {
        mock[cur] = values[cur];
      }
      return mock;
    }, {});
    this.props.dispatch({ type: 'user/fetch', payload: { where: filterData } });
  };
  render() {
    const { isCreate, editVisible, rowData } = this.props;
    return (
      <Card style={{ width: '100%' }}>
        <Button.Group>
          <Button type="primary" icon="user-add" onClick={this.addUser}>
            新增用户
          </Button>
          <Button type="danger" icon="delete" onClick={this.delAll}>
            批量删除
          </Button>
        </Button.Group>
        <SearchForm
          wrappedComponentRef={inst => (this.searchForm = inst)}
          searchHadle={this.searchHadle}
        />
        <EditModal
          visible={editVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          wrappedComponentRef={inst => (this.editForm = inst)}
          isCreate={isCreate}
          rowData={rowData}
        />
        <UserTable {...this.props} save={this.save} />
      </Card>
    );
  }
}

export default connect(state => state.user)(User);

/**
 * 表格组件
 */
class UserTable extends Component {
  onEdit = record => {
    let { gender, ...rowData } = record;
    this.props.save({ rowData, isCreate: false, editVisible: true, gender: gender.toString() });
  };
  // 行删除
  onDel = record => {
    let that = this;
    confirm({
      title: '删除提示',
      content: `你确认要删除${record.name}用户吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.dispatch({ type: 'user/delRow', payload: { id: record.id } });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        align: 'center',
        render: text => {
          if (text) {
            return '女';
          } else {
            return '男';
          }
        },
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '手机号码',
        dataIndex: 'mobile',
        key: 'mobile',
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
    let { userList, pageNum, total, dispatch, loading } = this.props;
    const pagination = {
      current: pageNum,
      pageSize: PAGE_SIZE,
      total,
      showQuickJumper: true,
      showTotal: total => {
        return `共计${total}条`;
      },
      onChange: pageNum => {
        this.props.dispatch({ type: 'user/save', payload: { pageNum } });
        dispatch(routerRedux.push(`/home/user?pageNum=${pageNum}`));
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
        dataSource={userList}
        rowSelection={rowSelection}
        bordered
        columns={columns}
        pagination={pagination}
        loading={loading}
      />
    );
  }
}

/**
 * 编辑及创建用户的弹框组件
 */
@Form.create()
class EditModal extends Component {
  render() {
    const {
      visible,
      onOk,
      onCancel,
      isCreate,
      rowData,
      form: { getFieldDecorator },
    } = this.props;
    const genderOptions = [{ label: '男', value: '0' }, { label: '女', value: '1' }];
    return (
      <Modal
        title={isCreate ? '新增用户' : '编辑用户'}
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
              rules: [{ required: true, message: '请输入用户名!' }],
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入用户名/邮箱/手机号码"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              initialValue: rowData.password,
              rules: [{ required: true, message: '请输入密码!' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="请输入密码"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('email', {
              initialValue: rowData.email,
            })(
              <Input
                prefix={<Icon type="wechat" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入邮箱"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('mobile', {
              initialValue: rowData.mobile,
            })(
              <Input
                prefix={<Icon type="mobile" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入手机号码"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('gender', {
              initialValue: '0',
            })(<Radio.Group options={genderOptions} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

/**
 * 数据搜索的组件
 */
@Form.create()
class SearchForm extends Component {
  handleChange = e => {
    console.log(e);
  };
  render() {
    const {
      searchHadle,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form>
        <Row gutter={20}>
          <Col span={4}>
            <Form.Item label="姓名">
              {getFieldDecorator('name', {})(<Input placeholder="请输入用户名" />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="邮箱">
              {getFieldDecorator('email', {})(<Input placeholder="请输入邮箱" />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="手机号码">
              {getFieldDecorator('mobile', {})(<Input placeholder="请输入手机号码" />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="性别">
              {getFieldDecorator('gender', {
                initialValue: '-1',
              })(
                <Select style={{ width: '100%' }} onChange={this.handleChange}>
                  <Option value="-1">--请选择--</Option>
                  <Option value="0">男</Option>
                  <Option value="1">女</Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={4}>
            <label style={{ marginBottom: 64, display: 'inline-block' }}></label>
            <Button type="primary" icon="search" onClick={searchHadle}>
              搜索
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
