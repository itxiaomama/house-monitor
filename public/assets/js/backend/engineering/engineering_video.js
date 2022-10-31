// define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
//
//     var Controller = {
//         index: function () {
//             // 初始化表格参数配置
//             Table.api.init({
//                 extend: {
//                     index_url: 'engineering/engineering/engineering_video/index' + location.search,
//                     add_url: 'engineering/engineering/engineering_video/add',
//                     edit_url: 'engineering/engineering/engineering_video/edit',
//                     del_url: 'engineering/engineering/engineering_video/del',
//                     multi_url: 'engineering/engineering/engineering_video/multi',
//                     import_url: 'engineering/engineering/engineering_video/import',
//                     table: 'engineering_video',
//                 }
//             });
//
//             var table = $("#table");
//
//             // 初始化表格
//             table.bootstrapTable({
//                 url: $.fn.bootstrapTable.defaults.extend.index_url,
//                 pk: 'id',
//                 sortName: 'id',
//                 columns: [
//                     [
//                         {checkbox: true},
//                         {field: 'id', title: __('Id')},
//                         {field: 'title', title: __('Title'), operate: 'LIKE'},
//                         {field: 'devs_name', title: __('Devs_name'), operate: 'LIKE'},
//                         {field: 'devs_id', title: __('Devs_id')},
//                         {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
//                         {field: 'file', title: __('File'), operate: false},
//                         {field: 'video.id', title: __('Video.id')},
//                         {field: 'video.dev_code', title: __('Video.dev_code'), operate: 'LIKE'},
//                         {field: 'video.dev_name', title: __('Video.dev_name'), operate: 'LIKE'},
//                         {field: 'video.buy_date', title: __('Video.buy_date'), operate:'RANGE', addclass:'datetimerange', autocomplete:false},
//                         {field: 'video.factory', title: __('Video.factory'), operate: 'LIKE'},
//                         {field: 'video.createtime', title: __('Video.createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
//                         {field: 'video.updatetime', title: __('Video.updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
//                         {field: 'video.agency_id', title: __('Video.agency_id')},
//                         {field: 'video.is_bind', title: __('Video.is_bind')},
//                         {field: 'video.admin_id', title: __('Video.admin_id')},
//                         {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
//                     ]
//                 ]
//             });
//
//             // 为表格绑定事件
//             Table.api.bindevent(table);
//         },
//         add: function () {
//             Controller.api.bindevent();
//         },
//         edit: function () {
//             Controller.api.bindevent();
//         },
//         api: {
//             bindevent: function () {
//                 Form.api.bindevent($("form[role=form]"));
//             }
//         }
//     };
//     return Controller;
// });

define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'template', 'upload'], function ($, undefined, Backend, Table, Form, Template, Upload) {
    var Controller = {
        add: function () {
            Controller.api.bindevent();
        },
        get_devs: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/engineering_video/get_devs' + location.search,
                    table: 'get_devs',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height(),
                showToggle:false,
                showExport: false,
                search:false,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'dev_code', title: '设备编号'},
                        {field: 'dev_name', title: '设备名称'}
                    ]
                ],
                singleSelect: true,
                pagination:true
            });
            $(window).resize(function() {
                table.bootstrapTable('resetView', {
                    height: $(window).height()
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.choose-add', function () {
                var list = $('#table').bootstrapTable('getSelections');
                var ids = '';
                var devs = '';
                var devs_id = '#c-devs_id';
                var devs_name = '#c-devs_name';
                $.each(list,function(i, value){
                    ids = value.id;
                    devs = value.dev_code;
                });
                parent.window.$(devs_name).val(devs);
                parent.window.$(devs_id).val(ids);
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击取消关闭窗口
            $(document).on('click', '.choose-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        api: {
            bindevent: function () {
                // 上传分布图
                Upload.api.plupload($('#plupload-map'),function (data,ret) {
                    if(data.id){
                        $("#point_map_id").val(data.id);
                    }
                });
                Form.api.bindevent($("form[role=form]"), function (data, ret) {
                    // console.log(data);
                    //如果我们需要在提交表单成功后做跳转，可以在此使用location.href="链接";进行跳转
                    // Toastr.success("成功");
                }, function (data, ret) {
                    // Toastr.success("失败");
                });
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
                // 选择设备
                $(document).on('click', '#get-devs', function () {
                    var option ={
                        type: 2,
                        shadeClose: false,
                        area:["90%","95%"],
                        shade: 0.4,
                        moveOut: false
                    };
                    Fast.api.open('engineering/engineering_video/get_devs','选择监控设备', option);
                });
                // 清空设备
                $(document).on('click', '#rm-devs', function () {
                    $('#c-devs_id').val('');
                    $('#c-devs_name').val('');
                });
            }
        }
    };
    return Controller;
});
