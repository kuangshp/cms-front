import React, { Component } from 'react';
import { Layout, Form, Icon, Input, Button } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
const { Content } = Layout;
class Login extends Component {
  handleSubmit = event => {
    event.preventDefault();
    console.log(this.props);
    this.loginForm.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.dispatch({
          type: 'login/login',
          payload: values,
        });
      }
    });
  };
  render() {
    return (
      <Layout className={styles.layout}>
        <Content>
          <LoginForm
            handleSubmit={this.handleSubmit}
            wrappedComponentRef={instance => (this.loginForm = instance)}
          />
        </Content>
      </Layout>
    );
  }
}

@Form.create()
class LoginForm extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    const { handleSubmit } = this.props;
    return (
      <div className={styles.formPanel}>
        <Form onSubmit={handleSubmit}>
          <h3 className={styles.title}>cms后台管理系统</h3>
          <Form.Item>
            {getFieldDecorator('userName', {
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
            <Button type="primary" htmlType="submit" className={styles.loginButton}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
export default connect(state => state.login)(Login);
