import React, { Component } from 'react';
import { Layout } from 'antd';
import styles from './_layout.less';
import HomeHeader from '@/components/HomeHeader';
import MenuList from '@/components/MenuList';
const { Sider, Content } = Layout;

export default class Home extends Component {
  render() {
    return (
      <Layout>
        <HomeHeader></HomeHeader>
        <Layout>
          <Sider className={styles.sider}>
            <MenuList {...this.props} />
          </Sider>
          <Content className={styles.main}>{this.props.children}</Content>
        </Layout>
      </Layout>
    );
  }
}
