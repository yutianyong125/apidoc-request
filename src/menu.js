import React, { Component } from 'react';
import {Menu, Tag} from 'antd';
import { connect } from 'react-redux';
const SubMenu = Menu.SubMenu;

const colors = {
  'GET': 'green',
  'POST': 'orange',
  'PUT': 'blue',
  'DELETE': 'red'
};

class ApiMenu extends Component {

  render() {

    const {
      apiTree,
      openKeys,
      onClick,
      onOpenChange
    } = this.props;

    let menu = [];
    for (let group in apiTree) {
      let submenu = [];
      for (let item of apiTree[group]) {
        //let key = `${group}_${item.method}_${item.path.slice(1).replace(/\//g, '-').replace(/\:/g, '')}`;
        submenu.push(<Menu.Item key={item.path} title={item.title}><span style={{width: 62, display: "inline-block", textAlign: "right", marginRight: 8}}><Tag style={{marginRight: 0}} color={colors[item.method]}>{item.method}</Tag></span> {item.title}</Menu.Item>);
      }
      menu.push(<SubMenu key={group} title={<span>{group}</span>}>{submenu}</SubMenu>);
    }
    return (
      <Menu
        mode="inline"
        onClick={onClick}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      >
        {menu}
      </Menu>
    );
  }
}

export default connect(
  (state) => {
    return {
      apiTree: state.searchApiTree || state.apiTree,
      openKeys: state.treeOpenKeys || []
    }
  },
  (dispatch, ownProps) => {
    return {
      onClick: (item) => {
        dispatch({ type: 'TREE_CLICK', item })
      },
      onOpenChange: (openKeys) => {
        dispatch({type: 'TREE_OPEN', openKeys})
      }
    }
  }
)(ApiMenu);