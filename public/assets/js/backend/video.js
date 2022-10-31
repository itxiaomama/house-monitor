define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'video/index' + location.search,
                    add_url: 'video/add',
                    edit_url: 'video/edit',
                    del_url: 'video/del',
                    multi_url: 'video/multi',
                    import_url: 'video/import',
                    table: 'video',
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
                        {field: 'dev_code', title: __('Dev_code'), operate: 'LIKE'},
                        {field: 'dev_name', title: __('Dev_name'), operate: 'LIKE'},
                        {field: 'factory', title: __('Factory'), operate: 'LIKE'},
                        {field: 'project_id', title: __('Is_bind'), formatter: Controller.api.state,operate:false},
                        {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
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
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
                Form.api.bindevent($("form[role=form]"));
            },
            state: function (value, row, index) {
                if(value == 0){
                    return '<span class="label label-default">未绑定</span>';
                }else{
                    var url = Fast.api.fixurl('engineering/project/detail');
                    url+='?ids='+row.project_id;
                    var html = '<a href="'+url+'" class="btn btn-xs btn-primary addtabsit" title="项目管理">已绑定</a>';
                    return html;
                }
            },
        }
    };
    return Controller;
});
