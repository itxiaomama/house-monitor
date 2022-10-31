define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload', 'echarts', 'echarts-theme', 'jqueryui', 'summernote', 'template'], function ($, undefined, Backend, Table, Form, Upload, Echarts, Template) {

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
                $(this).data().area = ["900px", "90%"];
                $(this).data().title = '编辑工程';
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
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        var table = $(that).closest('table');
                        var options = table.bootstrapTable('getOptions');
                        Table.api.multi("del", row[options.pk], table, that);
                        Layer.close(index);
                    }
                );
            },
            'click .btn-edititem': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row.id;
                row = { ids: ids };
                var url = options.extend.edit_item_url;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '编辑项目';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-enditem': function (e, value, row, index) {
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
                    '确定结束项目？',
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/engineering/end/ids/' + row.id,
                            dataType: 'json',
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                                if (re.code == 1) {
                                    Toastr.success('操作成功');
                                    var table = $(that).closest('table');
                                    table.bootstrapTable('refresh');
                                } else {
                                    Toastr.error(re.msg);
                                }
                            }
                        });
                        Layer.close(index);
                    }
                );
            },
            'click .btn-delitem': function (e, value, row, index) {
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
                    '确定删除项目？',
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/engineering/del/ids/' + row.id,
                            dataType: 'json',
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                                console.log(re);
                                if (re.code == 1) {
                                    Toastr.success('操作成功');
                                    var table = $(that).closest('table');
                                    table.bootstrapTable('refresh');
                                } else {
                                    Toastr.error(re.msg);
                                }
                            }
                        });
                        Layer.close(index);
                    }
                );
            },
            'click .btn-itemone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.edit_plan_url;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '编辑';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-itemdetail': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.detail_item_url;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '详情';
                $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
            },
            'click .btn-itemdel': function (e, value, row, index) {
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
                    '确定删除监测内容？',
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/project_mon_type/del/ids/' + row.id,
                            dataType: 'json',
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                                if (re.code == 1) {
                                    Toastr.success('操作成功');
                                    var table = $('#child_table_' + row.project_id);
                                    table.bootstrapTable('refresh');
                                } else {
                                    Toastr.error(re.msg);
                                }
                            }
                        });
                        Layer.close(index);
                    }
                );
            },
            'click .btn-report-info': function (e, value, row, index) {
                Layer.open({
                    type: 1,
                    title: '备注',
                    area: ['600px', '80%'],
                    offset: 'auto',
                    maxmin: true,
                    content: '<div class="content">' + row.note + '</div>'
                });
            },
            'click .btn-config': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row.id;
                row = { ids: ids };
                var url = options.extend.config_url;
                $(this).data().area = ["90%", "90%"];
                $(this).data().title = '测点配置';
                // $(this).data().maxmin = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '测点配置', $(this).data() || {});
            }
        },
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/engineering/index' + location.search,
                    add_url: 'engineering/engineering/add',
                    edit_url: 'engineering/engineering/edit',
                    del_url: 'engineering/engineering/del',
                    table: 'project',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'createtime',
                sortOrder: 'desc',
                height: $(window).height() - 155,
                showToggle: false,
                showExport: false,
                search: false,
                searchFormVisible: true,
                columns: [
                    [
                        // {checkbox: true},
                        { field: 'name', title: '工程名称', formatter: Controller.api.formatter.project },
                        { field: 'city', title: '区域', formatter: Controller.api.formatter.address, operate: false },
                        { field: 'comp_name', title: '所属机构', visible: false, operate: false },
                        { field: 'createtime', title: '创建时间', addclass: 'datetimerange', operate: false },
                        {
                            field: 'operate', width: '170px', title: '操作', table: table, events: this.operate, buttons: [
                                {
                                    name: 'detail',
                                    text: '项目管理',
                                    icon: 'fa fa-bars',
                                    classname: 'btn btn-primary btn-xs btn-addtabs',
                                    url: 'engineering/engineering/detail'
                                    // url: 'engineering/project/index'
                                }
                                // , {
                                //         name: 'detail',
                                //         text: '添加项目',
                                //         icon: 'fa fa-bars',
                                //         classname: 'btn btn-xs btn-primary btn-dialog',
                                //         url: 'engineering/project/add'
                                //     }


                            ], formatter: Table.api.formatter.operate
                        }
                    ]
                ],
                pagination: true
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击详情
            $(".btn-add").data("area", ["900px", "90%"]);
            $(".btn-add").data("title", '添加工程');
            $(".btn-del").data("offset", 'auto');
            $(document).on('click', '.show-map', function () {
                var id = $(this).data('id');
                // var url = 'engineering/engineering/position/ids/'+id;
                var url = 'engineering/engineering/detail/ids/' + id;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '地图位置';
                Fast.api.open(url, '地图', $(this).data() || {});
            });
            $(document).on('click', '.btn-add-item', function () {
                var url = 'engineering/project/add_item';
                $(this).data().area = ["100%", "100%"];
                $(this).data().title = '添加项目';
                $(this).data().maxmin = false;
                Fast.api.open(url, '项目', $(this).data() || {});
            });
        },
        position: function () {
            var h = $(window).height();
            var lng = $('#lng').val();
            var lat = $('#lat').val();
            $('#allmap').height(h);
            require(['async!BMap'], function () {
                // 更多文档可参考 http://lbsyun.baidu.com/jsdemo.htm
                // 百度地图API功能
                var map = new BMap.Map("allmap");
                var point = new BMap.Point(lng, lat);
                map.centerAndZoom(point, 13); //设置中心坐标点和级别
                var marker = new BMap.Marker(point);  // 创建标注
                map.addOverlay(marker);               // 将标注添加到地图中
                marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画

                map.enableDragging();   //开启拖拽
                map.enableScrollWheelZoom(true); //是否允许缩放
            });
            $(window).resize(function () {
                h = $(window).height();
                $('#allmap').height(h);
            });
        },
        add: function () {
            // 上传工程分布图
            Upload.api.plupload($('#plupload-map'), function (data, ret) {
                if (data.id) {
                    $("#item_map_id").val(data.id);
                }
            });
            // 上传方案文件
            Upload.api.plupload($('#plupload-image'), function (data, ret) {
                if (data.id) {
                    $("#plan_file_id").val(data.id);
                }
            });
            // 上传3D模型
            Upload.api.plupload($('#plupload-bim'), function (data, ret) {
                if (data.id) {
                    $("#bim_file_id").val(data.id);
                }
            });

            //负责人选择
            $("#c-monitor_staff_id").data("params", function (obj) {
                return { monitor_id: $("#c-monitor_id").val() };
            });

            $("#c-safe_staff_id").data("params", function (obj) {
                return { monitor_id: $("#c-safe_id").val() };
            });

            $("#c-supervise_staff_id").data("params", function (obj) {
                return { monitor_id: $("#c-supervise_id").val() };
            });
            $("#c-build_staff_id").data("params", function (obj) {
                return { monitor_id: $("#c-build_id").val() };
            });
            $("#c-construction_staff_id").data("params", function (obj) {
                return { monitor_id: $("#c-construction_id").val() };
            });


            Controller.api.bindevent();
        },
        edit: function () {
            // 上传工程分布图
            Upload.api.plupload($('#plupload-map'), function (data, ret) {
                if (data.id) {
                    $("#item_map_id").val(data.id);
                }
            });
            // 上传方案文件
            Upload.api.plupload($('#plupload-image'), function (data, ret) {
                if (data.id) {
                    $("#plan_file_id").val(data.id);
                }
            });
            // 上传3D模型
            Upload.api.plupload($('#plupload-bim'), function (data, ret) {
                if (data.id) {
                    $("#bim_file_id").val(data.id);
                }
            });
            Controller.api.bindevent();
        },
        detail: function () {
            var engineering_id = $("#engineering_id").val();   //工程id
            var h = $(window).height();
            var w = $(window).width();
            $(".tab-pane").height(h - 86);
            $('#m-index').height(0.9 * h / 2 - 40 - 36);
            $('#points').height(0.9 * h / 2 - 40 - 36);
            if (w > 992) {
                $('#m-index').width(0.4 * w - 40);
                $('#points').width(0.4 * w - 42);
            } else {
                $('#m-index').width(w - 70);
                $('#points').width(w - 72);
            }

            // 获取图片高宽
            // var imgSrc = Config.demo.item_map_url;
            var imgSrc = "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3550738882,4119721783&fm=224&gp=0.jpg";
            var img = new Image();
            img.src = imgSrc;
            var img_k = 0;
            // 完全加载完毕的事件
            var list = [];    // 测点坐标集合
            img.onload = function () {
                img_k = img.width / img.height;
                // 设置示意图窗口尺寸
                var p_w = $('#m-index').width();
                var p_h = $('#m-index').height();
                // 初始化示意图
                var img_h = p_h - 8;
                var img_w = img_h * img_k;
                if (img_w > p_w) {
                    img_h = img_h - 22;
                    img_w = img_h * img_k;
                }
                $('#points').width(img_w);
                $('#points').height(img_h);
                $('#points').css("background-image", "url(" + imgSrc + ")");
                $('#points').css("background-size", img_w + 'px ' + img_h + 'px');
                // 获取测点实际坐标值
                $.ajax({
                    type: "POST",
                    url: "engineering/engineering/map",
                    data: 'engineering_id=' + engineering_id,
                    dataType: 'json',
                    success: function (re) {
                        if (re.code == 1) {
                            list = re.data;
                            addPoint(list);
                        } else {
                            Toastr.error(re.msg);
                        }
                    }
                });
            };
            // 初始化表格
            Table.api.init({
                extend: {
                    index_url: 'engineering/project/index?engineering_id=' + engineering_id,
                    add_url: 'engineering/project/add?engineering_id=' + engineering_id,
                    edit_item_url: 'engineering/project/edit',
                    edit_plan_url: 'engineering/project_mon_type/edit',
                    detail_item_url: 'engineering/project_mon_type/detail',
                    add_staff_url: 'engineering/engineering_staff/add?engineering_id=' + engineering_id,
                    add_report_url: 'engineering/polling/add?engineering_id=' + engineering_id,
                    add_scene_url: 'engineering/scene/add?engineering_id=' + engineering_id,
                    config_url: 'engineering/config/index',
                    add_alarm_url: 'engineering/alarm_notice/add?engineering_id=' + engineering_id,
                    add_video_url: 'engineering/engineering_video/add?engineering_id=' + engineering_id,
                    table: 'monitor'
                }
            });
            // 实例化项目列表
            var table1;
            $('#m-item').on('shown.bs.tab', function (e) {
                if (!table1) {
                    table1 = Controller.api.table1(engineering_id);
                    Table.api.bindevent(table1);
                } else {
                    table1.bootstrapTable('resetView', {
                        height: $(window).height() - 135
                    });
                }
            });
            $('#m-item').trigger("shown.bs.tab");
            // 实例化人员列表
            var table2;
            $('#m-staff').on('shown.bs.tab', function (e) {
                if (!table2) {
                    table2 = Controller.api.table2(engineering_id);
                    Table.api.bindevent(table2);
                } else {
                    table2.bootstrapTable('resetView', {
                        height: $(window).height() - 115
                    });
                }
            });
            // 实例化巡检报告
            var table3;
            $('#m-report').on('shown.bs.tab', function (e) {
                if (!table3) {
                    table3 = Controller.api.table3(engineering_id);
                    Table.api.bindevent(table3);
                } else {
                    table3.bootstrapTable('resetView', {
                        height: $(window).height() - 115
                    });
                }
            });
            // 实例化现场图片
            var table4;
            $('#m-scene').on('shown.bs.tab', function (e) {
                if (!table4) {
                    table4 = Controller.api.table4(engineering_id);
                    Table.api.bindevent(table4);
                } else {
                    table4.bootstrapTable('resetView', {
                        height: $(window).height() - 115
                    });
                }
            });
            // 实例化警情通知
            var table5, table6, table7;
            $('#m-alarm').on('shown.bs.tab', function (e) {
                if (!table5) {
                    table5 = Controller.api.table5(engineering_id, 1);
                    table6 = Controller.api.table5(engineering_id, 2);
                    table7 = Controller.api.table5(engineering_id, 3);
                    Table.api.bindevent(table5);
                    Table.api.bindevent(table6);
                    Table.api.bindevent(table7);
                }
            });
            // 实例化信息统计
            var chart;
            var chart1, chart2, chart3;
            $('#m-census').on('shown.bs.tab', function (e) {
                if (!chart) {
                    chart1 = Controller.api.chart1(engineering_id);
                    chart2 = Controller.api.chart2(engineering_id);
                    chart3 = Controller.api.chart3(engineering_id);
                    chart = true;
                }
            });
            // 实例化监控视频
            var table8;
            $('#m-video').on('shown.bs.tab', function (e) {
                if (!table8) {
                    table8 = Controller.api.table8(engineering_id);
                    Table.api.bindevent(table8);
                } else {
                    table8.bootstrapTable('resetView', {
                        height: $(window).height() - 115
                    });
                }
            });
            // 自适应
            $(window).resize(function () {
                var h = $(window).height();
                var w1 = $(window).width();
                $(".tab-pane").height(h - 86);
                $('#m-index').height(0.9 * h / 2 - 40 - 36);
                $('#m-index').width(0.4 * w1 - 30);
                if (table1) {
                    table1.bootstrapTable('resetView', {
                        height: $(window).height() - 135
                    });
                }
                if (table2) {
                    table2.bootstrapTable('resetView', {
                        height: $(window).height() - 90
                    });
                }
                if (table3) {
                    table3.bootstrapTable('resetView', {
                        height: $(window).height() - 90
                    });
                }
                if (table4) {
                    table4.bootstrapTable('resetView', {
                        height: $(window).height() - 90
                    });
                }
                if (table8) {
                    table8.bootstrapTable('resetView', {
                        height: $(window).height() - 90
                    });
                }
                var w = $("#p-4").width() - 30;
                if (chart) {
                    chart1.resize({ width: w });
                    chart2.resize({ width: w });
                    chart3.resize({ width: w });
                }
                // 示意图调整
                Controller.api.reset_map(0, list, img_k);
            });
            var sketch = $("#table1").data('operateSketch');
            // 添加坐标点
            function addPoint(params) {
                var img_w = $('#points').width();
                var kk = img_w / 2000;     // 比例系数
                $('.draggable0').remove();
                $('.draggable1').remove();
                var point;
                for (var i in params) {
                    // 获取测点实际坐标值
                    var id = params[i].id;
                    var x = params[i].map_x;      // x坐标
                    var y = params[i].map_y;      // y坐标
                    var code = params[i].item_name;
                    var mon_item_name = params[i].mon_item_name;
                    var x_n, y_n;
                    x_n = x * kk - 2;
                    y_n = y * kk - 34;
                    if (x_n < 0) {
                        x_n = 0;
                    }
                    if (y_n < 0) {
                        y_n = 0;
                    }
                    var url = 'engineering/sketch/index?ids=' + id;
                    var c_name = 'draggable' + params[i].status;
                    if (sketch) {
                        code = '<a href="' + url + '" class="btn-addtabs" title="测点分布" >' + code + '</a>';
                    }
                    point = '<div class="' + c_name + ' alarm0" style="position: absolute;left:' + x_n + 'px;top: ' + y_n + 'px;" id="point' + id + '">' +
                        '<div class="name"><div>项目：' + code + '</div><div>类型：' + mon_item_name + '</div></div>' +
                        '<div class="line-n"></div>' +
                        '</div>';
                    $('#points').append(point);
                }
            }
            // 重新加载项目
            $(document).on('click', '.btn-reload', function () {
                $('.draggable0').remove();
                $('.draggable1').remove();
                // 设置示意图窗口尺寸
                var p_w = $('#m-index').width();
                var p_h = $("#m-index").height();
                // 初始化示意图
                var img_h = p_h - 8;
                var img_w = img_h * img_k;
                if (img_w > p_w) {
                    img_h = img_h - 22;
                    img_w = img_h * img_k;
                }
                $('#points').width(img_w);
                $('#points').height(img_h);
                $('#points').css("background-image", "url(" + imgSrc + ")");
                $('#points').css("background-size", img_w + 'px ' + img_h + 'px');
                // 获取测点实际坐标值
                $.ajax({
                    type: "POST",
                    url: "engineering/engineering/map",
                    data: 'engineering_id=' + engineering_id,
                    dataType: 'json',
                    success: function (re) {
                        if (re.code == 1) {
                            list = re.data;
                            addPoint(list);
                        } else {
                            Toastr.error(re.msg);
                        }
                    }
                });
            });
            // 点击布点
            var data = {};
            $(document).on('click', '.btn-set', function () {
                $('.draggable0').draggable({ helper: "original" });
                $('.draggable0').draggable('enable');
                $('.draggable0').draggable({
                    stop: function (event, ui) {
                        var id = ui.helper[0].id;
                        var param = ui.position;
                        param.id = id.replace(/[^0-9]/ig, "");
                        data[id] = param;
                    }
                });
                $('.draggable1').draggable({ helper: "original" });
                $('.draggable1').draggable('enable');
                $('.draggable1').draggable({
                    stop: function (event, ui) {
                        var id = ui.helper[0].id;
                        var param = ui.position;
                        param.id = id.replace(/[^0-9]/ig, "");
                        data[id] = param;
                    }
                });
                Toastr.success('请拖动测点图标！');
            });
            // 点击保存
            $(document).on('click', '.btn-save', function () {
                var img_w_o = $('#points').width();
                var k = img_w_o / 2000;
                var new_data = { 'data': [] };
                for (var i in data) {
                    var id = data[i].id;
                    var x = $('#point' + id).position().left + 2;
                    var y = $('#point' + id).position().top + 34;
                    x_n = Math.round(x / k * 1000) / 1000;
                    y_n = Math.round(y / k * 1000) / 1000;
                    new_data.data.push({ 'id': id, 'map_x': x_n, 'map_y': y_n });
                }
                // 保存数据
                if (new_data.data.length) {
                    new_data.engineering_id = engineering_id;
                    $.ajax({
                        type: "POST",
                        url: "engineering/engineering/update_map",
                        data: new_data,
                        dataType: 'json',
                        error: function (xhq) {
                            Toastr.error('操作失败');
                        },
                        success: function (re) {
                            if (re.code == 1) {
                                Toastr.success('操作成功');
                                $('.draggable0').draggable({ helper: "original" });
                                $('.draggable0').draggable('disable');
                                $('.draggable1').draggable({ helper: "original" });
                                $('.draggable1').draggable('disable');
                                list = new_data.data;
                                data = {};
                            } else {
                                Toastr.error('操作失败');
                            }
                        }
                    });
                } else {
                    Toastr.success('操作成功');
                }
            });
            // 缩小
            $(document).on('click', '.btn-min', function () {
                Controller.api.reset_map(-1, list, img_k);
            });
            // 放大
            $(document).on('click', '.btn-max', function () {
                Controller.api.reset_map(1, list, img_k);
            });
            // 点击显隐
            var name = 1;
            $(document).on('click', '.btn-show', function () {
                if (name == 1) {
                    $('.name').show();
                    $('.line-n').show();
                    name = 2;
                } else {
                    $('.name').hide();
                    $('.line-n').hide();
                    name = 1;
                }
            });
            // 查看地图位置
            $(document).on('click', '.show-map', function () {
                var id = $(this).data('id');
                // var url = 'engineering/engineering/position/ids/'+id;
                var url = 'engineering/engineering/detail/ids/' + id;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '地图位置';
                Fast.api.open(url, '地图', $(this).data() || {});
            });
            // 查看工程详情
            $(document).on('click', '.show-info', function () {
                var id = $(this).data('id');
                var url = 'engineering/engineering/info/ids/' + id;
                $(this).data().area = ["900px", "90%"];
                $(this).data().title = '工程详情';
                Fast.api.open(url, '详情', $(this).data() || {});
            });
        },
        get_staffs: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/engineering/get_staffs' + location.search,
                    table: 'project',
                }
            });

            var table = $("#table");
            var check = Config.demo.check;
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height(),
                showToggle: false,
                showExport: false,
                columns: [
                    [
                        { checkbox: true },
                        { field: 'staff_name', title: '姓名' },
                        { field: 'phone', title: '电话' }
                    ]
                ],
                pagination: true,
                singleSelect: check
            });
            $(window).resize(function () {
                table.bootstrapTable('resetView', {
                    height: $(window).height()
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.choose-add', function () {
                var list = $('#table').bootstrapTable('getSelections');
                var ids = [Config.demo.staff_id];
                var staff = [Config.demo.staff_name];
                var staff_ids = '#c-' + Config.demo.staff_ids;
                var staff_names = '#c-' + Config.demo.staff_names;
                if (list.length == 1) {
                    $.each(list, function (i, value) {
                        if (value.staff_id != ids[0] && !check) {
                            ids.push(value.staff_id);
                            staff.push(value.staff_name);
                        } else if (value.staff_id != ids[0] && check) {
                            ids = value.staff_id;
                            staff = value.staff_name;
                        }
                    });
                    parent.window.$(staff_names).val(staff);
                    parent.window.$(staff_ids).val(ids);
                }
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击取消
            $(document).on('click', '.choose-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        get_companys: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/engineering/get_companys' + location.search,
                    table: 'project',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height(),
                showToggle: false,
                showExport: false,
                columns: [
                    [
                        { checkbox: true },
                        { field: 'comp_name', title: '机构名称' },
                    ]
                ],
                pagination: true,
                singleSelect: true
            });
            $(window).resize(function () {
                table.bootstrapTable('resetView', {
                    height: $(window).height()
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.choose-add', function () {
                var list = $('#table').bootstrapTable('getSelections');
                var ids = 0;
                var company = '';
                var comp_ids = '#c-' + Config.demo.comp_ids;
                var comp_names = '#c-' + Config.demo.comp_names;
                if (list.length == 1) {
                    $.each(list, function (i, value) {
                        ids = value.comp_id;
                        company = value.comp_name;
                    });
                    parent.window.$(comp_names).val(company);
                    parent.window.$(comp_ids).val(ids);
                }
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击取消
            $(document).on('click', '.choose-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
                // 百度坐标
                $(document).on('click', '.get-coordinate', function () {
                    window.open("/hezhiyun/public/map.html", "坐标选择", 'height=500, width=900, top=200, left=220, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no');
                });
                // 选择机构
                $(document).on('click', '#get-safe,#get-monitor,#get-supervise,#get-build,#get-construction', function () {
                    var name = $(this).data("val");
                    var comp_type = '';
                    var type = 0;
                    switch (name) {
                        case 'safe':
                            type = 1;
                            comp_type = '安监机构';
                            break;
                        case 'monitor':
                            type = 2;
                            comp_type = '监测机构';
                            break;
                        case 'supervise':
                            type = 3;
                            comp_type = '监理机构';
                            break;
                        case 'build':
                            type = 4;
                            comp_type = '建设单位';
                            break;
                        case 'construction':
                            type = 5;
                            comp_type = '施工单位';
                            break;
                    }
                    var comp_ids = name + '_id';
                    var comp_names = name + '_name';
                    var option = {
                        type: 2,
                        shadeClose: false,
                        area: ["70%", "90%"],
                        shade: 0.6,
                        maxmin: false,
                        moveOut: false
                    };
                    Fast.api.open('engineering/engineering/get_companys?type=' + type + '&comp_ids=' + comp_ids + '&comp_names=' + comp_names, '选择' + comp_type, option);
                });
                // 选择机构负责人
                $(document).on('click', '#get-safe-staff,#get-monitor-staff,#get-supervise-staff,#get-build-staff,#get-construction-staff', function () {
                    var name = $(this).data("val");
                    var comp_type = '';
                    switch (name) {
                        case 'safe':
                            comp_type = '安监机构';
                            break;
                        case 'monitor':
                            comp_type = '监测机构';
                            break;
                        case 'supervise':
                            comp_type = '监理机构';
                            break;
                        case 'build':
                            comp_type = '建设单位';
                            break;
                        case 'construction':
                            comp_type = '施工单位';
                            break;
                    }
                    var staff_ids = name + '_staff_id';
                    var staff_names = name + '_staff_name';
                    var option = {
                        type: 2,
                        shadeClose: false,
                        area: ["70%", "90%"],
                        shade: 0.6,
                        maxmin: true,
                        moveOut: false
                    };
                    var comp_id = $('#c-' + name + '_id').val();
                    if (comp_id) {
                        Fast.api.open('engineering/engineering/get_staffs?staff_ids=' + staff_ids + '&staff_names=' + staff_names + '&check=1&comp_id=' + comp_id, '选择' + comp_type + '负责人', option);
                    }
                });
                // 点击清空
                $(document).on('click', '.btn-remove', function () {
                    var name = $(this).data("val");
                    var c_id = '#c-' + name + '_id';
                    var c_name = '#c-' + name + '_name';
                    $(c_id).val(0);
                    $(c_name).val('');
                });
            },
            //项目列表表格
            table1: function (engineering_id) {
                var table = $("#table1");
                // 初始化表格
                table.bootstrapTable({
                    url: $.fn.bootstrapTable.defaults.extend.index_url,
                    pk: 'id',
                    sortName: 'status',
                    sortOrder: 'asc',
                    height: $(window).height() - 135,
                    toolbar: '#toolbar1',
                    showToggle: false,
                    showExport: false,
                    searchFormVisible: true,
                    search: true,
                    columns: [
                        [
                            { field: 'serial', title: '流水号', width: '110px', operate: false },
                            { field: 'item_name', title: '项目名称', width: '150px', operate: false },
                            { field: 'mon_item_name', title: '监测类型', width: '120px', operate: false, visible: false },
                            {
                                field: 'alarm_state', title: '警情状态', width: '80px', operate: false,
                                formatter: Controller.api.formatter.alarm
                            },
                            {
                                field: 'status', title: '完工状态', width: '80px',
                                searchList: Controller.api.searchList.status,
                                formatter: Controller.api.formatter.status
                            },
                            {
                                field: 'operate', width: '220px', title: '操作', table: table, events: Controller.operate,
                                formatter: function (value, row, index) {
                                    // 默认按钮组
                                    var buttons = [];
                                    if (table.data('operateEdit')) {
                                        buttons.push({
                                            // name: 'item',
                                            icon: 'fa fa-pencil',
                                            title: '编辑',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-xs btn-success btn-edititem',
                                        });
                                    }

                                    if (table.data('operateEnd') && row.status == 0) {
                                        buttons.push({
                                            icon: 'fa fa-cog',
                                            title: '完工',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-xs btn-warning btn-enditem'
                                        });
                                    }
                                    if (table.data('operateDel') && row.status == 1) {
                                        buttons.push({
                                            icon: 'fa fa-trash',
                                            title: '删除',
                                            extend: 'data-toggle="tooltip"',
                                            classname: 'btn btn-xs btn-danger btn-delitem'
                                        });
                                    }
                                    // if (table.data('operateConfig')) {
                                    //     buttons.push({
                                    //         name: 'detail',
                                    //         text: '测点配置',
                                    //         icon: 'fa fa-cog',
                                    //         classname: 'btn btn-primary btn-xs btn-config',
                                    //         url: 'engineering/config/index'
                                    //     });
                                    // }
                                    // if (table.data('operateSketch')) {
                                    //     buttons.push({
                                    //         name: 'map',
                                    //         text: '测点分布',
                                    //         icon: 'fa fa-map-marker',
                                    //         classname: 'btn btn-primary btn-xs btn-map btn-addtabs',
                                    //         url: 'engineering/sketch/index'
                                    //     });
                                    // }
                                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                                }
                            }
                        ]
                    ],
                    detailView: true,//增加父子表,
                    onExpandRow: function (index, row, $detail) {
                        Controller.api.initSubTable(index, row, $detail);
                    },
                    responseHandler: function (res) {
                        return res;
                    },
                    onLoadSuccess: function () {
                        var trs = $('#table1 tbody').find('tr[data-index]');
                        $.each(trs, function (m, n) {
                            click_tr(m, n);

                        })
                        $('#table1 tbody tr').eq(0).find('.detail-icon').trigger('click');
                    }
                });
                click_tr = function (index, dom) {
                    if (dom == 'undefined') {
                        return false;
                    }
                    $(dom).click(function () {
                        $(dom).find('> td > .detail-icon').trigger('click');
                    });
                };
                return table;
            },
            table2: function (engineering_id) {
                var table = $("#table2");
                // 初始化表格
                table.bootstrapTable({
                    url: 'engineering/engineering_staff/index?engineering_id=' + engineering_id,
                    pk: 'id',
                    toolbar: '#toolbar2',
                    height: $(window).height() - 90,
                    showToggle: false,
                    showExport: false,
                    commonSearch: false,
                    search: true,
                    columns: [
                        [
                            { checkbox: true },
                            { field: 'staff.staff_name', title: '人员名称' },
                            { field: 'staff.phone', title: '手机号码', operate: false },
                            { field: 'staff.email', title: '邮箱地址', operate: false }
                        ]
                    ],
                    pagination: true,
                    responseHandler: function (res) {
                        return res;
                    }
                });
                // 添加
                $(document).on('click', '.btn-add-staff', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_staff_url; //engineering/engineering_staff/add?engineering_id=1
                    $(this).data().area = ["600px", "90%"];
                    $(this).data().title = '添加人员';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-staff', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '项？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/engineering_staff/del/ids/' + ids,
                                data: { 'engineering_id': engineering_id },
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
            table3: function (engineering_id) {
                var table = $("#table3");
                // 初始化表格
                table.bootstrapTable({
                    url: 'engineering/polling/index?engineering_id=' + engineering_id,
                    pk: 'id',
                    showToggle: false,
                    showExport: false,
                    search: false,
                    commonSearch: false,
                    toolbar: '#toolbar3',
                    height: $(window).height() - 90,
                    columns: [
                        [
                            { checkbox: true },
                            { field: 'staff_name', title: '巡检人员' },
                            { field: 'createtime', title: '巡检日期', formatter: Table.api.formatter.datetime },
                            { field: 'file', title: '附件预览', formatter: Controller.api.formatter.thumb },
                            {
                                field: 'operate', width: '80px', title: '备注', table: table, events: Controller.operate,
                                formatter: function (value, row, index) {
                                    // 默认按钮组
                                    var buttons = [];
                                    buttons.push({
                                        // name: 'item',
                                        icon: 'fa fa-info-circle',
                                        text: '查看',
                                        classname: 'btn btn-xs btn-info btn-report-info',
                                    });
                                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                                }
                            }
                        ]
                    ],
                    pagination: true,
                    responseHandler: function (res) {
                        return res;
                    }
                });
                // 添加
                $(document).on('click', '.btn-add-report', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_report_url;
                    $(this).data().area = ["600px", "90%"];
                    $(this).data().title = '添加巡检报告';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-report', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '项巡检报告？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/polling/del/ids/' + ids,
                                data: { 'engineering_id': engineering_id },
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
            table4: function (engineering_id) {
                var table = $("#table4");
                // 初始化表格
                table.bootstrapTable({
                    url: 'engineering/scene/index?engineering_id=' + engineering_id,
                    pk: 'id',
                    templateView: true,
                    templateFormatter: "itemtpl",
                    showToggle: false,
                    showExport: false,
                    search: false,
                    commonSearch: false,
                    toolbar: '#toolbar4',
                    checkboxHeader: false,
                    height: $(window).height() - 90,
                    columns: [
                        [
                            { checkbox: true },
                        ]
                    ],
                    pagination: true,
                    responseHandler: function (res) {
                        return res;
                    }
                });
                // 添加
                $(document).on('click', '.btn-add-scene', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_scene_url;
                    $(this).data().area = ["600px", "90%"];
                    $(this).data().title = '添加图片';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-scene', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '张图片？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/scene/del/ids/' + ids,
                                data: { 'engineering_id': engineering_id },
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
            },//警情通知
            table5: function (engineering_id, type) {
                var table = $("#alarmtab" + type);
                // 初始化表格
                table.bootstrapTable({
                    url: 'engineering/alarm_notice/index?engineering_id=' + engineering_id + '&type=' + type,
                    pk: 'id',
                    toolbar: '#alarmbar' + type,
                    showToggle: false,
                    showExport: false,
                    commonSearch: false,
                    search: false,
                    columns: [
                        [
                            { checkbox: true },
                            { field: 'staff.staff_name', title: '人员名称' },
                            { field: 'staff.phone', title: '手机号码', operate: false },
                            { field: 'staff.email', title: '邮箱地址', operate: false }
                        ]
                    ],
                    pagination: false,
                    responseHandler: function (res) {
                        return res;
                    }
                });
                // 添加
                $(document).on('click', '.btn-add-alarm' + type, function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_alarm_url + '&type=' + type;
                    $(this).data().area = ["600px", "90%"];
                    $(this).data().title = '添加通知人员';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-alarm' + type, function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '项？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/alarm_notice/del/ids/' + ids,
                                data: { 'engineering_id': engineering_id, 'type': type },
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
            table8: function (engineering_id) {
                var table = $("#table8");
                // 初始化表格
                table.bootstrapTable({
                    url: 'engineering/engineering_video/index?engineering_id=' + engineering_id,
                    pk: 'id',
                    templateView: true,
                    templateFormatter: "itemtpl2",
                    showToggle: false,
                    showExport: false,
                    search: false,
                    commonSearch: false,
                    toolbar: '#toolbar8',
                    height: $(window).height() - 90,
                    columns: [
                        [
                            { checkbox: true },
                            { field: 'title', title: '标题' },
                        ]
                    ],
                    pagination: true,
                    responseHandler: function (res) {
                        return res;
                    }
                });
                // 添加
                $(document).on('click', '.btn-add-video', function () {
                    var options = table.bootstrapTable('getOptions');
                    var url = options.extend.add_video_url;
                    $(this).data().area = ["600px", "90%"];
                    $(this).data().title = '添加视频监控';
                    $(this).data().maxmin = false;
                    Fast.api.open(url, '添加', $(this).data() || {});
                });
                // 删除
                $(document).on('click', '.btn-del-video', function () {
                    var ids = Table.api.selectedids(table);
                    var n = ids.length;
                    ids = ($.isArray(ids) ? ids.join(",") : ids);
                    Layer.confirm(
                        '确定删除' + n + '个监控视频？',
                        { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                        function (index) {
                            $.ajax({
                                type: "POST",
                                url: 'engineering/engineering_video/del/ids/' + ids,
                                data: { 'engineering_id': engineering_id },
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
                // 实时监控
                $(document).on('click', '.c-video', function () {
                    var ids = $(this).data().id;
                    var option = {
                        type: 2,
                        shadeClose: false,
                        area: ["70%", "90%"],
                        shade: 0.4,
                        moveOut: false
                    };
                    Fast.api.open('device/actual/index/ids/' + ids, '实时监控', option);
                });
                return table;
            },
            chart1: function (engineering_id) {
                var myChart = Echarts.init(document.getElementById('chart1'), 'walden');
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '使用设备统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '20px',
                        right: '30px',
                        bottom: '10px',
                        top: '40px',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['双轴倾角计', '拉线位移计', '激光测距仪', '固定测斜仪', '静力水准仪'],
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '数量',
                            type: 'bar',
                            barWidth: '60%',
                            data: [1, 0, 2, 0, 0]  //测试数据
                        }
                    ]
                };
                // 获取设备统计信息
                $.ajax({
                    type: "POST",
                    url: "engineering/engineering/device_census",
                    data: { 'engineering_id': engineering_id },
                    dataType: 'json',
                    error: function (re) {
                        myChart.setOption(option);
                    },
                    success: function (re) {
                        if (re.code == 1) {
                            option.xAxis[0].data = re.xAxis;
                            option.series[0].data = re.series;
                        }
                        myChart.setOption(option);
                    }
                });
                return myChart;
            },
            chart2: function (engineering_id) {
                var myChart = Echarts.init(document.getElementById('chart2'), 'walden');
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '监测内容统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '20px',
                        right: '30px',
                        bottom: '10px',
                        top: '40px',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['沉降（竖向位移）', '倾斜（X&Y，角度）', '测距（位移）', '水位监测', '钢支撑轴力'],
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '数量',
                            type: 'bar',
                            barWidth: '60%',
                            data: [0, 0, 0, 0, 0]
                        }
                    ]
                };
                // 获取设备统计信息
                $.ajax({
                    type: "POST",
                    url: "engineering/engineering/engineering_type_census",
                    data: { 'engineering_id': engineering_id },
                    dataType: 'json',
                    error: function (re) {
                        myChart.setOption(option);
                    },
                    success: function (re) {
                        if (re.code == 1) {
                            option.xAxis[0].data = re.xAxis;
                            option.series[0].data = re.series;
                        }
                        myChart.setOption(option);
                    }
                });
                return myChart;
            },
            chart3: function (engineering_id) {
                var myChart = Echarts.init(document.getElementById('chart3'), 'walden');
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '报警记录统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                color: '#999'
                            },
                            label: {
                                precision: 0
                            }
                        }
                    },
                    grid: {
                        left: '20px',
                        right: '30px',
                        bottom: '10px',
                        top: '40px',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: [],
                            axisPointer: {
                                type: 'shadow'
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '次数'
                        },
                        {
                            type: 'value',
                            name: '次数'
                        },
                    ],
                    series: [
                        {
                            name: '报警',
                            color: '#FF6600',
                            type: 'bar',
                            smooth: true,
                            data: []
                        }
                    ]
                };
                // 获取设备统计信息
                $.ajax({
                    type: "POST",
                    url: "engineering/engineering/alarm_census",
                    data: { 'engineering_id': engineering_id },
                    dataType: 'json',
                    error: function (re) {
                        myChart.setOption(option);
                    },
                    success: function (re) {
                        if (re.code == 1) {
                            option.xAxis[0].data = re.xAxis;
                            option.series[0].data = re.series;
                        }
                        myChart.setOption(option);
                    }
                });
                return myChart;
            },
            initSubTable: function (index, row, $detail) {
                var parentid = row.id;
                var cur_table = $detail.html('<table id="child_table_' + parentid + '"></table>').find('table');
                $(cur_table).bootstrapTable({
                    url: 'engineering/project_mon_type/index',  //监测内容列表
                    method: 'get',
                    queryParams: { id: parentid },
                    ajaxOptions: { id: parentid },
                    uniqueId: "id",
                    striped: false, //是否显示行间隔色
                    pagination: false,//显示分页
                    sidePagination: "server",
                    clickToSelect: true,
                    toolbar: '',
                    //快捷搜索,这里可在控制器定义快捷搜索的字段
                    search: false,
                    //是否显示导出按钮
                    showExport: false,
                    //是否显示切换按钮
                    showToggle: false,
                    //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                    searchFormVisible: false,
                    //自定义列表字段的显示
                    showColumns: false,
                    //控制筛选条件
                    commonSearch: false,
                    columns: [
                        {
                            field: 'mon_type_name', title: '监测内容', operate: false,
                            events: Controller.operate,
                            formatter: function (value, row, index) {
                                if ($("#table1").data('operateData')) {
                                    var url = '/engineering/data/index/ids/' + row.id;
                                    return '<a href="' + url + '" title="数据管理" class="btn-addtabs">' + row.mon_type_name + '</a>';
                                } else {
                                    return row.mon_type_name
                                }
                            }
                        },
                        {
                            field: 'point_num', title: '测点数量', width: '80px', operate: false
                        },
                        {
                            field: 'operate',
                            title: '操作',
                            width: '220px',
                            table: cur_table,
                            events: Controller.operate,
                            formatter: function (value, row, index) {
                                this.buttons = [];
                                var table = $("#table1");
                                if (table.data('operateItemedit')) {
                                    this.buttons.push({
                                        title: '编辑',
                                        classname: 'btn btn-success btn-xs btn-itemone',
                                        icon: 'fa fa-pencil',
                                    });
                                }
                                if (table.data('operateItemdel')) {
                                    this.buttons.push({
                                        title: '删除',
                                        classname: 'btn btn-danger btn-xs btn-itemdel',
                                        icon: 'fa fa-trash',
                                    });
                                }
                                if (table.data('operatePoint')) {
                                    this.buttons.push({
                                        name: 'point',
                                        text: '测点管理',
                                        classname: 'btn btn-primary btn-xs btn-addtabs',
                                        icon: 'fa fa-bars',
                                        url: 'engineering/point/index'
                                    });
                                }
                                if (table.data('operateData')) {
                                    this.buttons.push({
                                        name: 'data',
                                        text: '数据管理',
                                        classname: 'btn btn-info btn-xs btn-addtabs',
                                        icon: 'fa fa-area-chart',
                                        url: 'engineering/data/index'
                                    });
                                }
                                return Table.api.formatter.operate.call(this, value, row, index);
                            }
                        },
                    ],
                    responseHandler: function (res) {
                        return res;
                    }
                });
            },
            reset_map: function (n, list, img_k) {
                var p_w = $('#m-index').width();
                var p_h = $('#m-index').height();
                var img_h_o = $('#points').height();
                var img_h_n = img_h_o + n * 100;
                if (img_h_n < p_h) {
                    img_h_n = p_h - 8;
                }
                var img_w_n = img_h_n * img_k;
                if (img_w_n > p_w) {
                    img_h_n = img_h_n - 22;
                    img_w_n = img_h_n * img_k;
                }
                $('#points').width(img_w_n);
                $('#points').height(img_h_n);
                $('#points').css("background-size", img_w_n + 'px ' + img_h_n + 'px');
                var k = img_w_n / 2000;     // 比例系数
                var x_n, y_n, x, y, id;
                for (var i in list) {
                    id = list[i].id;
                    x = list[i].map_x;
                    y = list[i].map_y;
                    x_n = x * k - 2;
                    y_n = y * k - 34;
                    $('#point' + id).css({ 'left': x_n, 'top': y_n });
                }
            },
            searchList: {//渲染的方法
                status: function (value, row, index) {
                    return '<select class="form-control" name="status"><option value="3">全部</option><option value="0" selected>进行中</option><option value="1">已完工</option></select>';
                },
            },
            formatter: {
                status: function (value, row, index) {
                    console.log('完成状态:' + value);
                    if (value == 0) {
                        return '<span class="label label-success">进行中</span>';
                    } else {
                        return '<span class="label label-default">已完工</span>';
                    }
                },
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
                thumb: function (value, row, index) {
                    return '<a href="' + row.file + '" target="_blank"><img src="' + row.file + '" style="height:20px;width:20px"></a>';
                },
                project: function (value, row, index) {
                    return '<a href="/JMRIUsnmLz.php/engineering/engineering/detail/ids/' + row.id + '" class="btn-addtabs" title="项目管理">' + value + '</a>';
                },
                address: function (value, row, index) {
                    return '<a href="javascript:;" class="show-map" data-id="' + row.id + '">' + value + '</a>';
                }
            }
        }
    };
    return Controller;
});
