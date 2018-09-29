import React,{ Component } from 'react';
import {Table} from 'antd';

class ApiTable extends Component {

    render(){
        return (
            <Table rowKey={this.props.rowKey} columns={this.props.columns} pagination={false} dataSource={this.props.dataSource}></Table>
        );
    }
}

export default ApiTable;