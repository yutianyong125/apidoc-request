import React, { Component } from 'react';
import _ from 'lodash';
import { message } from 'antd';

const paramColumns = [
  {
    title: '参数名字',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: '说明',
    dataIndex: 'title',
    key: 'title',
  }, {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    render: (text, record) => {
      return (
        <span style={{ color: "#c41d7f" }}>{text}</span>
      );
    }
  }, {
    title: '是否必须',
    dataIndex: 'required',
    key: 'required',
    render: (text, record) => {
      return text ? "是" : "否";
    }
  }, {
    title: '默认值',
    dataIndex: 'default',
    key: 'default'
  }
];
const returnColumns = [
  {
    title: '返回字段',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    render: (text, record) => {
      return (
        <span style={{ color: "#c41d7f" }}>{text}</span>
      );
    }
  }, {
    title: '说明',
    dataIndex: 'title',
    key: 'title',
  }
];
const errorCodesColumns = [
  {
    title: '错误码',
    dataIndex: 'code',
    key: 'code'
  }, {
    title: '说明',
    dataIndex: 'desc',
    key: 'desc',
  }
];

function transform(data) {
  let groupApi = {};
  let apiData = {};

  for(let item of data){
      if(!groupApi[item.group]){
          groupApi[item.group] = [];
      }
      groupApi[item.group].push({
          method: _.toUpper(item.type),
          path: item.name,
          title: item.title
      });
      apiData[item.name] = {
          title: item.title,
          desc: item.description || item.title,
          group: item.group,
          method: _.toUpper(item.type),
          path: item.url,
          url: item.url,
          params: [],
          returns: [],
          errorCodes: [],
          raw: {}
      }
      if(item.parameter){
        for(let param of item.parameter.fields.Parameter){
          apiData[item.name].params.push({
            name: param.field,
            title: param.description.replace('<p>', '').replace('</p>', ''),
            type: param.type,
            required: !param.optional,
            default: param.defaultValue
          });
          apiData[item.name].raw[param.field] = '';
        }
        apiData[item.name].raw = JSON.stringify(apiData[item.name].raw);
      }
      if(item.success){
        for(let success of item.success.fields['Success 200']){
          apiData[item.name].returns.push({
            name: success.field,
            title: success.description.replace('<p>', '').replace('</p>', ''),
            type: success.type
          });
        }
      }
      if(item.error && item.error.fields['错误码返回']){
        for(let error of item.error.fields['错误码返回']){
          apiData[item.name].errorCodes.push({
            code: error.field,
            desc: error.description
          });
        }
      }
  }

  return {host: '', groupApi: groupApi, apiData: apiData};
}

const reducer = (state = { paramColumns, returnColumns, errorCodesColumns, tabData: {}, panes: [] }, action) => {

  let newState = {};

  if (action.type == 'APP_INIT') {
    if (action.result === 'success') {
      const response = action.response;
      let transformData = transform(response.data);
      newState.apiData = transformData.apiData;
      newState.apiTree = transformData.groupApi;
      newState.host = transformData.host;
    } else {
      newState.apiData = [];
      newState.apiTree = [];
      newState.host = '';
    }
  } else if (action.type == 'TAB_CHANGE') {
    newState.tabActiveKey = action.activeKey;
  } else if (action.type == 'REQUEST_TAB_CHANGE') {
    let tabActiveKey = state.tabActiveKey;
    let tabData = Object.assign({}, _.get(state, "tabData." + tabActiveKey, {}));
    let requestTabActiveKey = action.activeKey;
    let tabBarExtraContentVisiable = requestTabActiveKey === 'body' ? false : true;
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[tabActiveKey] = Object.assign({}, tabData, { requestTabActiveKey, tabBarExtraContentVisiable });
  } else if (action.type == 'TREE_CLICK') {
    const item = action.item;
    const key = item.key;
    let tabActiveKey = state.tabActiveKey;
    let panes = state.panes || [];

    if (key == tabActiveKey) {
      return state;
    } else {
      newState.tabActiveKey = key;
    }
    if (!state.tabData[key]) {
      let tabData = Object.assign({}, state.apiData[key]);
      tabData.requestTabActiveKey = tabData.method === 'GET' ? 'params' : 'body';
      tabData.tabBarExtraContentVisiable = tabData.requestTabActiveKey === 'body' ? false : true;
      let storageData = window.localStorage.getItem(key);
      if(!_.isNil(storageData)){
        storageData = JSON.parse(storageData);
      }
      tabData.paramIncrement = _.get(storageData, 'paramIncrement', 0);
      tabData.headerIncrement = _.get(storageData, 'headerIncrement', 0);
      tabData.requestHeaderSelectedRowKeys = _.get(storageData, 'requestHeaderSelectedRowKeys');
      tabData.requestParamsSelectedRowKeys = _.get(storageData, 'requestParamsSelectedRowKeys');
      tabData.requestHeaderData = _.get(storageData, 'requestHeaderData');
      tabData.requestParamsData = _.get(storageData, 'requestParamsData');
      tabData.requestBody = _.get(storageData, 'requestBody');
      if (tabData.method !== 'GET' && _.isNil(tabData.requestHeaderData)) {
        tabData.requestHeaderData = [{
          key: 'header_0',
          name: 'Content-Type',
          value: "application/json"
        }];
        tabData.requestHeaderSelectedRowKeys = ["header_0"];
        tabData.headerIncrement = 1;
      }
      if (tabData.method === 'GET' && tabData.params && _.isNil(tabData.requestParamsData)) {
        tabData.requestParamsData = tabData.params.map((item, index) => {
          return {
            key: "param_" + index,
            name: item.name,
            value: item.default
          }
        });
        tabData.paramIncrement = tabData.params.length;
        tabData.requestParamsSelectedRowKeys = [];
      }
      newState.tabData = Object.assign({}, state.tabData);
      newState.tabData[key] = tabData;
      newState.panes = [...state.panes, { title: item.item.props.title, api: state.apiData[key], key: key }];
      panes.push({ title: item.item.props.title, api: state.apiData[key], key: key });
      newState.panes = panes;
    }
  } else if (action.type == 'TREE_OPEN') {
    let openKeys = action.openKeys;
    newState.treeOpenKeys = openKeys;
  } else if (action.type == 'TAB_REMOVE') {
    let activeKey = state.tabActiveKey, targetKey = action.targetKey, tabData = Object.assign({}, state.tabData);
    let preIndex, nextIndex;
    state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        preIndex = i - 1;
        nextIndex = i;
      }
    });
    const panes = state.panes.filter(pane => pane.key !== targetKey);
    if (activeKey === targetKey) {
      if (preIndex >= 0) {
        activeKey = panes[preIndex].key;
      } else if (nextIndex < panes.length) {
        activeKey = panes[nextIndex].key;
      } else {
        activeKey = '';
      }
    }
    delete tabData[targetKey];
    newState = { panes, tabData, tabActiveKey: activeKey };
  } else if (action.type == 'EDITOR_CHANGE') {
    let value = action.value;
    let tabActiveKey = state.tabActiveKey;
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[tabActiveKey].requestBody = value;
  } else if (action.type == 'START_REQUEST') {
    let tabActiveKey = state.tabActiveKey;
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[tabActiveKey].fetching = true;
  } else if (action.type == 'RECEIVE_REQUEST') {
    let response = action.response;
    let tabActiveKey = state.tabActiveKey;
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[tabActiveKey].fetching = false;
    newState.tabData[tabActiveKey].responseHeader = response.headers;
    newState.tabData[tabActiveKey].responseBody = response.data;
  } else if (action.type == 'FAIL_REQUEST') {
    let error = action.error;
    let tabActiveKey = state.tabActiveKey;
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[tabActiveKey].fetching = false;
    newState.tabData[tabActiveKey].responseHeader = error.headers;
    newState.tabData[tabActiveKey].responseBody = error.response ? error.response : error.message;
  } else if (action.type == 'REQUEST_TAB_ADD') {
    let tabData = state.tabData[state.tabActiveKey];
    let requestTabActiveKey = tabData.requestTabActiveKey;
    let requestHeaderData = tabData.requestHeaderData || [];
    let requestParamsData = tabData.requestParamsData || [];
    let paramIncrement = tabData.paramIncrement;
    let headerIncrement = tabData.headerIncrement;
    if (requestTabActiveKey == 'params') {
      requestParamsData.push({
        key: "param_" + paramIncrement++,
        name: '',
        value: ""
      });
    } else if (requestTabActiveKey == 'header') {
      requestHeaderData.push({
        key: "header_" + headerIncrement++,
        name: '',
        value: ""
      });
    }
    newState.tabData = Object.assign({}, state.tabData);
    newState.tabData[state.tabActiveKey] = Object.assign({}, tabData, { requestHeaderData, requestParamsData, paramIncrement, headerIncrement });
  } else if (action.type == 'FORM_SAVE') {
    let { key } = action.row;
    let tabActiveKey = state.tabActiveKey;
    let tabData = state.tabData[tabActiveKey];
    let newData = [];
    if (tabData.requestTabActiveKey == 'params') {
      newData = [...tabData.requestParamsData];
    } else if (tabData.requestTabActiveKey == 'header') {
      newData = [...tabData.requestHeaderData];
    }
    const index = newData.findIndex(item => key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...action.row,
      });
    }
    newState.tabData = Object.assign({}, state.tabData);
    if (tabData.requestTabActiveKey == 'params') {
      newState.tabData[tabActiveKey].requestParamsData = newData;
    } else if (tabData.requestTabActiveKey == 'header') {
      newState.tabData[tabActiveKey].requestHeaderData = newData;
    }
  } else if (action.type == 'FORM_CHANGE') {
    let { key, name, value } = action.row;
    let tabActiveKey = state.tabActiveKey;
    let tabData = state.tabData[tabActiveKey];
    newState.tabData = Object.assign({}, state.tabData);
    if (tabData.requestTabActiveKey == 'params') {
      newState.tabData[tabActiveKey].requestParamsSelectedRowKeys = tabData.requestParamsSelectedRowKeys || [];
      if (name !== '' && value !== '') {
        if (!newState.tabData[tabActiveKey].requestParamsSelectedRowKeys.includes(key)) {
          newState.tabData[tabActiveKey].requestParamsSelectedRowKeys.push(key);
        }
      } else if (name === '' && value === '') {
        newState.tabData[tabActiveKey].requestParamsSelectedRowKeys = newState.tabData[tabActiveKey].requestParamsSelectedRowKeys.filter((item) => {
          return item !== key;
        })
      }
    } else if (tabData.requestTabActiveKey == 'header') {
      newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys = tabData.requestHeaderSelectedRowKeys || [];
      if (name !== '' && value !== '') {
        if (!newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys.includes(key)) {
          newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys.push(key);
        }
      } else if (name === '' && value === '') {
        newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys = newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys.filter((item) => {
          return item !== key;
        })
      }
    }
  } else if (action.type == 'ROW_CHANGE') {
    let tabActiveKey = state.tabActiveKey;
    let selectedRowKeys = action.selectedRowKeys;
    let tabData = state.tabData[tabActiveKey];
    newState.tabData = Object.assign({}, state.tabData);
    if (tabData.requestTabActiveKey == 'params') {
      newState.tabData[tabActiveKey].requestParamsSelectedRowKeys = selectedRowKeys;
    } else if (tabData.requestTabActiveKey == 'header') {
      newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys = selectedRowKeys;
    }
  } else if (action.type == 'SEARCH_API') {
    let apiTree = state.apiTree;
    let value = _.toLower(action.value);
    if (value === '') {
      newState.searchApiTree = null;
      newState.treeOpenKeys = [];
      return { ...state, ...newState };
    }
    newState.searchApiTree = {};
    newState.treeOpenKeys = [];
    for (let group in apiTree) {
      let isOpen = false;
      for (let item of apiTree[group]) {
        if (_.toLower(item.title).includes(value)) {
          isOpen = true;
          if (!newState.searchApiTree[group]) {
            newState.searchApiTree[group] = [];
          };
          newState.searchApiTree[group].push(item);
        }
      }
      if (!isOpen) {
        if (_.toLower(group).includes(value)) {
          newState.searchApiTree[group] = apiTree[group];
        }
      } else {
        newState.treeOpenKeys.push(group);
      }

    }
  } else if (action.type == 'ROW_DELETE') {
    let type = action.flag, key = action.key, tabActiveKey = state.tabActiveKey;
    let tabData = state.tabData[tabActiveKey];
    newState.tabData = Object.assign({}, state.tabData);
    if (type == 'param') {
      let requestParamsSelectedRowKeys = tabData.requestParamsSelectedRowKeys || [];
      let requestParamsData = tabData.requestParamsData || [];
      newState.tabData[tabActiveKey].requestParamsSelectedRowKeys = requestParamsSelectedRowKeys.filter((item) => {
        return item !== key;
      })
      newState.tabData[tabActiveKey].requestParamsData = requestParamsData.filter((item) => {
        return item.key !== key;
      })
    } else if (type == 'header') {
      let requestHeaderSelectedRowKeys = tabData.requestHeaderSelectedRowKeys || [];
      let requestHeaderData = tabData.requestHeaderData || [];
      newState.tabData[tabActiveKey].requestHeaderSelectedRowKeys = requestHeaderSelectedRowKeys.filter((item) => {
        return item !== key;
      })
      newState.tabData[tabActiveKey].requestHeaderData = requestHeaderData.filter((item) => {
        return item.key !== key;
      })
    }
  } else if(action.type == 'SAVE_PARAM'){
    let tabActiveKey = state.tabActiveKey;
    let data = {
      headerIncrement: state.tabData[tabActiveKey].headerIncrement,
      paramIncrement: state.tabData[tabActiveKey].paramIncrement,
      requestParamsSelectedRowKeys: state.tabData[tabActiveKey].requestParamsSelectedRowKeys || [],
      requestHeaderSelectedRowKeys: state.tabData[tabActiveKey].requestHeaderSelectedRowKeys || [],
      requestHeaderData: state.tabData[tabActiveKey].requestHeaderData || [],
      requestParamsData: state.tabData[tabActiveKey].requestParamsData || [],
      requestBody: state.tabData[tabActiveKey].requestBody || '',
    };
    window.localStorage.setItem(tabActiveKey, JSON.stringify(data));
    message.info('保存成功');
  }
  return { ...state, ...newState };
};

export default reducer;