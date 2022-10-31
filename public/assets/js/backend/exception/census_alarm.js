define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'template', 'echarts', 'layer', 'bootstrap-daterangepicker'], function ($, undefined, Backend, Table, Form, Template, Echarts, Layer) {
    var Controller = {
        index: function () {
            function getNow(s) {
                return s < 10 ? '0' + s : s;
            }
            var myDate = new Date;
            var year = myDate.getFullYear();
            var mon = myDate.getMonth() + 1;
            var times = year + '-' + getNow(mon)
            var YearAgo = year - 1
            var OneYearAgo = YearAgo + '-' + getNow(mon)
            var AffirmTime = OneYearAgo + ' - ' + times
            $('#my-time').val(AffirmTime)
            // 初始化时间插件
            var ranges = {};
            ranges[__('Today')] = [Moment().startOf('day'), Moment().endOf('day')];
            ranges[__('Yesterday')] = [Moment().subtract(1, 'days').startOf('day'), Moment().subtract(1, 'days').endOf('day')];
            ranges[__('Last 7 Days')] = [Moment().subtract(6, 'days').startOf('day'), Moment().endOf('day')];
            ranges[__('Last 30 Days')] = [Moment().subtract(29, 'days').startOf('day'), Moment().endOf('day')];
            ranges[__('This Month')] = [Moment().startOf('month'), Moment().endOf('month')];
            ranges[__('Last Month')] = [Moment().subtract(1, 'month').startOf('month'), Moment().subtract(1, 'month').endOf('month')];
            var options = {
                timePicker: true,
                autoUpdateInput: true,
                autoApply: true,
                locale: {
                    format: 'YYYY-MM'
                }
            };
            $('#my-time').daterangepicker(options); 
            // 初始化echarts实例
            var h = $(window).height();
            $('#my-chart').height(h - 150);
            // 基于准备好的dom，初始化echarts实例
            var myChart = Echarts.init(document.getElementById('my-chart'), 'walden');
            var option = {
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
                    bottom: '20px',
                    top: '60px',
                    containLabel: true
                },
                toolbox: {
                    iconStyle: {
                        borderColor: '#fff'
                    },
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                legend: {
                    data: ['预警', '报警', '控制'],
                    textStyle: {
                        color: '#000'
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        data: [],
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#267CD8',
                                width: 1
                            }
                        },
                        axisLabel: {
                            show: true,
                            color: '#000'

                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '次数',
                        nameTextStyle: {
                            color: '#000'
                        },
                        axisLabel: {
                            show: true,
                            color: '#000'

                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#267CD8',
                                width: 1
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: '#267CD8',
                                opacity: 0.3
                            }
                        }
                    },
                    {
                        type: 'value',
                        name: '次数',
                        nameTextStyle: {
                            color: '#000'
                        },
                        axisLabel: {
                            show: true,
                            color: '#000'
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#267CD8',
                                width: 1
                            }
                        }
                    },
                ],
                series: [
                    {
                        name: '预警',
                        color: '#38FFF3',

                        type: 'bar',
                        data: []
                    },
                    {
                        name: '报警',
                        itemStyle: {
                            normal: {
                                color: new Echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: '#38FFF3' },
                                    { offset: 1, color: '#19BBFF' }
                                ]
                                )
                            }
                        },
                        type: 'bar',
                        data: []
                    },
                    {
                        name: '控制',
                        color: '#19BBFF',
                        type: 'bar',
                        data: []
                    }
                ]
            };
            // 加载柱状图
            var index = Layer.load(3);
            get_chart_data();
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'exception/census_alarm' + location.search,
                    table: 'project',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                showToggle: false,
                showExport: false,
                search: false,
                height: $(window).height() - 266,
                columns: [
                    [
                        { field: 'name', title: '工程名称', formatter: Controller.api.formatter.project },
                        { field: 'comp_name', title: '所属机构', visible: false, operate: false },
                        { field: 'alarm_warn', title: '预警次数', operate: false },
                        { field: 'alarm_error', title: '报警次数', operate: false },
                        { field: 'alarm_control', title: '控制次数', operate: false },
                        { field: 'alarm_num', title: '总数', operate: false }
                    ]
                ],
                pagination: true
            });
            Table.api.bindevent(table);
            // 自适应
            $(window).resize(function () {
                h = $(window).height();
                $('#my-chart').height(h - 150);
                var w = $('#myTabContent').width();
                myChart.resize({ height: h - 150, width: w });
                myChart.setOption(option, true);
            });
            
            // 点击搜索确认
            $(document).on('click', '#search', function () {
                get_chart_data();
            });
            // 获取数据，加载曲线图
            function get_chart_data() {
                var time = $('#my-time').val();
                $.ajax({
                    type: "POST",
                    url: "exception/census_alarm/alarm",
                    data: { 'time': time },
                    dataType: 'json',
                    success: function (re) {
                        Layer.close(index);
                        if (re.code == 1) {
                            Toastr.success(re.msg);
                            option.xAxis[0].data = re.x_row;
                            option.series[0].data = re.warning;
                            option.series[1].data = re.error;
                            option.series[2].data = re.control;
                            myChart.setOption(option);
                        } else {
                            Toastr.error(re.msg);
                        }
                    }
                });
            }
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {
                project: function (value, row, index) {
                    return '<a href="/hezhiyun/public/admin.php/engineering/project/detail/ids/' + row.id + '" class="btn-addtabs" title="项目管理">' + value + '</a>';
                }
            }
        }
    };
    return Controller;
});
