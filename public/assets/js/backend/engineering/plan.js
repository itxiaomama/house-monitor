// define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
//
//     var Controller = {
//         index: function () {
//             // 初始化表格参数配置
//             Table.api.init({
//                 extend: {
//                     index_url: 'engineering/plan/index' + location.search,
//                     add_url: 'engineering/plan/add',
//                     edit_url: 'engineering/plan/edit',
//                     del_url: 'engineering/plan/del',
//                     multi_url: 'engineering/plan/multi',
//                     import_url: 'engineering/plan/import',
//                     table: 'plan',
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
//                         {field: 'plan_name', title: __('Plan_name'), operate: 'LIKE'},
//                         {field: 'mon_type_name', title: __('Mon_type_name'), operate: 'LIKE'},
//                         {field: 'mon_type_id', title: __('Mon_type_id')},
//                         {field: 'agency_name', title: __('Agency_name'), operate: 'LIKE'},
//                         {field: 'agency_id', title: __('Agency_id')},
//                         {field: 'admin_id', title: __('Admin_id')},
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

define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
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
                $(this).data().title = '编辑方案';
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-item': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var url = options.extend.item_url+'?plan_id='+row.id;
                $(this).data().area = ["600px","90%"];
                $(this).data().title = '项目列表';
                Fast.api.open(url, '编辑', $(this).data() || {});
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
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/plan/index/'+ location.search,
                    add_url: 'engineering/plan/add',
                    edit_url: 'engineering/plan/edit',
                    del_url: 'engineering/plan/del',
                    item_url:'engineering/item/list',
                    table: 'plan',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                showToggle:false,
                showExport: false,
                search:false,
                searchFormVisible: true,
                height: $(window).height()-155,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'plan_name', title: '方案名称'},
                        {field: 'mon_type_name', title: '监测类型', searchList: $.getJSON('engineering/plan/select_type_list')},
                        {field: 'agency_name', title: '所属机构',visible:false, operate: false},
                        {field: 'operate', width:'160px', title: __('Operate'), table: table, events: this.operate,formatter: function (value, row, index) {
                                var table = this.table;
                                // 操作配置
                                var options = table ? table.bootstrapTable('getOptions') : {};
                                // 默认按钮组
                                var buttons = $.extend([], this.buttons || []);
                                // 所有按钮名称
                                var names = [];
                                buttons.forEach(function (item) {
                                    names.push(item.name);
                                });
                                if (options.extend.edit_url !== '' && names.indexOf('edit') === -1) {
                                    Table.button.edit.url = options.extend.edit_url;
                                    buttons.push(Table.button.edit);
                                }
                                if(row.item_state == 0){
                                    buttons.push({
                                        name: 'end',
                                        icon: 'fa fa-cog',
                                        title: '完工',
                                        extend: 'data-toggle="tooltip"',
                                        classname: 'btn btn-xs btn-warning btn-endone'
                                    });
                                }else{
                                    buttons.push(Table.button.del);
                                }
                                return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                            }
                        }
                    ]
                ],
                pagination:true
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击详情
            $(".btn-add").data("area",["600px","90%"]);
            $(".btn-add").data("title",'添加报警方案');
            $(".btn-add").data("maxmin",false);
            $(".btn-del").data("offset",'auto');
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        get_staffs: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/plan/get_staffs' + location.search,
                    table: 'plan',
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
                        {field: 'staff_name', title: '名称'},
                        {field: 'phone', title: '手机'}
                    ]
                ],
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
                var ids = Config.demo.staff_id;
                var staffs = Config.demo.staff_name;
                var type = Config.demo.type;
                var staffs_id = '#c-'+type+'_id';
                var staffs_name = '#c-'+type+'_name';
                $.each(list,function(i, value){
                    ids.push(value.id);
                    staffs.push(value.staff_name);
                });
                parent.window.$(staffs_name).val(staffs);
                parent.window.$(staffs_id).val(ids);
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击删除
            $(document).on('click', '.choose-del', function () {
                var ids = 0;
                var staffs = '';
                var type = Config.demo.type;
                var staffs_id = '#c-'+type+'_id';
                var staffs_name = '#c-'+type+'_name';
                parent.window.$(staffs_name).val(staffs);
                parent.window.$(staffs_id).val(ids);
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"),function(data, ret){
                    parent.window.$('#table').bootstrapTable('refresh');
                    //如果我们需要在提交表单成功后做跳转，可以在此使用location.href="链接";进行跳转
                    // Toastr.success("成功");
                }, function(data, ret){
                    // console.log(data);
                    // console.log(ret);
                    // Toastr.success("失败");
                });
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
                $(document).on('change', '#mon-type', function () {
                    var id = $(this).val();
                    $.ajax({
                        type: "POST",
                        url: "engineering/plan/monitor_type_fields",
                        data: {'id': id},
                        dataType: 'json',
                        error: function (xhq) {
                            $('#plan-alarm').html('');
                        },
                        success: function (re) {
                            $('#plan-alarm').html('');
                            if(re.code == 1){
                                var str = '';
                                $.each(re.data,function(i, val){
                                    str += '<tr>\n' +
                                        '<td class="text-center">'+val+'</td>\n' +
                                        '<td class="text-center">\n' +
                                        '<input  id="c-'+i+'" name="alarm[state_'+i+']" type="hidden" value="0">\n' +
                                        '<a href="javascript:;" data-toggle="switcher" class="btn-switcher" data-input-id="c-'+i+'" data-yes="1" data-no="0" >\n' +
                                        '<i class="fa fa-toggle-on text-success fa-flip-horizontal text-gray fa-2x"></i>\n' +
                                        '</a>\n' +
                                        '</td>\n' +
                                        '<td class="text-center">\n' +
                                        '<input data-rule="required" class="form-control" name="alarm[warn_'+i+']" type="number" data-target="#msg-alarm" value="0">\n' +
                                        '</td>\n' +
                                        '<td class="text-center">\n' +
                                        '<input data-rule="required" class="form-control" name="alarm[error_'+i+']" type="number" data-target="#msg-alarm" value="0">\n' +
                                        '</td>\n' +
                                        '<td class="text-center">\n' +
                                        '<input data-rule="required" class="form-control" name="alarm[control_'+i+']" type="number" data-target="#msg-alarm" value="0">\n' +
                                        '</td>\n' +
                                        '</tr>';
                                });
                                $('#plan-alarm').html(str);
                            }
                        }
                    });
                });
                // 选择人员
                $(document).on('click', '#get-warn,#get-error,#get-control', function () {
                    var name = $(this).data("val");
                    var staff_id = $('#c-'+name+'_id').val();
                    var staff_name = $('#c-'+name+'_name').val();
                    var option ={
                        type: 2,
                        shadeClose: false,
                        area:["90%","95%"],
                        shade: 0.4,
                        moveOut: false
                    };
                    Fast.api.open('engineering/plan/get_staffs?staff_id='+staff_id+'&staff_name='+staff_name+'&type='+name,'选择人员', option);
                });
                // 点击清空
                $(document).on('click', '#rm-warn,#rm-error,#rm-control', function () {
                    var name = $(this).attr("title");
                    $('#c-'+name+'_id').val('');
                    $('#c-'+name+'_name').val('');
                });
            }
        }
    };
    return Controller;
});

