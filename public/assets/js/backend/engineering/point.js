define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload'], function ($, undefined, Backend, Table, Form, Upload) {
    var Controller = {
        operate: {
            'click .btn-editone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.edit_url;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '编辑测点';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-benchmark-del': function (e, value, row, index) {
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
                console.log(row.item_id);
                Layer.confirm(
                    __('Are you sure you want to delete this item?'),
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/benchmark/del/ids/' + row.id,
                            data: { 'item_id': row.item_id },
                            dataType: 'json',
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                                if (re.code == 1) {
                                    Toastr.success('操作成功');
                                    $('#table3').bootstrapTable('refresh');
                                } else {
                                    Toastr.error(re.msg);
                                }
                            }
                        });
                        Layer.close(index);
                    }
                );
            },
            'click .btn-hole-edit': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.edit_hole_url;
                $(this).data().area = ["400px", "200px"];
                $(this).data().title = '编辑测孔';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑测孔', $(this).data() || {});
            },
            'click .btn-hole-del': function (e, value, row, index) {
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
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/hole/del/ids/' + row.id,
                            data: { 'item_id': row.item_id },
                            dataType: 'json',
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                                if (re.code == 1) {
                                    Toastr.success('操作成功');
                                    $('#table1').bootstrapTable('refresh');
                                } else {
                                    Toastr.error(re.msg);
                                }
                            }
                        });
                        Layer.close(index);
                    }
                );
            },
            'click .btn-data': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = 'engineering/data/index/ids/' + row.item_id + '?benchmark_id=' + ids;
                Backend.api.addtabs(url, '数据管理');
            },
            'click .btn-relation': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.relation_url;
                $(this).data().area = ["800px", "90%"];
                $(this).data().title = '关联测点 - ' + row.point_code;;
                Fast.api.open(Table.api.replaceurl(url, row, table), '关联测点', $(this).data() || {});
            },
            'click .btn-first': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row.id;
                var url = options.extend.first_url;
                $(this).data().area = ["800px", "90%"];
                $(this).data().title = '初值管理 - ' + row.point_code;
                Fast.api.open(Table.api.replaceurl(url, { ids: ids }, table), '编辑', $(this).data() || {});
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
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
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
            var item_id = $("#project_mon_type_id").val();  //  项目-监测内容id     监测内容id？
            var mon_type = $("#mon_type_id").val();
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/point/index/ids/' + item_id + location.search,
                    add_url: 'engineering/point/add/ids/' + item_id,
                    edit_url: 'engineering/point/edit',
                    del_url: 'engineering/point/del',
                    multi_url: 'engineering/point/multi',
                    first_url: 'engineering/point_first/index?item_id=' + item_id,
                    benchmark_url: 'engineering/benchmark/index?item_id=' + item_id,
                    add_benchmark_url: 'engineering/benchmark/add?item_id=' + item_id,
                    hole_url: 'engineering/hole/index?item_id=' + item_id,
                    add_hole_url: 'engineering/hole/add?item_id=' + item_id,
                    edit_hole_url: 'engineering/hole/edit?item_id=' + item_id,
                    relation_url: 'engineering/relation/index?item_id=' + item_id,
                    table: 'point',
                }
            });
            var table1, table2, table3;
            //渲染三个表格的关系
            if (mon_type == 3) {
                table1 = Controller.api.table1(item_id);
                Table.api.bindevent(table1);
                $('#m-point').on('shown.bs.tab', function (e) {
                    if (!table2) {
                        table2 = Controller.api.table2(mon_type);
                        Table.api.bindevent(table2);
                    }
                });
            } else if (mon_type == 4) {
                table3 = Controller.api.table3(item_id);
                Table.api.bindevent(table3);
                $('#m-point').on('shown.bs.tab', function (e) {
                    if (!table2) {
                        table2 = Controller.api.table2(mon_type);
                        Table.api.bindevent(table2);
                    }
                });
            } else {
                table2 = Controller.api.table2(mon_type);
                Table.api.bindevent(table2);
            }

            // 测点批量导入
            Upload.api.plupload($('#btn-import-file'),function (data,ret) {
                if (ret.code == 1) {
                    table2.bootstrapTable('refresh');
                    Toastr.success(ret.msg);
                } else {
                    Toastr.error(ret.msg);
                }
            });
            // 点击详情
            $(".btn-add").data("area", ["600px", "90%"]);
            $(".btn-add").data("title", '添加测点');
            $(".btn-add").data("maxmin", false);
            // 点击基准管理
            $(document).on('click', '.btn-benchmark', function () {
                var option = {
                    type: 2,
                    shadeClose: false,
                    area: ["800px", "95%"],
                    shade: 0.4,
                    moveOut: false
                };
                var url = 'engineering/benchmark/index?item_id=' + item_id;
                Fast.api.open(url, '基准管理', option);
            });
        },
        add: function () {
            Controller.api.bindevent();
            // 添加变量名和id
            $(document).on('click', '#addDevic', function () {
                var newDevic = $(` <div class="form-group" style="display: flex;align-items: center;">
                    <label class="control-label col-xs-3 col-sm-2"  id="name">变量名:</label>
                    <div class="col-xs-10 col-sm-8">
                        <input id="c-addr" class="form-control" name="row[deviceNo][]" type="text" value="" data-rule="required" >
                    </div>
                    <label class="control-label col-xs-1 col-sm-2"  id="id">id:</label>
                    <div class="col-xs-8 col-sm-8">
                        <input id="c-addr" class="form-control" name="row[dataPointId][]" type="text" value="" data-rule="required" >
                    </div>
                    <div class="col-xs-3 col-sm-8">
                        <button style="background:#f56c6c;color:#fff;border:1px solid #fff" id="DevicDetail">X</button>
                    </div>
                </div>`);
                $('.addNameId-from').append(newDevic)
            });
            // 删除点击的变量名和id
            $(document).on('click', '#DevicDetail', function () {
                $(this).parent().parent().remove()
            });
        },
        edit: function () {
            Controller.api.bindevent();
            $(document).on('click', '#addDevic', function () {
                var newDevic = $(` <div class="form-group" style="display: flex;align-items: center;">
                    <label class="control-label col-xs-3 col-sm-2"  id="name">变量名:</label>
                    <div class="col-xs-10 col-sm-8">
                        <input id="c-addr" class="form-control" name="row[deviceNo][]" type="text" value="" data-rule="required" >
                    </div>
                    <label class="control-label col-xs-1 col-sm-2"  id="id">id:</label>
                    <div class="col-xs-8 col-sm-8">
                        <input id="c-addr" class="form-control" name="row[dataPointId][]" type="text" value="" data-rule="required" >
                    </div>
                    <div class="col-xs-3 col-sm-8">
                        <button style="background:#f56c6c;color:#fff;border:1px solid #fff" id="DevicDetail">X</button>
                    </div>
                </div>`);
                $('.addNameId-from').append(newDevic)
            });
            // 删除点击的变量名和id
            $(document).on('click', '#DevicDetail', function () {
                $(this).parent().parent().remove()
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"), function (data, ret) {
                    // console.log(data);
                    // console.log(ret);
                    //如果我们需要在提交表单成功后做跳转，可以在此使用location.href="链接";进行跳转
                    // Toastr.success("成功");
                }, function (data, ret) {
                    // console.log(data);
                    // console.log(ret);
                    // Toastr.success("失败");
                });
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
                // 点击选择设备类
                $(document).on('change', '#mod_dev', function () {
                    var mon_type = Config.demo.mon_type;
                    var id = $(this).val();
                    var pa, pb, pc, pd, pe;
                    var uploadStr = '<thead> <tr> <th class="text-center">卡槽号</th> <th class="text-center">通道号</th> <th class="text-center">地址号</th> </tr> </thead> <tbody> <tr> <td> <input data-rule="required" class="form-control" name="dev[card]" type="number" data-target="#msg-up"> </td> <td> <input data-rule="required" class="form-control" name="dev[port]" type="number" data-target="#msg-up"> </td> <td> <input data-rule="required" class="form-control" name="dev[addr]" type="number" data-target="#msg-up"> </td> </tr> </tbody>';;
                    if (mon_type != 6) {
                        if (id == 23) {
                            uploadStr = '<thead> <tr> <th class="text-center"></th> <th class="text-center">卡槽号</th> <th class="text-center">通道号</th> <th class="text-center"oo>地址号</th> </tr> </thead> <tbody> <tr> <td class="text-center"> 红线 </td> <td> <input data-rule="required" class="form-control" name="dev[card]" type="number" data-target="#msg-up"> </td> <td> <input data-rule="required" class="form-control" name="dev[port]" type="number" data-target="#msg-up"> </td> <td> <input data-rule="required" class="form-control" name="dev[addr]" type="number" data-target="#msg-up"> </td> </tr> <tr> <td class="text-center"> 蓝线 </td> <td> <input class="form-control" name="dev2[card]" type="number"> </td> <td> <input class="form-control" name="dev2[port]" type="number"> </td> <td> <input class="form-control" name="dev2[addr]" type="number"> </td> </tr> <tr> <td class="text-center"> 绿线 </td> <td> <input class="form-control" name="dev3[card]" type="number"> </td> <td> <input class="form-control" name="dev3[port]" type="number"> </td> <td> <input class="form-control" name="dev3[addr]" type="number"> </td> </tr> </tbody>';
                        }
                        $('#upload-code').html(uploadStr);
                        // 获取设备参数
                        $.ajax({
                            type: "POST",
                            url: "engineering/point/get_dev_param",
                            data: { 'id': id },
                            dataType: 'json',
                            success: function (re) {
                                if (re.code == 1) {
                                    var value = re.data;
                                    pa = value.p_a;
                                    pb = value.p_b;
                                    pc = value.p_c;
                                    pd = value.p_d;
                                    pe = value.p_e;
                                    var str = '';
                                    if (pa) {
                                        str += '<tr><td>' + pa + '</td><td><input type="number" class="form-control" name="param[p_a]" data-rule="required" data-target="#msg-set"></td></tr>';
                                    }
                                    if (pb) {
                                        str += '<tr><td>' + pb + '</td><td><input type="number" class="form-control" name="param[p_b]" data-rule="required" data-target="#msg-set"></td></tr>';
                                    }
                                    if (pc) {
                                        str += '<tr><td>' + pc + '</td><td><input type="number" class="form-control" name="param[p_c]" data-rule="required" data-target="#msg-set"></td></tr>';
                                    }
                                    if (pd) {
                                        str += '<tr><td>' + pd + '</td><td><input type="number" class="form-control" name="param[p_d]" data-rule="required" data-target="#msg-set"></td></tr>';
                                    }
                                    if (pe) {
                                        str += '<tr><td>' + pe + '</td><td><input type="number" class="form-control" name="param[p_e]" data-rule="required" data-target="#msg-set"></td></tr>';
                                    }
                                    $('#dev-params').html(str);
                                }
                            }
                        });
                    } else {
                        $('#upload-code').html(uploadStr);
                    }
                });
            },
            searchList: {//渲染的方法
                state: function (value, row, index) {
                    return '<select class="form-control" name="point_status"><option value="">选择</option><option value="0">正常</option><option value="1">故障</option><option value="2">拆除</option></select>';
                },
                alarm: function (value, row, index) {
                    return '<select class="form-control" name="alarm_status"><option value="">选择</option><option value="0">正常</option><option value="1">预警</option><option value="2">报警</option><option value="3">控制</option></select>';
                },
                datum: function (value, row, index) {
                    return '<select class="form-control" name="alarm_status"><option value="">选择</option><option value="0">正常</option><option value="1">预警</option><option value="2">报警</option><option value="3">控制</option></select>';
                }
            },
            formatter: {//渲染的方法
                state: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-success">正常</span>';
                            break;
                        case 1:
                            return '<span class="label label-warning">故障</span>';
                            break;
                        case 2:
                            return '<span class="label label-danger">拆除</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },
                alarm: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-success">正常</span>';
                            break;
                        case 1:
                            return '<span class="label bg-yellow">预警</span>';
                            break;
                        case 2:
                            return '<span class="label bg-red">报警</span>';
                            break;
                        case 3:
                            return '<span class="label label-danger">控制</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },
                datum: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-default">否</span>';
                            break;
                        case 1:
                            return '<span class="label label-success">是</span>';
                            break;
                        default:
                            return '<span class="label label-success">是</span>';
                    }
                }
            },
            table1: function (item_id) {
                var table = $("#table1");
                // 初始化表格
                table.bootstrapTable({
                    url: $.fn.bootstrapTable.defaults.extend.hole_url,
                    pk: 'id',
                    toolbar: '#toolbar1',
                    // sortName: 'p.id',
                    sortName: 'id',
                    sortOrder: 'asc',
                    showToggle: false,
                    showExport: false,
                    search: false,
                    searchFormVisible: true,
                    height: $(window).height() - 270,
                    queryParams: function (params) {
                        params.point_type = 1;
                        return params;
                    },
                    columns: [
                        [
                            { checkbox: true },
                            {
                                field: 'point_code', title: '测孔编号',
                                events: Controller.operate,
                                formatter: function (value, row, index) {
                                    if (table.data('operateData')) {
                                        var url = '/hezhiyun/public/admin.php/engineering/data/index/ids/' + item_id + '?benchmark_id=' + row.id;
                                        return '<a href="' + url + '" title="数据管理" class="btn-addtabs">' + row.point_code + '</a>';
                                    } else {
                                        return value;
                                    }
                                }
                            },
                            {
                                field: 'operate', title: '操作', table: table,
                                events: Controller.operate,
                                formatter: function (value, row, index) {
                                    alert('table1');

                                    // 所有按钮名称
                                    var buttons = [];
                                    if (table.data('operateRelation')) {
                                        buttons.push({
                                            name: 'relation',
                                            icon: 'fa fa-bars',
                                            text: '关联测点',
                                            classname: 'btn btn-info btn-xs btn-relation'
                                        });
                                    }
                                    if (table.data('operateData')) {
                                        buttons.push({
                                            name: 'data',
                                            text: '数据管理',
                                            icon: 'fa fa-area-chart',
                                            classname: 'btn btn-primary btn-xs btn-data',
                                        });
                                    }
                                    if (table.data('operateEdit')) {
                                        buttons.push({
                                            icon: 'fa fa-pencil',
                                            title: '编辑',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-success btn-xs btn-hole-edit'
                                        });
                                    }
                                    if (table.data('operateDel')) {
                                        buttons.push({
                                            icon: 'fa fa-trash',
                                            title: '删除',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-danger btn-xs btn-hole-del'
                                        });
                                    }
                                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                                }
                            }
                        ]
                    ],
                    pagination: true
                });
                // 添加
                $(document).on('click', '.btn-add-hole', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_hole_url;
                    $(this).data().area = ["400px", "200px"];
                    $(this).data().title = '添加测孔';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-hole', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '项？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/hole/del/ids/' + ids,
                                data: { 'item_id': item_id },
                                dataType: 'json',
                                error: function (re) {
                                    Toastr.error('操作失败');
                                },
                                success: function (re) {
                                    if (re.code == 1) {
                                        Toastr.success('操作成功');
                                        table.bootstrapTable('refresh');
                                    } else {
                                        Toastr.error(re.msg);
                                    }
                                }
                            });
                            Layer.close(index);
                        }
                    );
                });
                return table;
            },
            table2: function (mon_type) {
                var table = $("#table2");
                var h = 210;
                if (mon_type == 3 || mon_type == 4) {
                    h = 270;
                }
                // 初始化表格 用的是这个
                table.bootstrapTable({
                    url: $.fn.bootstrapTable.defaults.extend.index_url,
                    pk: 'id',
                    toolbar: '#toolbar2',
                    // sortName: 'p.id',
                    sortName: 'id',
                    sortOrder: 'asc',
                    showToggle: false,
                    // showExport: false,
                    search: false,
                    searchFormVisible: true,
                    height: $(window).height() - h,
                    queryParams: function (params) {
                        if (mon_type == 3) {
                            params.point_type = 0;
                        }
                        return params;
                    },
                    columns: [
                        [
                            { checkbox: true },
                            { field: 'point_code', title: '测点编号', width: '120px' },
                            { field: 'sensor_name', title: '传感器', width: '120px', operate: false },
                            { field: 'dev_code', title: '采集仪', width: '120px', operate: false },
                            { field: 'card', title: '卡槽号', width: '70px', operate: false },
                            { field: 'port', title: '通道号', width: '70px', operate: false },
                            { field: 'addr', title: '地址号', width: '70px', operate: false },
                            {
                                field: 'point_type', title: '是否基准点', width: '90px', visible: false,
                                formatter: Controller.api.formatter.datum,
                                operate: false
                            },
                            {
                                field: 'point_status', title: '工作状态', width: '90px', operate: false,
                                formatter: Controller.api.formatter.state
                            },
                            {
                                field: 'alarm_status', title: '报警状态', width: '90px',
                                searchList: Controller.api.searchList.alarm,
                                formatter: Controller.api.formatter.alarm
                            },
                            {
                                field: 'operate', width: '130px', title: '操作', table: table, events: Controller.operate,
                                formatter: function (value, row, index) {
                                    // 默认按钮组
                                    var buttons = [];
                                    if (table.data('operateEdit')) {
                                        buttons.push({
                                            name: '编辑',
                                            icon: 'fa fa-pencil',
                                            title: '编辑',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-xs btn-success btn-editone',
                                        });
                                    }
                                    if (table.data('operateDel')) {
                                        buttons.push({
                                            icon: 'fa fa-trash',
                                            title: '删除',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-xs btn-danger btn-delone'
                                        });
                                    }
                                    if (table.data('operateFirst')) {
                                        buttons.push({
                                            name: 'first',
                                            icon: 'fa fa-bars',
                                            text: '初值管理',
                                            classname: 'btn btn-info btn-xs btn-first'
                                        });
                                    }
                                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                                }
                            }
                        ]
                    ],
                    pagination: true
                });
                return table;
            },
            table3: function (item_id) {
                var table = $("#table3");
                // 初始化表格
                table.bootstrapTable({
                    url: $.fn.bootstrapTable.defaults.extend.benchmark_url,
                    pk: 'id',
                    toolbar: '#toolbar3',
                    // sortName: 'p.id',
                    sortName: 'id',
                    sortOrder: 'asc',
                    showToggle: false,
                    showExport: false,
                    search: false,
                    searchFormVisible: true,
                    height: $(window).height() - 270,
                    queryParams: function (params) {
                        params.point_type = 1;
                        return params;
                    },
                    columns: [
                        [
                            { checkbox: true },
                            {
                                field: 'point_code', title: '基准点',
                                events: Controller.operate,
                                formatter: function (value, row, index) {
                                    return '<a href="javascript:;" class="btn-relation">' + row.point_code + '</a>';
                                }
                            },
                            { field: 'sensor_name', title: '传感器', width: '120px', operate: false },
                            { field: 'dev_code', title: '采集仪', operate: false },
                            { field: 'card', title: '卡槽号', operate: false },
                            { field: 'port', title: '通道号', operate: false },
                            { field: 'addr', title: '地址号', operate: false },
                            {
                                field: 'operate', title: '操作', table: table,
                                events: Controller.operate,
                                formatter: function (value, row, index) {
                                    alert('table3');
                                    // 所有按钮名称
                                    var buttons = [];
                                    if (table.data('operateRelation')) {
                                        buttons.push({
                                            icon: 'fa fa-bars',
                                            name: 'relation',
                                            text: '关联测点',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-info btn-xs btn-relation'
                                        });
                                    }
                                    if (table.data('operateDel')) {
                                        buttons.push({
                                            icon: 'fa fa-trash',
                                            title: '删除',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-danger btn-xs btn-benchmark-del'
                                        });
                                    }
                                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                                }
                            }
                        ]
                    ],
                    pagination: true
                });
                // 添加
                $(document).on('click', '.btn-add-benchmark', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_benchmark_url;
                    $(this).data().area = ["800px", "90%"];
                    $(this).data().title = '选择基准点';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-benchmark', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '项？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/benchmark/del/ids/' + ids,
                                data: { 'item_id': item_id },
                                dataType: 'json',
                                error: function (re) {
                                    Toastr.error('操作失败');
                                },
                                success: function (re) {
                                    if (re.code == 1) {
                                        Toastr.success('操作成功');
                                        table.bootstrapTable('refresh');
                                    } else {
                                        Toastr.error(re.msg);
                                    }
                                }
                            });
                            Layer.close(index);
                        }
                    );
                });
                return table;
            }
        }
    };
    return Controller;
});
