import React,{ Component } from 'react';
import { Table, Input, Form } from 'antd';
import { connect } from 'react-redux';

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      handleSave({ ...record, ...values });
    });
  }

  change = (record) => {
    const { handleChange } = this.props;
    handleChange(record);
  }


  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      handleChange,
      ...restProps
    } = this.props;
    return (
      <td ref={node => (this.cell = node)} {...restProps}>
         {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onBlur={this.save}
                        onInput={(e) => {
                          let newRecord = Object.assign({},record);
                          newRecord[e.target.id] = e.target.value;
                          console.log(newRecord);
                          return this.change(newRecord);
                        }}
                      />
                    )}
                  </FormItem>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

class EditableTable extends React.Component {
  render() {
    const {
      columns, 
      dataSource,
      rowSelection,
      handleSave,
      handleChange
    } = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let newColumns = columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: handleSave,
          handleChange: handleChange,
        }),
      };
    });
    return (
      <div>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          pagination={false}
          bordered
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={newColumns}
          size={"small"}
        />
      </div>
    );
  }
}

export default connect(
  (state,ownProps) => {
    return {
    }
  },
  (dispatch) => {
    return {
      handleSave: (row) => {
        dispatch({type: 'FORM_SAVE', row})
      },
      handleChange: (row) => {
        dispatch({type: 'FORM_CHANGE', row})
      }
    }
  }
)(EditableTable);