// define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
//
//     var Controller = {
//         index: function () {
//             // 初始化表格参数配置
//             Table.api.init({
//                 extend: {
//                     index_url: 'engineering/project_mon_type/index' + location.search,
//                     add_url: 'engineering/project_mon_type/add',
//                     edit_url: 'engineering/project_mon_type/edit',
//                     del_url: 'engineering/project_mon_type/del',
//                     multi_url: 'engineering/project_mon_type/multi',
//                     import_url: 'engineering/project_mon_type/import',
//                     table: 'project_mon_type',
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
//                         {field: 'project_id', title: __('Project_id')},
//                         {field: 'engineering_id', title: __('Engineering_id')},
//                         {field: 'mon_type_name', title: __('Mon_type_name'), operate: 'LIKE'},
//                         {field: 'mon_type_id', title: __('Mon_type_id')},
//                         {field: 'point_num', title: __('Point_num')},
//                         {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
//                         {field: 'updatetime', title: __('Updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
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
define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'template'], function ($, undefined, Backend, Table, Form, Template) {
    var Controller = {
        edit: function () {
            var project_id = $("#project_id").val();
            // var m_id = Config.demo.m_id;
            // var m_id = 1;
            // 点击确认
            $(document).on('click', '.btn-submit', function () {
                var that = this;
                //验证通过提交表单
                Form.api.submit($("form[role=form]"),function(data, ret){
                    // console.log(data);
                    var index = parent.Layer.getFrameIndex(window.name);
                    parent.Layer.close(index);
                    parent.$('#child_table_'+project_id).bootstrapTable('refresh');
                    parent.Toastr.success("成功");
                }, function(data, ret){
                    // console.log(data);
                    var index = parent.Layer.getFrameIndex(window.name);
                    parent.Layer.close(index);
                    parent.Toastr.success("失败");
                });
            });
            // 选择方案
            $(document).on('click', '.m-plan', function () {
                var mon_type = $(this).attr('data-val');
                if(mon_type){
                    var option = {
                        type: 2,
                        shadeClose: false,
                        area:["80%","95%"],
                        shade: 0.4,
                        moveOut: false,
                        maxmin:false
                    };
                    parent.Fast.api.open('engineering/project/get_plans?project_id='+project_id+'&mon_type='+mon_type,'选择报警方案', option);
                }else{
                    Layer.alert ('请先选择监测类型',
                        {icon: 4, title: __('Warning')},
                        function (index) {
                            Layer.close(index);
                        }
                    );
                }
            });
            // 点击查看
            $(document).on('click', '.c-plan', function () {
                var mon_type = $(this).data('val');
                var plan_id = $('#p-id-'+mon_type).val();
                if(plan_id != 0){
                    var option = {
                        type:2,
                        shadeClose: false,
                        area:["90%","90%"],
                        shade: 0.4,
                        moveOut: false,
                        maxmin:false
                    };
                    Fast.api.open('engineering/plan/detail/ids/'+plan_id, '详情',option);
                }else{
                    Layer.alert ('未选择方案',
                        {icon: 4, title: __('Warning')},
                        function (index) {
                            Layer.close(index);
                        }
                    );
                }
            });
            // 点击取消关闭窗口
            $(document).on('click', '.layer-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"),function(data, ret){
                    // console.log(data);
                    // console.log(ret);
                    //如果我们需要在提交表单成功后做跳转，可以在此使用location.href="链接";进行跳转
                    // Toastr.success("成功");
                }, function(data, ret){
                    // console.log(ret);
                    // Toastr.success("失败");
                });
            }
        }
    };
    return Controller;
});
