import React, { Component } from 'react';
import { Tabs, Divider, Collapse, Input, Button, Icon, Spin, message } from 'antd';
import ApiTable from './table.js';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import EditTable from './editTable.js';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const Search = Input.Search;

class ApiTab extends Component {

  render() {
    const {
      activeKey,
      onEdit,
      panes,
      onEditorChange,
      onSubmit,
      onTabChange,
      paramColumns,
      returnColumns,
      errorCodesColumns,
      onRowChange,
      onRequestTabChange,
      onRequestTabAdd,
      handleDelete,
      host,
      saveParam
    } = this.props;
    let tabData = _.get(this.props.tabData, activeKey);
    let requestTabActiveKey,
      tabBarExtraContentVisiable,
      fetching,
      requestBody,
      responseHeader,
      responseBody,
      requestParamsData = [],
      requestHeaderData = [],
      requestParamsSelectedRowKeys,
      requestHeaderSelectedRowKeys,
      paramRowSelection,
      headerRowSelection;
    let requestParamsColumns = [{
      title: 'key',
      dataIndex: 'name',
      editable: true,
      width: '40%'
    }, {
      title: 'value',
      dataIndex: 'value',
      editable: true,
      width: '40%'
    }, {
      title: 'operation',
      dataIndex: 'operation',
      width: '20%',
      render: (text, record) => {
        return (
          <a onClick={() => handleDelete(record.key, 'param')} href="javascript:;"><Icon type="close" theme="outlined" /></a>
        );
      },
    }];
    let requestHeaderColumns = [{
      title: 'key',
      dataIndex: 'name',
      editable: true,
      width: '40%'
    }, {
      title: 'value',
      dataIndex: 'value',
      editable: true,
      width: '40%'
    }, {
      title: 'operation',
      dataIndex: 'operation',
      width: '20%',
      render: (text, record) => {
        return (
          <a onClick={() => handleDelete(record.key, 'header')} href="javascript:;"><Icon type="close" theme="outlined" /></a>
        );
      },
    }];
    let responseHeaderLength = 0;
    if (tabData) {
      requestTabActiveKey = tabData.requestTabActiveKey;
      tabBarExtraContentVisiable = tabData.tabBarExtraContentVisiable;
      fetching = tabData.fetching || false;
      requestBody = tabData.requestBody;
      responseHeader = [];
      for (let key in tabData.responseHeader) {
        responseHeader.push(<p key={key}>{key}: {tabData.responseHeader[key]}</p>);
        responseHeaderLength++;
      }


      responseBody = JSON.stringify(tabData.responseBody, null, 4);

      requestParamsData = tabData.requestParamsData || [];
      requestHeaderData = tabData.requestHeaderData || [];
      requestParamsSelectedRowKeys = tabData.requestParamsSelectedRowKeys || [];
      requestHeaderSelectedRowKeys = tabData.requestHeaderSelectedRowKeys || [];
      paramRowSelection = {
        onChange: onRowChange,
        selectedRowKeys: requestParamsSelectedRowKeys
      };
      headerRowSelection = {
        onChange: onRowChange,
        selectedRowKeys: requestHeaderSelectedRowKeys
      };
    }
    return (
      <Tabs
        hideAdd
        onChange={onTabChange}
        activeKey={activeKey}
        type="editable-card"
        onEdit={onEdit}
        tabBarGutter={5}
        className={"apiTabTitle"}
      >
        {panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
          <div className={`apiTabContent ${pane.key}`}>
            <div className={"apiDesc"}>
              <h4>{pane.api.title}</h4>
              {pane.api.desc}
            </div>

            <Collapse bordered={true} style={{ margin: '15px 0' }}>
              {pane.api.params && pane.api.params.length ?
                <Panel header="接口参数" key="1">
                  <ApiTable rowKey="name" columns={paramColumns} dataSource={pane.api.params} />
                </Panel>
                : ''}
              {pane.api.returns && pane.api.returns.length ?
                <Panel header="返回结果" key="2">
                  <ApiTable rowKey="name" columns={returnColumns} dataSource={pane.api.returns} />
                </Panel>
                : ''}
              {pane.api.errorCodes && pane.api.errorCodes.length ?
                <Panel header="错误码返回" key="3">
                  <ApiTable rowKey="name" columns={errorCodesColumns} dataSource={pane.api.errorCodes} />
                </Panel>
                : ''}
            </Collapse>
            <Divider orientation="left" style={{ color: "#1890ff" }}>Request</Divider>
            <Tabs defaultActiveKey={requestTabActiveKey} animated={false} tabBarExtraContent={tabBarExtraContentVisiable ?
              <Button onClick={onRequestTabAdd} type="primary">
                <Icon type="plus" theme="outlined" /> Add {requestTabActiveKey}
              </Button> : null
            } onChange={onRequestTabChange}>
              {
                pane.api.method == 'GET' ?
                  <TabPane tab="params" key="params">
                    <EditTable columns={requestParamsColumns} dataSource={requestParamsData} rowSelection={paramRowSelection}></EditTable>
                  </TabPane>
                  :
                  <TabPane tab="body" key="body">
                    <AceEditor
                      mode="json"
                      theme="github"
                      onChange={onEditorChange}
                      fontSize={14}
                      style={{ height: 300, width: '100%' }}
                      value={requestBody || (pane.api.raw ? JSON.stringify(JSON.parse(pane.api.raw), null, 4) : '')}
                      name="requestBodyEditor"
                      editorProps={{ $blockScrolling: true }}
                    />
                  </TabPane>
              }
              <TabPane tab={'headers' + (requestHeaderSelectedRowKeys.length ? ' (' + requestHeaderSelectedRowKeys.length + ')' : '')} key="header">
                <EditTable columns={requestHeaderColumns} dataSource={requestHeaderData} rowSelection={headerRowSelection}></EditTable>
              </TabPane>
            </Tabs>

            <Divider orientation="left" style={{ color: "#1890ff" }} className={"responseBlock"}>Response</Divider>
            <Tabs defaultActiveKey="body" animated={false}>
              <TabPane tab="body" key="body">
                <Spin tip="Loading..." spinning={fetching}>
                  <AceEditor
                    mode="json"
                    theme="github"
                    //onChange={this.props.onChange}
                    fontSize={14}
                    style={{ height: 500, width: '100%' }}
                    value={responseBody}
                    name="responseBodyEditor"
                    editorProps={{ $blockScrolling: true }}
                  />
                </Spin>

              </TabPane>
              <TabPane tab={'headers' + (responseHeaderLength ? ' (' + responseHeaderLength + ')' : '')} key="header">{responseHeader}</TabPane>
            </Tabs>

          </div>

          <div className={"apiFooter"}>

            <div className={"apiRequestWrap"}>
              <Search
                disabled={fetching}
                className={"requestInput"}
                addonBefore={<span style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>{pane.api.method}</span>}
                defaultValue={host + pane.api.url}
                enterButton={"发送" + (fetching ? '中...' : '')}
                size="large"
                onSearch={onSubmit}
                style={{ paddingRight: "120px" }}
              />
              <Button type="primary" className={"saveBtn"} size="large" ghost onClick={saveParam}>保存参数</Button>
            </div>
          </div>
        </TabPane>)}
      </Tabs>
    );
  }
}

export default connect((state, ownProps) => {
  return {
    activeKey: state.tabActiveKey,
    tabData: state.tabData,
    panes: state.panes,
    paramColumns: state.paramColumns,
    returnColumns: state.returnColumns,
    errorCodesColumns: state.errorCodesColumns,
    host: state.host
  }
}, (dispatch) => {
  return {
    onTabChange: (activeKey) => {
      dispatch({ type: 'TAB_CHANGE', activeKey })
    },
    onEdit: (targetKey, action) => {
      if (action === 'remove') {
        dispatch({ type: 'TAB_REMOVE', targetKey })
      }
    },
    onEditorChange: (value) => {
      dispatch({ type: 'EDITOR_CHANGE', value })
    },
    onSubmit: (value) => {
      dispatch((dispatch, getState) => {
        dispatch({ type: "START_REQUEST", value });
        let state = getState();
        let activeKey = state.tabActiveKey;
        let method = state.tabData[activeKey].method;
        let requestHeaderSelectedRowKeys = _.get(state, "tabData." + activeKey + '.requestHeaderSelectedRowKeys', []);
        let requestParamsSelectedRowKeys = _.get(state, "tabData." + activeKey + '.requestParamsSelectedRowKeys', []);
        let requestHeaderData = _.get(state, "tabData." + activeKey + '.requestHeaderData', []);
        let requestParamsData = _.get(state, "tabData." + activeKey + '.requestParamsData', []);
        let requestBody = _.get(state, "tabData." + activeKey + '.requestBody', _.get(state, "tabData." + activeKey + '.raw'));
        // console.log(document.querySelector(`.${activeKey} .responseBlock`));

        let headers = {}, params = {}, data = {};

        requestHeaderData.forEach((item) => {
          if (requestHeaderSelectedRowKeys.includes(item.key) && item.name !== '' && item.value !== '') {
            headers[item.name] = item.value;
          }
        })

        requestParamsData.forEach((item) => {
          if (requestParamsSelectedRowKeys.includes(item.key) && item.name !== '' && item.value !== '') {
            params[item.name] = item.value;
          }
        })
        if (method !== 'GET') {
          data = requestBody;
        }

        document.querySelector(`.${activeKey} .responseBlock`).scrollIntoView();

        axios({
          method: method,
          url: value,
          headers: headers,
          params: params,
          data: data
        }).then((response) => {
          dispatch({ type: "RECEIVE_REQUEST", response });
        }).catch((error) => {
          dispatch({ type: "FAIL_REQUEST", error });
        })
      })
    },
    onRowChange: (selectedRowKeys, selectedRows) => {
      dispatch({ type: 'ROW_CHANGE', selectedRowKeys, selectedRows })
    },
    onRequestTabChange: (activeKey) => {
      dispatch({ type: 'REQUEST_TAB_CHANGE', activeKey })
    },
    onRequestTabAdd: () => {
      dispatch({ type: 'REQUEST_TAB_ADD' })
    },
    handleDelete: (key, flag) => {
      dispatch({ type: 'ROW_DELETE', key, flag })
    },
    saveParam: () => {
      dispatch({type: 'SAVE_PARAM'});
    }
  }
})(ApiTab);