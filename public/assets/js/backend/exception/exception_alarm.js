define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'exception/exception_alarm/index/'+ location.search,
                    item_url:'exception/exception_alarm/detail',
                    table: 'alarm',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'alarm_time',
                showToggle:false,
                showExport: false,
                search:false,
                searchFormVisible: true,
                height: $(window).height()-200,
                columns: [
                    [
                        // {checkbox: true},
                        {field: 'serial', title: '流水号', width: '130px', operate: 'LIKE %...%', formatter: Controller.api.formatter.detail},
                        {field: 'project_name', title: '项目名称', operate: 'LIKE %...%', formatter: Controller.api.formatter.detail},
                        {field: 'engineering_name', title: '所属工程', operate: false},
                        {field: 'alarm_time', title: '报警日期', width:'150px', operate: false,formatter:Table.api.formatter.datetime},
                        {field: 'alarm_status', title: '警情状态', width:'110px',
                            searchList: Controller.api.searchList.alarm_status,
                            formatter: Controller.api.formatter.alarm
                        },
                        {field: 'record_status', title: '处理进度', width:'110px',
                            searchList: Controller.api.searchList.record_status,
                            formatter: Controller.api.formatter.state
                        },
                        {field: 'operate', width:'110px', title: __('Operate'), table: table, events: this.operate, buttons: [{
                                name: 'detail',
                                text: '警情管理',
                                icon: 'fa fa-pencil-square-o',
                                classname: 'btn btn-info btn-xs btn-item btn-addtabs',
                                url: $.fn.bootstrapTable.defaults.extend.item_url
                            }],formatter: function (value, row, index) {
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
                                return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                            }
                        }
                    ]
                ],
                pagination:true
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        detail: function () {
            var alarm_id = $("#alarm_id").val();
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'exception/exception_alarm/index/'+ location.search,
                    log_url:'exception/exception_alarm/get_alarm_log?id='+alarm_id,
                    record_url:'exception/exception_alarm/get_alarm_record?id='+alarm_id
                }
            });
            // 报警记录
            var table_log = $("#table-log");
            var tb_h = $(window).height()/2;
            table_log.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.log_url,
                pk: 'id',
                sortName: 'record_time',
                toolbar: '#toolbar-log',
                height: tb_h-40,
                showToggle:false,
                showExport: false,
                search:false,
                commonSearch: false,
                columns: [
                    [
                        {field: 'record_time', title: '警情时间', width:'150px',formatter:Table.api.formatter.datetime},
                        {field: 'point_code', title: '测点编号', width:'90px',
                            formatter: Controller.api.formatter.data
                        },
                        {field: 'mon_type_name', title: '监测类型', width:'110px'},
                        {field: 'content', title: '报警内容',
                            formatter: Controller.api.formatter.content
                        },
                        {field: 'alarm_status', title: '警情状态', width:'80px',
                            formatter: Controller.api.formatter.alarm,
                        }
                    ]
                ],
                pagination:true
            });
            // 报警处理记录
            var table_alarm = $("#table-alarm");
            table_alarm.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.record_url,
                pk: 'id',
                sortName: 'createtime',
                sortOrder: 'asc',
                toolbar: '#toolbar',
                height: $(window).height()-85,
                showToggle: false,
                showExport: false,
                search: false,
                commonSearch: false,
                columns: [
                    [
                        {field: 'staff_name', title: '姓名',width:'100px'},
                        {field: 'createtime', title: '时间',width:'150px', formatter: Table.api.formatter.datetime},
                        {field: 'status', title: '操作', width:'100px',
                            formatter: Controller.api.formatter.record
                        },
                        {field: 'remark', title: '备注',
                            formatter: Controller.api.formatter.content
                        }
                    ]
                ],
                pagination:true
            });
            $(window).resize(function() {
                tb_h = $(window).height()/2;
                table_log.bootstrapTable('resetView', {
                    height: tb_h-40
                });
                table_alarm.bootstrapTable('resetView', {
                    height: $(window).height()-85
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table_log);
            Table.api.bindevent(table_alarm);
            // 点击报警内容
            $(document).on('click', '.my-tips', function () {
                var text = $(this).text();
                Layer.tips(text, this, {
                    time:0,
                    shade: 0.01,
                    shadeClose:true,
                    tips: [1, '#2c3e50'],
                });
            });
            // 点击警情确认
            $(document).on('click', '.btn-judge', function () {
                var judge_status = $('#judge_status').val();
                if(judge_status == 0){
                    var url = 'exception/exception_alarm/judge/id/'+alarm_id;
                    $(this).data().area = ["600px","90%"];
                    $(this).data().title = '警情确认';
                    $(this).data("maxmin",false);
                    Fast.api.open(url, '警情确认', $(this).data());
                }else{
                    Toastr.error("警情已确认!");
                }
            });
            // 点击警情处理
            $(document).on('click', '.btn-record', function () {
                var record_status = $('#record_status').val();
                if(record_status == 0){
                    Toastr.error("警情未确认!");
                }else if(record_status == 2){
                    Toastr.error("警情已申请消警!");
                }else if(record_status == 3){
                    Toastr.error("警情已确认消警!");
                }else{
                    var url = 'exception/exception_alarm/record/id/'+alarm_id;
                    $(this).data().area = ["600px","450px"];
                    $(this).data().title = '警情处理';
                    $(this).data("maxmin",false);
                    Fast.api.open(url, '警情处理', $(this).data());
                }
            });
            // 点击申请消警
            $(document).on('click', '.btn-apply', function () {
                var judge_status = $('#judge_status').val();
                var apply_status = $('#record_status').val();
                if(judge_status == 0){
                    Toastr.error("警情未确认!");
                }else if(apply_status == 2){
                    Toastr.error("警情已申请消警!");
                }else if(apply_status == 3){
                    Toastr.error("警情已确认消警!");
                }else{
                    var url = 'exception/exception_alarm/apply/id/'+alarm_id;
                    $(this).data().area = ["600px","450px"];
                    $(this).data().title = '申请消警';
                    $(this).data("maxmin",false);
                    Fast.api.open(url, '申请消警', $(this).data());
                }
            });
            // 点击消警确认
            $(document).on('click', '.btn-cancel', function () {
                var cancel_state = $('#record_status').val();
                if(cancel_state == 2){
                    var url = 'exception/exception_alarm/cancel/id/'+alarm_id;
                    $(this).data().area = ["600px","450px"];
                    $(this).data().title = '消警确认';
                    $(this).data("maxmin",false);
                    Fast.api.open(url, '消警确认', $(this).data());
                }else if(cancel_state == 3){
                    Toastr.error("警情已确认消警!");
                }else{
                    Toastr.error("警情未申请消警!");
                }
            });
        },
        judge: function () {
            Controller.api.bindevent();
        },
        record: function () {
            // 监听下拉列表改变的事件
            $(document).on("click", "input[type=radio][name='row[record_status]']", function(){
                let record_status = $(this).val()
                if(record_status == 2){
                    $("#record_title").html('误报原因');
                }else{
                    $("#record_title").html('处理结果');
                }
            })

            Controller.api.bindevent();
        },
        apply: function () {
            Controller.api.bindevent();
        },
        cancel: function () {
            // 监听下拉列表改变的事件
            $(document).on("click", "input[type=radio][name='row[record_status]']", function(){
                let record_status = $(this).val()
                if(record_status == 4){
                    $("#rejected_show").show();
                }else{
                    $("#rejected_show").hide();
                }
            })

            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"),function(data, ret){
                    var info = ret.data;
                    parent.window.$('#judge_status').val(info.judge_status);
                    parent.window.$('#record_status').val(info.record_status);
                },function(data, ret){
                });
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
            },
            searchList: {//渲染的方法
                record_status: function (value, row, index) {
                    return '<select class="form-control" name="record_status"><option value="">选择</option><option value="0">未处理</option><option value="1">处理中</option><option value="2">待消警</option><option value="3">已消警</option></select>';
                },
                alarm_status: function (value, row, index) {
                    return '<select class="form-control" name="alarm_status"><option value="">选择</option><option value="0">正常</option><option value="1">预警</option><option value="2">报警</option><option value="3">控制</option></select>';
                },
            },
            formatter: {//渲染的方法
                alarm: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<i class="fa fa-square" aria-hidden="true" style="color: #009688;"> 正常</i>';
                            break;
                        case 1:
                            return '<i class="fa fa-square" aria-hidden="true" style="color: #FFCC00;"> 预警</i>';
                            break;
                        case 2:
                            return '<i class="fa fa-square" aria-hidden="true" style="color: #FF6600;"> 报警</i>';
                            break;
                        case 3:
                            return '<i class="fa fa-square" aria-hidden="true" style="color: #ed5565;"> 控制</i>';
                            break;
                        default:
                            return '<i class="fa fa-square" aria-hidden="true" style="color: #009688;"> 其他</i>';
                    }
                },
                state: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-primary">未处理</span>';
                            break;
                        case 1:
                            return '<span class="label label-warning">处理中</span>';
                            break;
                        case 2:
                            return '<span class="label label-info">待消警</span>';
                            break;
                        case 3:
                            return '<span class="label label-success">已消警</span>';
                            break;
                        case 4:
                            return '<span class="label label-danger">已驳回</span>';
                            break;
                        case 5:
                            return '<span class="label label-success">已处理</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },
                record: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-primary">正在处理</span>';
                            break;
                        case 1:
                            return '<span class="label label-warning">确认警情</span>';
                            // return '<span class="label label-warning">确认真实</span>';
                            break;
                        case 2:
                            return '<span class="label label-success">确认误报</span>';
                            break;
                        case 3:
                            return '<span class="label label-info">申请销警</span>';
                            break;
                        case 4:
                            return '<span class="label label-success">确认消警</span>';
                            break;
                        case 5:
                            return '<span class="label label-danger">驳回消警</span>';
                            break;
                        case 6:
                            return '<span class="label label-success">确认处理</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },
                content: function (value, row, index) {
                    if(value){
                        return '<span class="my-tips">'+value+'</span>';
                    }
                },
                detail: function (value, row, index) {
                    return '<a href="exception/exception_alarm/detail/ids/'+row.id+'" class="btn-addtabs" title="警情管理">'+value+'</a>';
                },
                data: function (value, row, index) {
                    return '<a href="/JMRIUsnmLz.php/engineering/data/index/ids/'+row.project_mon_type_id+'" class="btn-addtabs" title="数据管理">'+value+'</a>';
                },
            }
        }
    };
    return Controller;
});
