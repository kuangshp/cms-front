import React, { Component } from 'react';
import { Layout, Menu, Dropdown, Icon } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
const { Header } = Layout;
class HomeHeader extends Component {
  render() {
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
            个人信息
          </a>
        </Menu.Item>
        <Menu.Item key="1">
          <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
            修改密码
          </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">退出登录</Menu.Item>
      </Menu>
    );
    return (
      <Header className={styles.header}>
        <h2>cms管理系统</h2>
        <div className={styles.userOperation}>
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" href="javascript: void(0)">
              {this.props.userInfo.name} <Icon type="down" />
            </a>
          </Dropdown>
        </div>
      </Header>
    );
  }
}

export default connect(state => state.login)(HomeHeader);
