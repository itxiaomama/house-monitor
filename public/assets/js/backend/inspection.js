define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/index' + location.search,
                    add_url: 'inspection/add',
                    edit_url: 'inspection/edit',
                    del_url: 'inspection/del',
                    multi_url: 'inspection/multi',
                    import_url: 'inspection/import',
                    table: 'inspection',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'engineering.name', title: __('Engineering.name'), operate: 'LIKE'},
                        {field: 'address', title: __('Address'), operate: 'LIKE',   formatter: function (value, row, index) {
                                // 默认按钮组
                                return row.city+'-'+row.address;
                            }},
                        {field: 'start_time', title: __('Start_time'), operate:'RANGE', addclass:'datetimerange', autocomplete:false},
                        {field: 'end_time', title: __('End_time'), operate:'RANGE', addclass:'datetimerange', autocomplete:false},
                        {field: 'join_staff_name', title: __('Join_staff_name'), operate: 'LIKE'},
                        {field: 'super_staff_name', title: __('Super_staff_name'), operate: 'LIKE'},
                        {field: 'status', title: __('Status'),formatter: Controller.api.formatter.status},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {
                status: function (value, row, index) {
                    if (value == 0) {
                        return '<span class="label label-success">未巡检</span>';
                    } else {
                        return '<span class="label label-default">已巡检</span>';
                    }
                },
            }
        }
    };
    return Controller;
});
