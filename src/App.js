import React, { Component } from 'react';
import { Layout, Menu, Button,Input,message } from 'antd';
import ApiMenu from './menu.js';
import ApiTab from './tab.js';
import { connect } from 'react-redux';
import axios from 'axios';

const { Content, Sider, Header } = Layout;
const Search = Input.Search;

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props
    axios({
      method: 'GET',
      url: './api_data.json',
      headers: {},
      params: {},
      data: {}
    }).then((response) => {
      dispatch({type: "APP_INIT", result: 'success', response});
    }).catch((error) => {
      dispatch({type: "APP_INIT", result: 'error', error});
    })
  }

  render() {
    const {
      searchApi
    } = this.props;
    return (
      <Layout>
      <Header className={"apiHeader"}>
      <div className="exportBtn">
        <Button type="primary" icon="export" onClick={() => {message.info('coming soon')}}>
          导出到postman
        </Button>
      </div>
      {/* <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['php']}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="php">php接口文档</Menu.Item>
        <Menu.Item key="nodejs">小程序后端接口文档</Menu.Item>
        <Menu.Item key="java">java主系统接口文档</Menu.Item>
      </Menu> */}
    </Header>
      
      <Layout>
        <Sider>
          <div className={"apiSearch"}>
          <Search
            placeholder="搜索api"
            // onSearch={searchApi}
            onInput={(e) => {
              return searchApi(e.target.value);
            }}
            style={{height: "40px"}}
          />
          </div>
          <div className={"apiMenu"}>
            <ApiMenu />
          </div>
        </Sider>
        <Layout>
          <Content>
            <ApiTab />
          </Content>
        </Layout>
      </Layout>
      </Layout>
    );
  }
}

export default connect((state) => {
  return {

  }
},(dispatch) => {
  return {
    dispatch: dispatch,
    searchApi: (value) => {
      dispatch({type: "SEARCH_API", value});
    }
  }
})(App);
