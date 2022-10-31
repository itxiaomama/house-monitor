define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload', 'base64', 'template', 'bootstrap-daterangepicker'], function ($, undefined, Backend, Table, Form, Upload, Template) {
    var Controller = {
        operate: {
            'click .btn-editone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, { ids: ids });
                var url = options.extend.edit_url + '/ids/' + ids + '?item_id=' + row.project_mon_type_id + '&time=' + row.record_time;
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '编辑数据';
                Fast.api.open(url, '编辑', $(this).data() || {});
            },
            'click .btn-invalidone': function (e, value, row, index) {
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
                var ids = row.id + '#' + row.point_id + '#' + row.record_time;
                ids = $.base64.encode(ids);
                Layer.confirm(
                    '确认标记无效此项？',
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/data/invalid/ids/' + ids + '?item_id=' + row.project_mon_type_id + '&enable=1',
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
            'click .btn-validone': function (e, value, row, index) {
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
                var ids = row.id + '#' + row.point_id + '#' + row.record_time;
                ids = $.base64.encode(ids);
                Layer.confirm(
                    '确认标记有效此项？',
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/data/invalid/ids/' + ids + '?item_id=' + row.project_mon_type_id + '&enable=0',
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
                var ids = row.id + '#' + row.point_id + '#' + row.record_time;
                ids = $.base64.encode(ids);
                Layer.confirm(
                    __('Are you sure you want to delete this item?'),
                    { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                    function (index) {
                        var table = $(that).closest('table');
                        Table.api.multi("del", ids, table, that);
                        Layer.close(index);
                    }
                );
            }
        },
        index: function () {
            // 获取时间列表
            function getNow(s) {
                return s < 10 ? '0' + s : s;
            }
            var myDate = new Date;
            var year = myDate.getFullYear();
            var mon = myDate.getMonth() + 1;
            var day = myDate.getDate();
            var houer = myDate.getHours();
            var min = myDate.getMinutes()
            var se = myDate.getSeconds();
            var hms = getNow(houer) + ':' + getNow(min) + ':' + getNow(se)
            var times = year + '-' + getNow(mon) + '-' + getNow(day) + ' ' + hms;
            var d = new Date();
            var n = new Date(d.getTime() - 86400000 * 7);
            var before_year = n.getFullYear();
            var before_month = n.getMonth() + 1 <= 9 ? "0" + (n.getMonth() + 1) : n.getMonth() + 1;
            var date2 = n.getDate() <= 9 ? "0" + n.getDate() : n.getDate();
            var before_date = before_year + "-" + before_month + "-" + date2 + ' ' + hms;
            var timeall = before_date + ' ' + '-' + ' ' + times;
            console.log(timeall);
            $('#my-time').val(timeall);



            var item_id = $("#item_id").val();  //项目监测内容id
            var mon_type = $("#mon_type").val();  //监测类型
            var benchmark_id = 0;  //测孔编号
            // var models = $.parseJSON($("#models").val());//formatter.class
            var models = {
                "data1": "应变值1",
                "data2": "应变值2"
            };//formatter.class
            console.log($("#models").val());
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/data/index/ids/' + item_id + location.search,
                    add_url: 'engineering/data/add/id/' + item_id,
                    edit_url: 'engineering/data/edit',
                    del_url: 'engineering/data/del?item_id=' + item_id,
                    import_url: 'example/data/import?id=' + item_id,
                    table: 'point',
                }
            });
            var table = $("#table");
            var columns;
            if (mon_type == 3) {  //深层水平 位移
                columns = [
                    { checkbox: true },
                    {
                        field: 'benchmark_id', title: '测孔编号', width: '110px', visible: false,
                        defaultValue: benchmark_id,
                        searchList: $.getJSON('engineering/hole/searchlist?item_id=' + item_id),
                        formatter: function (value, row, index) {
                            return row.benchmark_name;
                        }
                    },
                    { field: 'point_code', title: '测点编号' },
                    { field: 'record_time', title: '采集时间', formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange' },
                    {
                        field: 'data5', title: '深度(m)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        }
                    },
                    {
                        field: 'data1', title: 'X轴单点记录值(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'total_data1', title: 'X轴单点位移增量(mm)', operate: false, visible: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'rate_data1', title: 'X轴变化速率(mm/d)', operate: false, visible: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'data3', title: 'X轴累积记录值(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'total_data3', title: 'X轴累计位移增量(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'data2', title: 'Y轴单点记录值(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'total_data2', title: 'Y轴单点位移增量(mm)', operate: false, visible: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'rate_data2', title: 'Y轴变化速率(mm/d)', operate: false, visible: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'data4', title: 'Y轴累积记录值(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    },
                    {
                        field: 'total_data4', title: 'Y轴累计位移增量(mm)', operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    }
                ];
            } else {
                columns = [
                    { checkbox: true },
                    // {field: 'point_code', title: '测点编号'},
                    { field: 'point_name', title: '测点编号' },
                    {
                        field: 'record_time',
                        title: '采集时间',
                        formatter: Table.api.formatter.datetime,
                        operate: 'RANGE',
                        addclass: 'datetimerange'
                    }
                ];
                $.each(models, function (i, value) {
                    var vals = {
                        field: i, title: value, operate: false,
                        formatter: function (value, row, index) {
                            return Math.round(value * 1000) / 1000;
                        },
                        cellStyle: Controller.api.formatter.class
                    };
                    columns.push(vals);
                });
            }
            columns.push({
                field: 'alarm_state', title: '报警状态', width: '110px',
                searchList: Controller.api.searchList.alarm,
                formatter: Controller.api.formatter.alarm
            });
            columns.push({
                field: 'enable', title: '有效状态', width: '110px', visible: false,
                searchList: Controller.api.searchList.enable,
                formatter: Controller.api.formatter.enable
            });
            columns.push({
                field: 'create_time',
                title: '上传时间',
                width: '160px',
                operate: false,
                addclass: 'datetimerange',
                visible: false
            });
            columns.push({
                field: 'operate', title: '操作', width: '110px', table: table,
                events: this.operate,
                formatter: function (value, row, index) {
                    // 默认按钮组
                    var buttons = [];
                    buttons.push(Table.button.edit);
                    // if(table.data('operateSign')) {
                    //     if (row.enable) {
                    //         buttons.push({
                    //             icon: 'fa fa-check',
                    //             title: '标记有效',
                    //             extend: 'data-toggle="tooltip"',
                    //             classname: 'btn btn-xs btn-info btn-validone',
                    //         });
                    //     } else {
                    //         buttons.push({
                    //             icon: 'fa fa-times',
                    //             title: '标记无效',
                    //             extend: 'data-toggle="tooltip"',
                    //             classname: 'btn btn-xs btn-warning btn-invalidone',
                    //         });
                    //     }
                    // }
                    buttons.push(Table.button.del);
                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                }
            });
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'record_time',
                sortOrder: 'desc',
                showToggle: false,
                showExport: false,
                search: false,
                searchFormVisible: true,
                columns: [
                    columns
                ],
                pagination: true,
                pageList: [10, 20, 50, 100, 500, 1000],
                responseHandler: function (res) {
                    // console.log(res);
                    return res;
                },
            });
            // 数据批量导入
            Upload.api.plupload($('#btn-import-file'), function (data, ret) {
                if (ret.code == 1) {
                    table.bootstrapTable('refresh');
                    Toastr.success(ret.msg);
                } else {
                    Toastr.error(ret.msg);
                }
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            $(".btn-add").data("area", ["600px", "90%"]);
            $(".btn-add").data("title", '添加数据');
            $(".btn-add").data("maxmin", false);

            // 曲线图
            Highcharts.setOptions({
                global: {
                    timezoneOffset: -8 * 60
                },
                lang: {
                    viewFullscreen: '全屏查看',
                    resetZoom: '重置',
                    resetZoomTitle: "重置缩放比例",
                    noData: '暂无数据...',
                    printChart: '打印图表',
                    downloadJPEG: '下载jpeg格式',
                    downloadPDF: '下载pdf格式',
                    downloadPNG: '下载png格式',
                    downloadSVG: '下载svg格式',
                },
            });
            var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
            var option = {
                chart: {
                    type: 'spline',
                    zoomType: 'x',
                    width: $('#line-chart').width(),
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                title: {
                    text: '趋势图',
                    style: {
                        color: '#000'
                    }
                },
                legend: {
                    itemHoverStyle: {
                        color: '#FF0000'
                    },
                    itemStyle: {
                        color: '#000'
                    }
                },
                xAxis: {
                    type: 'datetime',
                    gridLineWidth: 0.2,
                    gridLineColor: '#267CD8',
                    lineColor: '#267CD8',
                    lineWidth: 1,
                    tickColor: '#267CD8',
                    crosshairs: true,
                    labels: {
                        formatter: function () {
                            return Highcharts.dateFormat('%m-%d', this.value);
                        },
                        align: 'center',
                        style: {
                            color: '#000',
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    crosshairs: true,
                    valueDecimals: 3,//保留三位小数
                    valueSuffix: '',
                    xDateFormat: '%Y-%m-%d %H:%M:%S',
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        style: {
                            color: '#000',
                        }
                    },
                    gridLineWidth: 0.2,
                    gridLineColor: '#267CD8',
                    tickPixelInterval: 40,
                    minorGridLineWidth: 0,
                    minorTickInterval: 'auto',
                    minorTickLength: 10,
                    minorTickWidth: 0.5,
                    lineColor: '#267CD8',
                    lineWidth: 1,
                    tickWidth: 1,
                    tickColor: '#267CD8',
                    minorTickColor: '#267CD8'
                },
                series: [],
                credits: {
                    enabled: false, // 禁用版权信息
                },
                exporting: {
                    sourceHeight: $('#line-chart').height(),
                    sourceWidth: $('#line-chart').width(),
                    buttons: {
                        contextButton: {
                            menuItems: [
                                dafaultMenuItem[0],
                                dafaultMenuItem[2],
                                dafaultMenuItem[3],
                                dafaultMenuItem[4],
                                dafaultMenuItem[5],
                                dafaultMenuItem[6],
                            ]
                        }
                    }
                }
            };
          
                var id = $('[name="benchmark_id"]').val();
             
                $.ajax({
                    type: "POST",
                    url: "engineering/point/get_all_list",
                    data: { 'item_id': item_id, 'benchmark_id': id },
                    dataType: 'json',
                    success: function (re) {
                        var str = '';
                        if (re.code == 1) {
                            $.each(re.data, function (i, value) {
                                str += '<option value="' + value.id + '" selected>' + value.point_code + '</option>'
                            });
                        } else {
                            console.log('数据有误')
                        }
                        $('#my-point').html(str);
                        // $('#my-point').selectpicker('refresh');
                        get_chart_data(id);
                    }
                });

             
            $(document).on('click', '.btn-add-data', function () {
                var id = $('[name="benchmark_id"]').val();
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '添加数据';
                $(this).data().maxmin = false;
                var url = 'engineering/data/add/id/' + item_id + '?benchmark_id=' + id;
                Fast.api.open(url, '添加', $(this).data());
            });
            // 点击删除
            $(document).on('click', '.btn-delall', function () {
                var that = this;
                var row = table.bootstrapTable('getSelections');
                var data = [];
                $.each(row, function (i, val) {
                    data[i] = val.id + '#' + val.point_id + '#' + val.record_time;
                });
                var ids = data.join(",");
                ids = $.base64.encode(ids);
                Layer.confirm(
                    __('Are you sure you want to delete the %s selected item?', row.length),
                    { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                    function (index) {
                        Table.api.multi("del", ids, table, that);
                        Layer.close(index);
                    }
                );
            });
            // 点击搜索确认
            $(document).on('click', '.get-data', function () {
                var id = $('[name="benchmark_id"]').val();
                get_chart_data(id);
            });
            // 切换类型
            $('#my-type option:nth-child(2)').prop('selected', 'selected');
            $(document).on('change', '#my-type', function () {
                var id = $('[name="benchmark_id"]').val();
                get_chart_data(id);
            });
            // 点击设置确认
            $(document).on('click', '.set-data', set_chart_data);
            // 点击重置
            $(document).on('click', '#re-echart', function () {
                Highcharts.chart('line-chart', option);
            });
            // 点击导出数据
            $(document).on('click', '.btn-down', function () {
                $(this).data().area = ["600px", "90%"];
                $(this).data().title = '导出数据';
                $(this).data().maxmin = false;
                var benchmark_id = $('[name="benchmark_id"]').val();
                var url = 'engineering/data/down/?id=' + item_id + '&benchmark_id=' + benchmark_id;
                Fast.api.open(url, '导出', $(this).data());
            });
            // 点击生成日报
            $(document).on('click', '.btn-daily', function () {
                $(this).data().area = ["400px", "450px"];
                $(this).data().title = '生成日报';
                $(this).data().maxmin = false;
                var benchmark_id = $('[name="benchmark_id"]').val();
                var url = 'engineering/data/daily/?id=' + item_id + '&benchmark_id=' + benchmark_id;
                Fast.api.open(url, '导出', $(this).data());
            });
            // 点击原始数据
            $(document).on('click', '.btn-original', function () {
                var benchmark_id = $('[name="benchmark_id"]').val();
                var url = 'engineering/data/original/?item_id=' + item_id + '&benchmark_id=' + benchmark_id;
                Backend.api.addtabs(url, '原始数据');
            });
            // 点击测孔曲线
            $(document).on('click', '.btn-chart', function () {
                $(this).data().area = ["800px", "95%"];
                $(this).data().title = '测孔曲线';
                var benchmark_id = $('[name="benchmark_id"]').val();
                var url = 'engineering/data/chart/?ids=' + item_id + '&benchmark_id=' + benchmark_id;
                Fast.api.open(url, '曲线', $(this).data());
            });
            // 获取数据，加载曲线图
            function get_chart_data(benchmark_id) {
                var points = $('#my-point').val();
                var time = $('#my-time').val();
                var model = $('#my-type').val();
                var title = models[model];
                $.ajax({
                    type: "POST",
                    url: "engineering/data/getEchart",
                    // data: { 'item_id': item_id, 'points': points, 'time': time, 'model': model, 'benchmark_id': benchmark_id },
                    data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', 'benchmark_id': benchmark_id },
                    dataType: 'json',
                    success: function (re) {
                        if (re.code == 1) {
                            console.log(re, '123213213111111')
                            Toastr.success(re.msg);
                            option.title.text = title;
                            option.series = re.data;
                            // option.colors = ['#37A2DA','#32C5E9','#67E0E3','#9FE6B8','#FFDB5C','#FF9F7F','#FB7293','#E062AE','#E690D1','#E7BCF3','#9D96F5','#8378EA','#96BFFF'];
                            Highcharts.chart('line-chart', option);
                        } else {
                            option.series = [];
                            Highcharts.chart('line-chart', option);
                            // Toastr.error(re.msg);
                        }
                    }
                });
            }
            // 设置Y轴最大、最下值，加载曲线图
            function set_chart_data() {
                var min = $('#y_min').val();
                var max = $('#y_max').val();
                min = $.trim(min, '');
                max = $.trim(max, '');
                option.yAxis.min = min;
                option.yAxis.max = max;
                if (min === '') {
                    delete option.yAxis.min;
                }
                if (max === '') {
                    delete option.yAxis.max;
                }
                Highcharts.chart('line-chart', option);
            }
            $(window).resize(function () {
                option.chart.width = $('#line-chart').width();
                Highcharts.chart('line-chart', option);
            });
            Controller.api.bindevent();
            $('input').attr('autocomplete', 'off');
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        original: function () {
            var item_id = Config.demo.item_id;
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/data/original' + location.search,
                    table: 'data',
                }
            });
            var table = $("#table");
            var columns = [
                { checkbox: true },
                { field: 'dev_code', title: '采集仪编号' },
                { field: 'card', title: '卡槽号', operate: false },
                { field: 'port', title: '通道号', operate: false },
                { field: 'addr', title: '地址号', operate: false },
                { field: 'data1', title: '原始值1', operate: false },
                { field: 'data2', title: '原始值2', operate: false },
                { field: 'data3', title: '原始值3', operate: false },
                { field: 'data4', title: '原始值4', operate: false },
                { field: 'data5', title: '原始值5', visible: false, operate: false },
                { field: 'data6', title: '原始值6', visible: false, operate: false },
                { field: 'data7', title: '原始值7', visible: false, operate: false },
                { field: 'data8', title: '原始值8', visible: false, operate: false },
                {
                    field: 'record_time', title: '采集时间', operate: 'RANGE', addclass: 'datetimerange', width: '140px',
                    formatter: Controller.api.formatter.datatime
                },
                { field: 'create_time', title: '上传时间', operate: 'RANGE', addclass: 'datetimerange', width: '140px' },
                {
                    field: 'point_id', title: '状态', width: '80px', operate: false,
                    formatter: Controller.api.formatter.state
                },
            ];
            if (item_id) {
                columns = [
                    { checkbox: true },
                    { field: 'point_code', title: '测点编号' },
                    {
                        field: 'record_time', title: '采集时间', operate: 'RANGE', addclass: 'datetimerange', width: '140px',
                        formatter: Controller.api.formatter.datatime
                    },
                    { field: 'data1', title: '原始值1', operate: false },
                    { field: 'data2', title: '原始值2', operate: false },
                    { field: 'data3', title: '原始值3', operate: false },
                    { field: 'data4', title: '原始值4', operate: false },
                    { field: 'data5', title: '原始值5', visible: false, operate: false },
                    { field: 'data6', title: '原始值6', visible: false, operate: false },
                    { field: 'data7', title: '原始值7', visible: false, operate: false },
                    { field: 'data8', title: '原始值8', visible: false, operate: false },
                    { field: 'create_time', title: '上传时间', operate: 'RANGE', addclass: 'datetimerange', width: '140px', visible: false },
                    {
                        field: 'point_id', title: '状态', width: '80px', operate: false,
                        formatter: Controller.api.formatter.state
                    },
                ];
            }
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'd.create_time',
                sortOrder: 'desc',
                showToggle: false,
                showExport: false,
                search: false,
                searchFormVisible: true,
                height: $(window).height() - 155,
                columns: [
                    columns
                ],
                pagination: true
            });
            Table.api.bindevent(table);
            $('input').attr('autocomplete', 'off');
            // 点击删除
            $(document).on('click', '.btn-delall', function () {
                var that = this;
                var row = table.bootstrapTable('getSelections');
                var data = [];
                $.each(row, function (i, val) {
                    data[i] = val.id + '#' + val.point_id + '#' + val.record_time;
                });
                var ids = data.join(",");
                ids = $.base64.encode(ids);
                Layer.confirm(
                    __('Are you sure you want to delete the %s selected item?', row.length),
                    { icon: 3, title: __('Warning'), offset: 'auto', shadeClose: true },
                    function (index) {
                        $.ajax({
                            type: "POST",
                            url: 'engineering/data/original_del/ids/' + ids + '?item_id=' + item_id,
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
        },
        down: function () {
            var item_id = $('#project_mon_type_id').val();
            Form.api.bindevent($("form[role=form]"));
            // 点击确认
            $(document).on('click', '.layer-down', function () {
                var points = $('#points').val();
                // var data_type = $("input[name='state']:checked").val();
                var data_time = $('#data_time').val();
                var url = 'engineering/data/down_list/?id=' + item_id + '&points=' + points + '&data_time=' + data_time;
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
                $(this).data().area = ["600px", "90%"];
                $(this).data().maxmin = false;
                parent.Fast.api.open(Backend.api.fixurl(url), '下载列表', $(this).data() || {});

            });
            // 点击取消关闭窗口
            $(document).on('click', '.layer-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        daily: function () {
            var item_id = Config.demo.item_id;
            var benchmark_id = Config.demo.benchmark_id;
            Form.api.bindevent($("form[role=form]"));
            // 点击确认
            $(document).on('click', '.layer-down', function () {
                var data_time = $('#data_time').val();
                if (data_time == '') {
                    Toastr.error('请选择日期');
                } else {
                    var url = 'engineering/data/down_daily/?id=' + item_id + '&date=' + data_time + '&benchmark_id=' + benchmark_id;
                    location.href = Backend.api.fixurl(url);
                }
            });
            // 点击取消关闭窗口
            $(document).on('click', '.layer-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        chart: function () {
            var item_id = Config.demo.item_id;
            var point_id = Config.demo.point_id;
            var date = Config.demo.date;
            // 实例化时间范围
            $('#my-date').daterangepicker({
                locale: {
                    format: 'YYYY-MM-DD',
                    applyLabel: '确定',
                    cancelLabel: '取消'
                },
                startDate: date,
                endDate: date
            },
                function (start, end, label) {
                    // 获取该时间段内每次上传数据的时间
                    get_time_list(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
                }
            );
            // 曲线图
            var h = $(window).height();
            $('#line-chart1').height(h - 120);
            $('#line-chart2').height(h - 120);
            Highcharts.setOptions({
                global: {
                    timezoneOffset: -8 * 60
                },
                lang: {
                    viewFullscreen: '全屏查看',
                    resetZoom: '重置',
                    resetZoomTitle: "重置缩放比例",
                    noData: '暂无数据...',
                    printChart: '打印图表',
                    downloadJPEG: '下载jpeg格式',
                    downloadPDF: '下载pdf格式',
                    downloadPNG: '下载png格式',
                    downloadSVG: '下载svg格式',
                },
            });
            // 获取测孔数据
            var option1, option2;
            get_chart_data();
            // 点击搜索确认
            $(document).on('click', '.get-data', function () {
                get_chart_data();
            });
            // 点击设置确认
            $(document).on('click', '.set-data1', function () {
                set_chart_data(option1, 1);
            });
            $(document).on('click', '.set-data2', function () {
                set_chart_data(option2, 2);
            });
            // 点击重置
            $(document).on('click', '#re-echart', function () {
                Highcharts.chart('line-chart', option);
            });

        
            // 设置Y轴最大、最下值，加载曲线图
            function set_chart_data(option, n) {
                var min = $('#y_min' + n).val();
                var max = $('#y_max' + n).val();
                min = $.trim(min, '');
                max = $.trim(max, '');
                option.yAxis.min = min;
                option.yAxis.max = max;
                if (min === '') {
                    delete option.yAxis.min;
                }
                if (max === '') {
                    delete option.yAxis.max;
                }
                Highcharts.chart('line-chart' + n, option);
                return option;
            }
            // 加载测孔数据
            function get_chart_data() {
                var times = $('#my-time').val();
                if (point_id == null) {
                    Toastr.error('请选择测孔');
                    return false;
                }
                if (times == null) {
                    Toastr.error('请选择时间');
                    return false;
                }
                var params = {
                    'item_id': item_id,
                    'point_id': point_id,
                    'times': times
                };
                $.ajax({
                    type: "POST",
                    url: 'engineering/data/get_hole_data',
                    data: params,
                    dataType: 'json',
                    success: function (re) {
                        if (re.code == 1) {
                            // x轴
                            option1 = Controller.api.getOption();
                            option1.title = { 'text': 'X轴累计位移增量(mm)' };
                            option1.series = re.data.x;
                            option1 = set_chart_data(option1, 1);
                            Highcharts.chart('line-chart1', option1);
                            // y轴
                            option2 = Controller.api.getOption();
                            option2.title = { 'text': 'Y轴累计位移增量(mm)' };
                            option2.series = re.data.y;
                            option2 = set_chart_data(option2, 2);
                            Highcharts.chart('line-chart2', option2);
                        } else {
                            Toastr.error(re.msg);
                            return false;
                        }
                    }
                });

            }
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"), function (data, ret) {
                    // console.log(data);
                    // console.log(ret);
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
            },
            searchList: {//渲染的方法
                alarm: function (value, row, index) {
                    return '<select class="form-control" name="alarm_state"><option value="">选择</option><option value="0">正常</option><option value="1">预警</option><option value="2">报警</option><option value="3">控制</option></select>';
                },
                state: function (value, row, index) {
                    return '<select class="form-control" name="point_id"><option value="">选择</option><option value="0">无效</option><option value="1">有效</option></select>';
                },
                enable: function (value, row, index) {
                    return '<select class="form-control" name="enable"><option value="">选择</option><option value="0">有效</option><option value="1">无效</option></select>';
                }
            },
            formatter: {//渲染的方法
                //需要添加字段：warn  error  control
                class: function (value, row, index, field) {
                    var warn = $.parseJSON(row.warn);
                    var error = $.parseJSON(row.error);
                    var control = $.parseJSON(row.control);
                    if ($.inArray(field, control) > -1) {
                        return { 'css': { 'background-color': '#e74c3c', 'color': '#000' } };
                    } else if ($.inArray(field, error) > -1) {
                        return { 'css': { 'background-color': '#f39c12', 'color': '#000' } };
                    } else if ($.inArray(field, warn) > -1) {
                        return { 'css': { 'background-color': '#ffff00', 'color': '#000' } };
                    } else {
                        return '';
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
                            return '<span class="label bg-red" >报警</span>';
                            break;
                        case 3:
                            return '<span class="label label-danger">控制</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },


                state: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-danger">无效</span>';
                            break;
                        default:
                            return '<span class="label label-success">有效</span>';
                    }
                },
                enable: function (value, row, index) {
                    switch (value) {
                        case 1:
                            return '<span class="label label-danger">无效</span>';
                            break;
                        default:
                            return '<span class="label label-success">有效</span>';
                    }
                },
                datatime: function (value, row, index) {
                    var now = new Date(value * 1000);
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    var date = now.getDate();
                    var hour = now.getHours();
                    var minute = now.getMinutes();
                    var second = now.getSeconds();
                    return year + "-" + fixZero(month, 2) + "-" + fixZero(date, 2) + " " + fixZero(hour, 2) + ":" + fixZero(minute, 2) + ":" + fixZero(second, 2);
                    //时间如果为单位数补0 
                    function fixZero(num, length) {
                        var str = "" + num;
                        var len = str.length;
                        var s = "";
                        for (var i = length; i-- > len;) {
                            s += "0";
                        }
                        return s + str;
                    }
                }
            },
            getOption: function () {
                var option = {
                    chart: {
                        type: 'spline',
                        inverted: true
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        gridLineWidth: 1,
                        reversed: true,
                        title: {
                            enabled: true,
                            text: '深度（m）'
                        },
                        labels: {
                            formatter: function () {
                                return this.value;
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        labels: {
                            formatter: function () {
                                return this.value;
                            }
                        },
                        lineWidth: 1,
                        plotLines: [{
                            color: '#ed5565',
                            dashStyle: 'dash',
                            width: 2,
                            value: 0
                        }]
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '深度：{point.x} m<br/>位移：{point.y} mm'
                    },
                    series: [],
                    credits: {
                        enabled: false
                    }
                };
                return option;
            }
        }
    };
    return Controller;
});
