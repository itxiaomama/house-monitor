
define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/project/index' + location.search,
                    add_url: 'engineering/project/add',
                    edit_url: 'engineering/project/edit',
                    del_url: 'engineering/project/del',
                    multi_url: 'engineering/project/multi',
                    import_url: 'engineering/project/import',
                    table: 'engineering/project',
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
                        {field: 'item_name', title: __('Item_name'), operate: 'LIKE'},
                        {field: 'status', title: __('Status')},
                        {field: 'alarm_state', title: __('Alarm_state')},
                        {field: 'serial', title: __('Serial')},
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
            $("#config_id").change(function(){
                var config_id = $("#config_id").val();

                //获取数据频率
                $.ajax({
                    type: "get",
                    url: 'engineering/project/getConfigFrequency',
                    data: {'config_id': config_id},
                    dataType: 'json',
                    error:function (res){
                        Toastr.error('操作失败');
                    },
                    success: function (res){
                        $("#frequency").val(res.data);
                        console.log(res.data);
                    }
                });
            });

            //赋值到监测内容  需要的参数：项目id
            var project_id = $('#id').val();
            $.ajax({
                type: "get",
                url: 'engineering/project/getMonTypeByProjectId',
                data: {'project_id': project_id},
                dataType: 'json',
                error:function (res){
                    Toastr.error('操作失败');
                },
                success: function (res){
                    if(res.code == 1){
                        // let mon_category = $.parseJSON( res.data );
                        let mon_category = res.data;
                        let str = "";
                        mon_category.forEach((item,index) => {
                            str += '<tr>'+
                                '                <td class="td-one" style="vertical-align: middle;">\n' +
                                '                            <input type="checkbox" id="checkbox'+index+'" value="'+item.id+'" name="types[type'+item.id+']" class="m-types">\n' +
                                '                        </td>\n' +
                                '                        <td>\n' +
                                '                            <label class="checkbox" for="checkbox0">\n' +
                                '                                '+item.mon_type_name+'\n' +
                                '                            </label>\n' +
                                '                        </td>\n' +
                                '                        <td class="td-two">\n' +
                                '                            <div class="col-xs-12 input-group">\n' +
                                '                                <input id="p-name-'+item.id+'" class="form-control" type="text" value="" readonly="" placeholder="选择报警方案">\n' +
                                '                                <input id="p-id-'+item.id+'" class="form-control" name="plans[type'+item.id+']" type="hidden" value="">\n' +
                                '                                <span class="input-group-btn">\n' +
                                '                                    <button type="button" class="btn btn-danger rm-plan" data-val="'+item.id+'">清空</button>\n' +
                                '                                </span>\n' +
                                '                                <span class="input-group-btn">\n' +
                                '                                    <button type="button" class="btn btn-primary m-plan" data-val="'+item.id+'">选择</button>\n' +
                                '                                </span>\n' +
                                '                            </div>\n' +
                                '                        </td>'+
                                '                       </tr>';
                        });
                        $("#mon_category_tbody").html(str);
                    }else{
                        Toastr.error(res.msg);
                    }
                }
            });



            Controller.api.bindevent();
        },
        get_plans: function () {
            var mon_type = $("#mon_type").val();
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/project/get_plans' + location.search,
                    plan_url:'engineering/plan/edit',
                    add_url:'engineering/plan/add?mon_type='+mon_type,
                    table: 'monitor',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height() - 35,
                showToggle:false,
                showExport: false,
                search:false,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'plan_name', title: '方案名称'},
                        {field: 'mon_type_name', title: '监测类型', operate: false},
                        {field: 'operate', width:'100px', title: __('Operate'), table: table, events: this.operate, buttons: [{
                                name: 'plan',
                                title: '编辑',
                                icon: 'fa fa-pencil',
                                classname: 'btn btn-success btn-xs btn-plan-info',
                            }],formatter: function (value, row, index) {
                                var table = this.table;
                                // 默认按钮组
                                var buttons = $.extend([], this.buttons || []);
                                // 所有按钮名称
                                var names = [];
                                buttons.forEach(function (item) {
                                    names.push(item.name);
                                });
                                return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                            }
                        }
                    ]
                ],
                singleSelect: true,
                pagination:true
            });
            $(window).resize(function() {
                table.bootstrapTable('resetView', {
                    height: $(window).height() - 35
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.choose-plans', function () {
                var list = $('#table').bootstrapTable('getSelections');
                var ids = '';
                var plans = '';
                var plans_id = '#p-id-'+mon_type;
                var plans_name = '#p-name-'+mon_type;
                $.each(list,function(i, value){
                    ids = value.id;
                    plans = value.plan_name;
                });

                if(ids){
                    // parent.window.$(plans_name).val(plans);
                    // parent.window.$(plans_id).val(ids);
                    parent.window.frames[0].$(plans_name).val(plans);
                    parent.window.frames[0].$(plans_id).val(ids);
                }

                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击取消
            $(document).on('click', '.choose-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击详情
            $(".btn-add").data("area",["600px","95%"]);
            $(".btn-add").data("title",'添加报警方案');
            $(".btn-add").data("maxmin",false);
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
                // 选择 和 清空  按钮
                // 根据 监测类型 选择监测设备
                $(document).on('click', '#get-devs', function () {
                    var engineering_id = $("#engineering_id").val();

                    if(engineering_id == ''){
                        $('#m-project').focus();
                    }else{
                        var mon_category_id = $("#mon_category_id option:selected").val();
                        var option ={
                            type: 2,
                            shadeClose: false,
                            area:["550px","95%"],
                            shade: 0.4,
                            moveOut: false
                        };
                        Fast.api.open('engineering/project/get_devs?engineering_id='+engineering_id+'&mon_category_id='+mon_category_id,'选择监测设备', option);
                    }
                });
                // 清空设备
                $(document).on('click', '.btn-remove', function () {
                    var name = $(this).data("val");
                    var c_id = '#c-'+name+'_id';
                    var c_name = '#c-'+name+'_name';
                    $(c_id).val(0);
                    $(c_name).val('');
                });
                //【监测类型】而改变的  监测内容
                $(document).on('change', '#mon_category_id', function () {
                    var mon_category_id = $("#mon_category_id option:selected").val();
                    $.ajax({
                        type: "GET",
                        url: "engineering/project/getMonCategory",
                        data: "mon_category_id="+mon_category_id,
                        success: function(res){
                            //渲染出  监测内容的值
                            let mon_category = $.parseJSON( res );
                            let str = "";
                            mon_category.forEach((item,index) => {
                                str += '<tr>'+
                                    '                <td class="td-one" style="vertical-align: middle;">\n' +
                                    '                            <input type="checkbox" id="checkbox'+index+'" value="'+item.id+'" name="types[type'+item.id+']" class="m-types">\n' +
                                    '                        </td>\n' +
                                    '                        <td>\n' +
                                    '                            <label class="checkbox" for="checkbox0">\n' +
                                    '                                '+item.mon_type_name+'\n' +
                                    '                            </label>\n' +
                                    '                        </td>\n' +
                                    '                        <td class="td-two">\n' +
                                    '                            <div class="col-xs-12 input-group">\n' +
                                    '                                <input id="p-name-'+item.id+'" class="form-control" type="text" value="" readonly="" placeholder="选择报警方案">\n' +
                                    '                                <input id="p-id-'+item.id+'" class="form-control" name="plans[type'+item.id+']" type="hidden" value="">\n' +
                                    '                                <span class="input-group-btn">\n' +
                                    '                                    <button type="button" class="btn btn-danger rm-plan" data-val="'+item.id+'">清空</button>\n' +
                                    '                                </span>\n' +
                                    '                                <span class="input-group-btn">\n' +
                                    '                                    <button type="button" class="btn btn-primary m-plan" data-val="'+item.id+'">选择</button>\n' +
                                    '                                </span>\n' +
                                    '                            </div>\n' +
                                    '                        </td>'+
                                    '                       </tr>';
                            });

                            $("#mon_category_tbody").html(str);
                        }
                    });

                });

                //报警方案
                $(document).on('click', '.m-plan', function () {
                    var engineering_id = $("#engineering_id").val();  //工程id
                    if(engineering_id == 0){
                        engineering_id = $('#engineering_id').val();
                    }
                    if(engineering_id == ''){
                        $('#engineering_id').focus();
                    }else {
                        var mon_type = $(this).attr('data-val');
                        console.log(mon_type,'this is mon_type');

                        if (mon_type) {
                            var option = {
                                type: 2,
                                shadeClose: false,
                                area: ["80%", "95%"],
                                // area:["100%","100%"],
                                shade: 0.4,
                                moveOut: false,
                                maxmin: false
                            };
                            parent.Fast.api.open('engineering/project/get_plans?engineering_id=' + engineering_id + '&mon_type=' + mon_type, '选择报警方案', option);
                        } else {
                            Layer.alert('请先选择监测类型',
                                {icon: 4, title: __('Warning')},
                                function (index) {
                                    Layer.close(index);
                                }
                            );
                        }
                    }
                });
                // 清空方案
                $(document).on('click', '.rm-plan', function () {
                    var m_id = $(this).data("val");
                    var p_name = '#p-name-'+m_id;
                    var p_id = '#p-id-'+m_id;
                    $(p_id).val('');
                    $(p_name).val('');
                });




            }


        }
    };
    return Controller;
});

