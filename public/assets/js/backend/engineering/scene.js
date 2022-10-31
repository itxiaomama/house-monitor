// define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
//
//     var Controller = {
//         index: function () {
//             // 初始化表格参数配置
//             Table.api.init({
//                 extend: {
//                     index_url: 'engineering/scene/index' + location.search,
//                     add_url: 'engineering/scene/add',
//                     edit_url: 'engineering/scene/edit',
//                     del_url: 'engineering/scene/del',
//                     multi_url: 'engineering/scene/multi',
//                     import_url: 'engineering/scene/import',
//                     table: 'scene',
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
//                         {field: 'engineering_id', title: __('Engineering_id')},
//                         {field: 'title', title: __('Title'), operate: 'LIKE'},
//                         {field: 'admin_id', title: __('Admin_id')},
//                         {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
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
            }
        }
    };
    return Controller;
});
