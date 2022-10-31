define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/inspection_report/index' + location.search,
                    del_url: 'inspection/inspection_report/report',
                    table: 'inspection/inspection_report',
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
                        { checkbox: true },
                        { field: 'id', title: __('Id') },
                        { field: 'house_name', title: '建筑物名称', operate: 'LIKE' },
                        {
                            field: 'address', title: '工程地址', operate: 'LIKE', formatter: function (value, row, index) {
                                // 默认按钮组
                                return row.city + '-' + row.address;
                            }
                        },
                        { field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        { field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        { field: 'join_staff_name', title: __('Join_staff_name'), operate: 'LIKE' },
                        { field: 'super_staff_name', title: __('Super_staff_name'), operate: 'LIKE' },
                        { field: 'status', title: __('Status'), formatter: Controller.api.formatter.status },
                        {
                            field: 'operate', width: '170px', title:  __('Operate'), table: table, events:Table.api.events.operate, buttons: [
                                {
                                    name: 'report',
                                    text: '打印',
                                    icon: 'fa fa-bars',
                                    classname: 'btn btn-primary btn-xs',
                                    url: 'inspection/inspection_report/report'
                                }
                            ], formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            // 获取选中项
            $(document).on("click", ".btn-selected", function () {
                let data = Table.api.selecteddata(table);
                let ids = "";
                for(var i in data){
                    ids += data[i]['id']+',';
                }
                ids = ids.slice(0,-1);
                //跳转到不带ref=addtabs的页面
                // window.location.href = "/JMRIUsnmLz.php/inspection/inspection_report/report/ids/"+ids;
                Fast.api.addtabs("inspection/inspection_report/report/ids/"+ids,"批量打印");

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
        report: function () {
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
