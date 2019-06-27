import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Menu, Icon } from 'antd';
import styles from './index.less';

const { SubMenu } = Menu;
class MenuList extends Component {
  renderMenus = resources => {
    return resources.map(resource => {
      if (resource.children && resource.children.length > 0) {
        return (
          <SubMenu
            key={resource.url}
            title={
              <span>
                <Icon type={resource.icon} />
                {resource.name}
              </span>
            }
          >
            {this.renderMenus(resource.children)}
          </SubMenu>
        );
      } else {
        return (
          <Menu.Item key={resource.url}>
            <Link to={resource.url}>
              <Icon type={resource.icon} />
              {resource.name}
            </Link>
          </Menu.Item>
        );
      }
    });
  };
  render() {
    let { pathname } = this.props.location;
    return (
      <div className={styles.sidebar}>
        <Menu defaultSelectedKeys={['/home', pathname]} defaultOpenKeys={['/home']} mode="inline">
          {this.renderMenus(this.props.userResource)}
        </Menu>
      </div>
    );
  }
}

export default connect(state => state.menu)(MenuList);
