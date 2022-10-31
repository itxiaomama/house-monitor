define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload'], function ($, undefined, Backend, Table, Form, Upload) {

    var Controller = {
        operate: {
            'click .btn-editone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, {ids: ids});
                var url = options.extend.edit_url;
                $(this).data().area = ["600px","90%"];
                $(this).data().title = '编辑测点';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-first': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, {ids: ids});
                var url = options.extend.first_url;
                $(this).data().area = ["800px","90%"];
                $(this).data().title = '初值管理';
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-delone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var that = this;
                var top = $(that).offset().top - $(window).scrollTop();
                var left = $(that).offset().left - $(window).scrollLeft() - 260;
                if (top + 154 > $(window).height()) {
                    top = top - 154;
                }
                if ($(window).width() < 480) {
                    top = left = undefined;
                }
                Layer.confirm(
                    __('Are you sure you want to delete this item?'),
                    {icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true},
                    function (index) {
                        var table = $(that).closest('table');
                        var options = table.bootstrapTable('getOptions');
                        Table.api.multi("del", row[options.pk], table, that);
                        Layer.close(index);
                    }
                );
            }
        },
        index: function () {
            var item_id = Config.demo.item_id;
            var point_id = Config.demo.point_id;
            var models = Config.demo.models;
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/point_first/index/'+ location.search,
                    add_url: 'engineering/point_first/add?item_id='+item_id+'&point_id='+point_id,
                    edit_url: 'engineering/point_first/edit?item_id='+item_id+'&point_id='+point_id,
                    del_url: 'engineering/point_first/del?item_id='+item_id+'&point_id='+point_id,
                    table: 'point_first',
                }
            });

            var table = $("#table");
            var columns = [
                {checkbox: true},
                {field: 'first_time', title:'测量日期',formatter:Table.api.formatter.datetime },
                {field: 'status', title: '是否启用', width:'110px',
                    formatter: Controller.api.formatter.status
                },
             
            ];
            $.each(models,function(i, value){
                var vals =  {field: 'first_'+i, title:value};
                columns.push(vals);
            });
            columns.push({
                field: 'update_time', title: '修改时间', width:'160px', operate:'RANGE', addclass:'datetimerange', visible: false
            });
            columns.push({
                field: 'operate', title: __('Operate'), width:'110px', table: table,
                events: this.operate,
                formatter: Table.api.formatter.operate
            });
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder:'asc',
                height: $(window).height() - 40,
                showToggle:false,
                showExport: false,
                search:false,
                commonSearch: false,
                searchFormVisible: false,
                columns: [
                    columns
                ],
                pagination:true,
                // responseHandler:function(res) {
                //     console.log(res);
                //     return res;
                // }
            });
            $(window).resize(function() {
                table.bootstrapTable('resetView', {
                    height: $(window).height() - 40
                });
            });
            // 测点批量导入
            Upload.api.plupload($('#btn-import-file'),function (data,ret) {
                if(ret.code == 1){
                    table.bootstrapTable('refresh');
                    Toastr.success(ret.msg);
                }else{
                    Toastr.error(ret.msg);
                }
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击详情
            $(".btn-add").data("area",["600px","90%"]);
            $(".btn-add").data("title",'添加初始值');
            $(".btn-add").data("maxmin",false);
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
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
            },
            formatter: {//渲染的方法
                status: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-default">否</span>';
                            break;
                        case 1:
                            return '<span class="label label-success">是</span>';
                            break;
                        default:
                            return '<span class="label label-default">否</span>';
                    }
                }
            }
        }
    };
    return Controller;
});
