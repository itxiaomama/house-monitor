define(['vue', 'jquery', 'bootstrap', 'backend', 'addtabs', 'echarts', 'china', 'layer', 'looptip'], function (Vue, $, undefined, Backend, Datatable, Echarts, china, bootstrap, Layer, looptip) {
    var Controller = {
        index: function () {
            //这句话在多选项卡统计表时必须存在，否则会导致影响的图表宽度不正确
            $(document).on("click", ".charts-custom a[data-toggle=\"tab\"]", function () {
                var that = this;
                setTimeout(function () {
                    var id = $(that).attr("href");
                    var chart = Echarts.getInstanceByDom($(id)[0]);
                    chart.resize();
                }, 0);
            });
            //轮播图
            //自适应
            window.addEventListener('resize', () => {
                var h = $(window).height();
                $('.tr2').height(h - 600);
                var w = $('#bigbox').width();
                $('.tr2').resize({ height: h - 150, width: w });
            })

            // 自适应
            $(window).resize(function () {
                setHeight();
            });

            function setHeight() {
                var h = $(window).height();

                var h1 = $('.tr1').height();
                var h2 = $('.tr3').height();
                var h3 = (h - h1 - h2 - 0.005 * h) / 2;
                $('.tr2').height(h3);

                var h_1 = $('#m-dev').height();
                var w_1 = $('#m-dev').width();

                var w = $(window).width();
                var w1 = 3 * (w - 30) / 10;
                var w2 = 5 * (w1) / 10;
                var h4 = 6 * h3 / 10;
                // myChart2.resize(w2, h4);
                // myChart4.resize(w2, h4);
                var h5 = 80 * (h - h1 - h2 - 0.005 * h) / 100;
                var w3 = 4 * (w - 30) / 10;
                // myChart3.resize(w3, h5);
                $('#case4').width(w - 50);
            }

            var h = $(window).height();
            var h1 = $('.tr1').height();
            var h2 = $('.tr3').height();
            var h3 = (h - h1 - h2 - 0.005 * h) / 2;
            $('.tr2').height(h3);
            $('.td2').height(h3);
            var w = $(window).width();
            $('#case4').width(w - 50);
            var w1 = 3 * (w - 30) / 10;
            var w2 = 7 * (w1) / 10 - 30;
            var h4 = 6 * h3 / 10 - 15;






            new Vue({
                el: '#app',
                data: {
                    mark: 0,
                    alarm_count: 0,
                    alarm: [],
                    imgs: [],
                    numList: [],
                    imgIndex: 0,
                    imgTimer: null,
                    btnShow: false,
                    time: null,
                    monitor: [
                        {
                            mon_item_name: ''
                        },
                        {
                            mon_item_name: ''
                        },
                        {
                            mon_item_name: ''
                        },
                        {
                            mon_item_name: ''
                        },
                        {
                            mon_item_name: ''
                        },
                        {
                            mon_item_name: ''
                        }
                    ],
                    hengchart: {
                        list: [
                            {
                                name: '湿地(00)',
                                value: '39.57,',
                            },
                            {
                                name: '耕地(01)',
                                value: '883.67,',
                            },
                            {
                                name: '种植园用地(02)',
                                value: ' 3608.09',
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                            {
                                name: '种植园用地',
                                value: '213'
                            },
                        ],
                        datas: [
                            // '湿地(00)',
                            // '耕地(01)',
                            // '种植园用地(02)',
                            // '林地(03)',
                            // '草地(04)',
                            // '商业服务业用地(05)',
                            // '工矿用地(06)',
                            // '住宅用地(07)',
                            // '公共管理与公共服务用地(08)',
                        ],
                        values: [
                            // 883.67,
                            // 88.2,
                            // 3608.09,
                            // 11265.79,
                            // 48145.22,
                            // 4832.83,
                            // 1480.36,
                            // 4796.72,
                        ]
                    },
                    mapchart: {
                        geoCoordMap: {
                        },
                        data: [
                        ]
                    },
                    pieechart: [
                        {
                            value: 1,
                            name: ''
                        },
                        {
                            value: 1,
                            name: ''
                        }
                    ],
                    pieechart2: [
                        {
                            value: 1,
                            name: ''
                        }, {
                            value: 1,
                            name: ''
                        }
                    ],
                    devices_total: 0,
                    time: '',
                    niandata: '',
                    mondata: '',
                    wangong: '',
                },
                mounted() {
                    var _this = this
                    var Item = document.getElementsByClassName('item');
                    for (var i = 0; i < Item.length; i++) {
                        Item[i].className = 'item ' + _this.numList[i]
                    }
                    _this.imgMove()
                    //请求图片
                    $.ajax({
                        type: 'get',
                        url: 'style/getStylePhoto',
                        dataType: 'json',
                        success: function (res) {
                            if (res.code == 1) {
                                _this.imgs = res.data
                                _this.numList = res.count
                            } else {
                                console.log('请求失败')
                            }
                        }
                    })
                    //请求报警、监测类型数据
                    $.ajax({
                        type: 'get',
                        url: 'display/getEngineTypeList',
                        dataType: 'json',
                        success: function (res) {
                            // Layer.close(index);
                            if (res.code == 1) {
                                _this.alarm_count = res.alarm.count
                                _this.alarm = res.alarm.data
                                _this.monitor = res.type
                            } else {
                                console.log('请求失败')
                            }
                        }
                    })
                    //请求环形图数据
                    $.ajax({
                        type: 'get',
                        url: 'display/getProjectTotal',
                        dataType: 'json',
                        success: function (res) {
                            var myDate = new Date;
                            var year = myDate.getFullYear();
                            var mon = myDate.getMonth() + 1;
                            yearStr = year + ''
                            disLength = year.length;
                            _this.pieechart[0].value = res.year
                            _this.niandata = yearStr.slice(2) + '年累计'
                            _this.pieechart[1].value = res.month
                            _this.mondata = mon + '月累计'
                            for (var i = 0; i < _this.pieechart.length; i++) {
                                _this.pieechart[0].name = _this.niandata
                                _this.pieechart[1].name = _this.mondata
                                _this.pieechart[0].value = res.year
                                _this.pieechart[1].value = res.month
                            }
                            let pieObj = JSON.stringify(_this.pieechart);
                            let pieObj1 = JSON.parse(pieObj)
                            _this.pieEchart('project1', pieObj1);
                            _this.ing = '进行中'
                            _this.wangong = '已完工'
                            for (var i = 0; i < _this.pieechart2.length; i++) {
                                _this.pieechart2[0].name = _this.ing
                                _this.pieechart2[1].name = _this.wangong
                                _this.pieechart2[0].value = res.ing
                                _this.pieechart2[1].value = res.end
                            }
                            let pie2Obj = JSON.stringify(_this.pieechart2);
                            let pie2Obj1 = JSON.parse(pie2Obj)
                            _this.pieEchart2('project2', pie2Obj1)

                        }
                    })
                    //请求柱状图数据
                    $.ajax({
                        type: 'get',
                        url: 'display/getSensor',
                        dataType: 'json',
                        success: function (res) {
                            _this.devices_total = res.count
                            _this.hengchart.datas = res.yAxis
                            _this.hengchart.values = res.series
                            for (var i = 0; i < res.yAxis.length; i++) {
                                _this.hengchart.list[i].name = res.yAxis[i]
                                _this.hengchart.list[i].value = res.series[i];
                                if (_this.hengchart.values[i] == 0) {
                                    _this.hengchart.values[i] = ''
                                }
                            }
                            let obj = JSON.stringify(_this.hengchart);
                            let objtwo = JSON.parse(obj)
                            _this.hengEchart('m-dev', objtwo)
                        }
                    })
                    //请求地图数据
                    $.ajax({
                        type: 'get',
                        url: 'display/getEngineCity',
                        dataType: 'json',
                        success: function (res) {
                            console.log(res.data)
                            res.data.forEach(function (res) {
                                let name = "";
                                let jw = [];
                                name = res.name
                                jw.push(res.lng)
                                jw.push(res.lat)
                                _this.mapchart.geoCoordMap[name] = jw
                                console.log(res.id)
                            })
                            _this.mapchart.data = res.data;
                            console.log(_this.mapchart.data)
                            let mapc = JSON.stringify(_this.mapchart);//转换ob对象
                            console.log(mapc,'11111111111')
                            let mapc2 = JSON.parse(mapc);
                            _this.mapEchart(mapc2);
                        }
                    })

                    //头部时间星期
                    function getNow(s) {
                        return s < 10 ? '0' + s : s;
                    }
                    let myDate = new Date;
                    let year = myDate.getFullYear();
                    let mon = myDate.getMonth() + 1;
                    let day = myDate.getDate();
                    let wk = myDate.getDay()
                    let weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
                    let week = weeks[wk]
                    _this.time = year + '年' + getNow(mon) + '月' + getNow(day) + '日' + week




                },

                methods: {
                    mapEchart(Sdata) {
                        console.log(Sdata)
                        let _this = this
                        var convertData = function (data) {
                            var res = [];
                            for (var i = 0; i < data.length; i++) {
                                var geoCoord = _this.mapchart.geoCoordMap[data[i].name];
                                if (geoCoord) {
                                    res.push({
                                        name: data[i].name,
                                        value: geoCoord.concat(data[i].state),
                                        uername: data[i].username,
                                        unit: data[i].unit,
                                        state: data[i].state_name,
                                        id:data[i].id
                                    });
                                }
                            }
                            return res;
                        };
                        $.get('/assets/js/map.json', function (geoJson) {
                            Echarts.registerMap('china', { geoJSON: geoJson });
                            var mapchart = Echarts.init(document.getElementById('china_map'));
                            mapchart.setOption({
                                tooltip: {
                                    trigger: 'item',
                                    formatter: function (params) {
                                        return '工程名称:' + params.data.uername + '<br>' +
                                            '监测单位: ' + params.data.unit + '<br>' + '警情状态:' + params.data.state;
                                    }
                                },
                                geo: {
                                    map: 'china',
                                    roam: true,
                                    scaleLimit: { //滚轮缩放的极限控制
                                        min: 1.1,
                                        max: 15
                                    },

                                    label: {
                                        emphasis: {
                                            show: true,
                                            color: '#fff'
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            areaColor: 'rgba(255, 255, 255,0.8)',
                                            borderColor: '#2c3e50'
                                        },
                                        emphasis: {
                                            areaColor: '#18bc9c'
                                        }
                                    }
                                },
                                visualMap: {
                                    show: false,
                                    min: 0,
                                    max: 3,
                                    calculable: true,
                                    inRange: {
                                        color: ['#00ff00', '#ffff00', '#f39c12', '#e74c3c']
                                    },
                                    textStyle: {
                                        color: '#fff'
                                    }
                                },
                                series: [{
                                    name: '泵机数',
                                    type: 'scatter',
                                    coordinateSystem: 'geo',
                                    data: convertData(Sdata.data),
                                    symbolSize: 12,
                                    label: {
                                        normal: {
                                            show: false,
                                            borderColor: '#18bc9c'
                                        },
                                        emphasis: {
                                            show: false
                                        }
                                    },
                                    itemStyle: {
                                        emphasis: {
                                            borderColor: '#fff',
                                            borderWidth: 1
                                        },
                                        // color: '#fff',
                                    }
                                },
                                {
                                    type: 'map',
                                    map: 'china',
                                    geoIndex: 0,
                                    aspectScale: 0.75,
                                    tooltip: {
                                        show: false
                                    },

                                }
                                ],
                            }, true);

                            //地图点击事件
                            mapchart.on('click', function (Sdata,) {
                                console.log(Sdata)
                                // $this -> assignconfig('demo', ['name'=> '地名']);
                                var type = Sdata.componentSubType;
                                if (type == 'map') {
                                    var name = Sdata.name
                                    var url = 'example/baidumap/map' + '?name=' + name;
                                    $(this).data().area = ["900px", "90%"];
                                    $(this).data().title = '工程分布';
                                    Fast.api.open(url, '分布', $(this).data() || {});
                                } else {
                                    var id = Sdata.data.id;
                                    var url = 'engineering/engineering/detail/ids/' + id;
                                    console.log(url)
                                    var title = '项目管理';
                                    Backend.api.addtabs(url, title, 'fa fa-circle-o');
                                }
                            })

                            window.addEventListener('resize', () => {
                                var h = $(window).height();
                                $('#china_map').height(h - 150);
                                mapchart.resize({ height: h - 150, });
                            })
                        });

                    },
                    hengEchart(dom, Sdata,) {
                        var chartDomzhu = Echarts.init(document.getElementById(dom));
                        option = {
                            xAxis: {
                                splitLine: { show: false },
                                axisLabel: { show: false },
                                axisTick: { show: false },
                                axisLine: { show: false },
                            },
                            grid: {
                                containLabel: true,
                                left: '3%',
                                top: '3%',
                                right: '10%',
                                bottom: '3%',
                            },
                            yAxis: [
                                {
                                    data: Sdata.datas,
                                    inverse: true,
                                    axisLine: { show: false },
                                    axisTick: { show: false },
                                    splitLine: {
                                        show: false
                                    },
                                    axisLabel: {
                                        margin: 10,
                                        textStyle: {
                                            fontSize: 14,
                                            color: '#717C8E',
                                        },
                                    },
                                },
                            ],
                            series: [
                                {
                                    //内
                                    type: 'bar',
                                    barWidth: 20,
                                    // legendHoverLink: false,
                                    // symbolRepeat: true,
                                    silent: true,
                                    itemStyle: {
                                        color: 'transparent',
                                        // borderWidth:2
                                        borderColor: 'transparent',
                                    },
                                    data: Sdata.list,
                                    z: 1,
                                    // animationEasing: 'elasticOut',
                                },
                                {
                                    type: 'pictorialBar',
                                    animationDuration: 0,
                                    symbolRepeat: 'fixed',
                                    symbolMargin: '20%',
                                    symbol: 'rect',
                                    symbolSize: [5, 20],
                                    symbolMargin: 2,
                                    // symbolBoundingData: 2000,
                                    itemStyle: {
                                        normal: {
                                            color: '#bdbdbd',
                                        },
                                    },
                                    label: {
                                        normal: {
                                            show: true,
                                            position: 'right',
                                            offset: [0, 2],
                                            textStyle: {
                                                color: '#717C8E',
                                                fontSize: 14,
                                            },
                                        },
                                    },
                                    data: Sdata.values,
                                    z: 0,
                                    // animationEasing: 'elasticOut',
                                },
                                {
                                    //分隔
                                    type: 'pictorialBar',
                                    itemStyle: {
                                        normal: {
                                            color: new Echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                                offset: 0,
                                                color: '#05785f' // 0% 处的颜色
                                            }, {
                                                offset: 1,
                                                color: '#18b547' // 100% 处的颜色
                                            }], false)
                                        }
                                    },
                                    symbolRepeat: 'fixed',
                                    symbolMargin: 1,
                                    symbol: 'rect',
                                    symbolClip: true,
                                    symbolSize: [3, 20],
                                    symbolPosition: 'start',
                                    // symbolOffset: [0, 0],
                                    // symbolBoundingData: 2000,
                                    data: Sdata.list,
                                    z: 2,
                                    animationEasing: 'elasticOut',
                                },
                            ],
                        };
                        window.addEventListener('resize', () => {
                            var h = $('#main3').height();
                            $('#m-dev').height(h - 130);
                            var w = $('#main3').width;
                            chartDomzhu.resize({ height: h - 130, w });
                        })
                        chartDomzhu.setOption(option, true)
                    },
                    pieEchart(dom, sdata) {
                        console.log(sdata)
                        //基于准备好的dom，初始化echarts实例
                        var butoom_left = document.getElementById(dom);
                        var butoom_left_chart = Echarts.init(butoom_left)
                        option = {
                            tooltip: {
                                trigger: 'item'
                            },
                            color: ['#308cc0', '#873439'],
                            legend: {
                                bottom: '0%',
                                left: 'center',
                                formatter: function (name) {
                                    var data = option.series[0].data;
                                    var total = 0;
                                    var tarValue;
                                    for (var i = 0; i < data.length; i++) {
                                        total += data[i].value;
                                        if (data[i].name == name) {
                                            tarValue = data[i].value;
                                        }
                                    }
                                    var v = tarValue;
                                    var p = Math.round(((tarValue / total) * 100));
                                    return `${name}:${v}`;
                                },
                                itemWidth: 0,
                                textStyle: {
                                    fontSize: '15',
                                    color: [
                                        '#873439',
                                        '#308cc0'
                                    ],
                                    fontWeight: 900
                                },
                            },
                            series: [
                                {
                                    type: 'pie',
                                    radius: ['65%', '90%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '20',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: sdata[0].value, name: sdata[0].name },
                                        { value: sdata[1].value, name: sdata[1].name },
                                    ],
                                    selectedOffset: 50,
                                }
                            ]
                        };
                        window.addEventListener('resize', () => {
                            var h = $('#project1').height();
                            $('#project1').height(h - 10);
                            var w = $('#project1').width;
                            butoom_left_chart.resize({ height: h - 10, w });
                        })
                        function createExample(option, tooltipOption) {
                            // 基于准备好的dom，初始化echarts图表
                            // 为echarts对象加载数据
                            butoom_left_chart.setOption(option, true)
                            tools.loopShowTooltip(butoom_left_chart, option, tooltipOption);
                        }
                        createExample(option, {
                            loopSeries: true
                        });
                    },
                    pieEchart2(dom, sdata) {
                        console.log(sdata)
                        var butoom_right = document.getElementById(dom);
                        var butoom_right_chart = Echarts.init(butoom_right)
                        option = {
                            tooltip: {
                                trigger: 'item'
                            },
                            color: ['#c4a963', '#31e1da'],
                            legend: {
                                bottom: '5%',
                                left: 'center',
                                formatter: function (name) {
                                    var data = option.series[0].data;
                                    var total = 0;
                                    var tarValue;
                                    for (var i = 0; i < data.length; i++) {
                                        total += data[i].value;
                                        if (data[i].name == name) {
                                            tarValue = data[i].value;
                                        }
                                    }
                                    var v = tarValue;
                                    var p = Math.round(((tarValue / total) * 100));
                                    return `${name}:${v}`;
                                },
                                itemWidth: 0,
                                textStyle: {
                                    color: [
                                        '#BFA562',
                                        '#27B3B3'
                                    ],
                                    fontSize: '15',
                                    fontWeight: 900
                                },
                            },
                            series: [
                                {
                                    type: 'pie',
                                    radius: ['65%', '90%'],
                                    top: '-3%',
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '20',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: sdata[0].value, name: sdata[0].name },
                                        { value: sdata[1].value, name: sdata[1].name },
                                    ],
                                    selectedOffset: 50,
                                }
                            ]
                        }
                        window.addEventListener('resize', () => {
                            var h = $('#project2').height();
                            $('#project2').height(h - 10);
                            var w = $('#project2').width;
                            butoom_right_chart.resize({ height: h - 10, w });
                        })
                        function createExample(option, tooltipOption) {
                            // 基于准备好的dom，初始化echarts图表
                            // 为echarts对象加载数据
                            butoom_right_chart.setOption(option, true)
                            tools.loopShowTooltip(butoom_right_chart, option, tooltipOption);
                        }
                        createExample(option, {
                            loopSeries: true
                        });
                    },
                    //轮播图
                    imgMove() {
                        var Item = document.getElementsByClassName('item');
                        this.imgTimer = setInterval(() => {
                            this.numList.push(this.numList[0]);
                            this.numList.shift()
                            this.imgIndex++;
                            for (var i = 0; i < Item.length; i++) {
                                Item[i].className = 'item ' + this.numList[i];
                            }
                        }, 5000)
                    },
                    btnOpen() {
                        this.btnShow = true;
                        clearInterval(this.imgTimer)
                    },
                    btnHide() {
                        this.btnShow = false;
                        this.imgMove()
                    },
                    leftClick() {
                        var Item = document.getElementsByClassName('item');
                        this.numList.unshift(this.numList[4]);
                        this.numList.pop()
                        for (var i = 0; i < Item.length; i++) {
                            Item[i].className = 'item ' + this.numList[i];
                        }
                        this.imgIndex--
                    },
                    rightClick() {
                        var Item = document.getElementsByClassName('item');
                        this.numList.push(this.numList[0]);
                        this.numList.shift()
                        for (var i = 0; i < Item.length; i++) {
                            Item[i].className = 'item ' + this.numList[i];
                        }
                    }
                },

            })
            // 查看工程详情
            $(document).on('click', '.show-map', function () {
                var url = 'engineering/project/layout';
                $(this).data().area = ["100%", "100%"];
                $(this).data().title = '工程分布';
                $(this).data().maxmin = false;
                Fast.api.open(url, '分布', $(this).data() || {});
            });

        },

        api: {
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
                }
            }
        }

    };
    return Controller;
});


