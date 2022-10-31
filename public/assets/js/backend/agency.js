define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'agency/index' + location.search,
                    add_url: 'agency/add',
                    edit_url: 'agency/edit',
                    del_url: 'agency/del',
                    multi_url: 'agency/multi',
                    import_url: 'agency/import',
                    category_url: 'agency_category',
                    table: 'agency',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',

                //快捷搜索,这里可在控制器定义快捷搜索的字段
                search: false,
                //导出下拉列表选项
                exportTypes: ['csv','excel'],
                //是否显示导出按钮
                showExport: false,
                //是否显示切换按钮
                showToggle: false,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                //自定义列表字段的显示
                showColumns: false,
                height: $(window).height()-155,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'agency_name', title: __('Agency_name'), operate: 'LIKE'},
                        {field: 'city', title: __('City'), operate: false},
                        {field: 'agencycategory.name', title: __('Agencycategory.name'), operate:false},
                        {field: 'agencycategory.id', title: __('Agencycategory.id'), searchList: $.getJSON("agency_category/category_select") ,visible: false},
                        {field: 'engineer_total', title: __('Engineer_total') ,operate:false},
                        {field: 'device_total', title: __('Device_total'),operate:false},
                        {field: 'staff_total', title: __('Staff_total'),operate:false},
                        {field: 'exception_total', title: __('Exception_total'),operate:false},
                        {field: 'create_time', title: '有效期始',operate:false,formatter:Table.api.formatter.datetime },
                        {field: 'cs_end_time', title: '有效期止',operate:false},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            buttons: [
                                {
                                    name: 'staff',
                                    text: __('Staff'),
                                    title: __('Staff'),
                                    classname: 'btn btn-xs btn-warning btn-addtabs',
                                    icon: 'fa fa-folder-o',
                                    url: 'staff/index'
                                },
                                {
                                    name: 'detail',
                                    text: __('编辑'),
                                    title: __('编辑'),
                                    classname: 'btn btn-xs btn-primary btn-dialog',
                                    icon: 'fa fa-list',
                                    url: 'agency/edit',
                                    callback: function (data) {
                                        // Layer.alert("接收到回传数据：" + JSON.stringify(data), {title: "回传数据"});
                                        Layer.alert(data, {title: "添加成功"});

                                        $(".btn-refresh").trigger("click");//刷新当前页面的数据
                                    },
                                    visible: function (row) {
                                        //返回true时按钮显示,返回false隐藏
                                        return true;
                                    }
                                },
                                {
                                    name: 'del',
                                    text: __('删除'),
                                    title: __('删除'),
                                    classname: 'btn btn-xs btn-success btn-magic btn-ajax',
                                    icon: 'fa fa-magic',
                                    url: 'agency/del',
                                    confirm: '确认删除',
                                    success: function (data, ret) {
                                        if(ret.code == 1){
                                            Layer.alert('删除成功');
                                            table.bootstrapTable('refresh', {});
                                        }
                                    },
                                    error: function (data, ret) {
                                        console.log(data, ret);
                                        Layer.alert(ret.msg);
                                        return false;
                                    }
                                },
                            ],
                            formatter: Table.api.formatter.buttons
                        }
                    ]
                ]
            });
            //机构分类管理
            $(document).on('click', '.btn-category', function () {
                Fast.api.open('agency_category');
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
            }
        }
    };
    return Controller;
});
