// define(['vue','jquery','bootstrap', 'backend', 'table', 'form', 'upload', 'bootstrap-daterangepicker'], function (Vue,$, undefined, Backend, Table, Form, Upload,) {
    define(['vue', 'jquery', 'bootstrap', 'backend','table', 'form', 'addtabs', 'echarts', 'china', 'layer', 'looptip', 'citypicker','base64', 'template','bootstrap-daterangepicker'], function (Vue, $, undefined, Backend,Table,Form, Datatable, Echarts, china, bootstrap, Layer, looptip , citypicker,Template) {
        new Vue().$mount('#card')



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
                        jingwei: [120.210792,30.246026],
                        jingwei2: [120.210792,30.246026],
                        citys: [{
                            name: '北京',
                            lng: '116.3',
                            lat: '39.9',
                            color: '#5070FF',
                            type: 'circle',
                        }, {
                            name: '上海',
                            lng: '121.29',
                            lat: '31.11',
                            color: '#6EE7FF',
                            type: 'circle',
                        }, {
                            name: '石家庄',
                            lng: '114.51',
                            lat: '38.06',
                            color: '#90EE90',
                            type: 'circle',
                        }, {
                            name: '拉萨',
                            lng: '90.99',
                            lat: '29.65',
                            color: '#90EE90',
                            type: 'circle',
                        }, {
                            name: '哈尔滨',
                            lng: '126.32',
                            lat: '45.83',
                            color: '#90EE90',
                            type: 'circle',
                        }, {
                            name: '乌鲁木齐',
                            lng: '87.47',
                            lat: '43.77',
                            color: '#90EE90',
                            type: 'circle',
                        }, {
                            name: '澳门',
                            lng: '113.532918',
                            lat: '22.18242',
                            color: '#f8983a',
                            type: 'circle',
                        }, {
                            name: '成都',
                            lng: '104.05721',
                            lat: '30.577979',
                            color: '#FAFA32',
                            type: 'circle',
                        }],
                        url: '/assets/js/map.json',
                        mingz: 'china',
                        nik0: '',
                        nik1: [
                            // 卫星
                            new AMap.TileLayer.Satellite(),
                            // 路网
                            new AMap.TileLayer.RoadNet()
                        ],
                        nik2: [//只显示默认图层的时候，layers可以缺省
                            new AMap.TileLayer()//高德默认标准图层
                        ],
                        index250: 0,
                        dengone: 8.5,
                        idsaa: 0,
                        arryone: [],
                        arrytwo: [],
                        arrthree: [],
                        arrfor: [],
                        cityone: '浙江省/杭州市/萧山区',
                        numonne: '',
                        numtwoww: '',
                        namecity: [],
                        namegc: [],
                        allcity: '',
                        dateone: '',
                        echdata: '',
                        options:'',
                        point_id:'',
                        item_iid:'',
                        unundd:'',
                        tandata:'',
                    },
                    mounted() {
                        var _this = this
                        _this.mapEchart(_this.url, _this.mingz);
                        var Item = document.getElementsByClassName('item');
                        for (var i = 0; i < Item.length; i++) {
                            Item[i].className = 'item ' + _this.numList[i]
                        }
                        _this.initMaps(_this.jingwei, _this.nik0, _this.dengone)
                        _this.MAps.setMapStyle('amap://styles/darkblue');
    
                        //请求报警、监测类型数据
                        $.ajax({
                            type: 'get',
                            url: 'display/getEngineTypeList',
                            dataType: 'json',
                            success: function (res) {
                                if (res.code == 1) {
                                    console.log('----------------------------')
    
                                    _this.alarm_count = res.alarm.count
                                    _this.alarm = res.alarm.data
                                    _this.monitor = res.type
    
                                    var num = _this.monitor.length
                                    var nums = num / 2
                                    for (var i = 0; i < _this.monitor.length; i++) {
                                        var subStr = new RegExp('安全');
                                        var subStrtwo = new RegExp('监测');
                                        _this.monitor[i].mon_item_name = _this.monitor[i].mon_item_name.replace(subStr, "");
                                        _this.monitor[i].mon_item_name = _this.monitor[i].mon_item_name.replace(subStrtwo, "");
    
                                        if (i < nums) {
                                            _this.arryone.push(_this.monitor[i])
                                        } else {
                                            _this.arrytwo.push(_this.monitor[i])
                                        }
                                    }
                                    // console.log(_this.arryone)
                                    // console.log(_this.arrytwo)
    
                                } else {
                                    console.log('请求失败')
                                }
                            }
                        })
                        //请求柱状图数据
                        $.ajax({
                            type: 'get',
                            url: 'board/getEngOrgNum',
                            dataType: 'json',
                            success: function (res) {
                                var num = res.series.length
                                var nums = num / 2
                                for (var i = 0; i < res.series.length; i++) {
                                    if (i < nums) {
                                        var obj = {
                                            name: '',
                                            num: ''
                                        }
                                        obj.name = res.yAxis[i]
                                        obj.num = res.series[i]
    
                                        _this.arrthree.push(obj)
                                    } else {
                                        var obj1 = {
                                            name: '',
                                            num: ''
                                        }
                                        obj1.name = res.yAxis[i]
                                        obj1.num = res.series[i]
                                        _this.arrfor.push(obj1)
    
                                    }
    
                                }
                            }
                        })
                        //请求地图数据
                        $.ajax({
                            type: 'get',
                            url: 'board/getEngPoint',
                            dataType: 'json',
                            success: function (res) {
    
                                if (res.code == 200) {
                                    _this.dateone = res
                                    _this.dianyuandian(res)
                                } else {
                                    false
                                }
                            }
                        })
    
    
                        setInterval(function(){
                            $.ajax({
                                type: 'get',
                                url: 'board/getAlarmPop',
                                dataType: 'json',
                                success: function (res) {
                                    
                                    for( var i = 0; i<res.data.length; i++ ){
                                        if( res.data[i].alarm_status==1 ){
                                            res.data[i].alarm_status = '预警'
                                        }else{
                                            res.data[i].alarm_status = '报警'
                                        }
                                        if( res.data[i].record_status==0 ){
                                            res.data[i].record_status = '未处理'
                                        }else if(res.data[i].record_status==1){
                                            res.data[i].record_status = '处理中'
                                        }else if(res.data[i].record_status==2){
                                            res.data[i].record_status = '待消警'
                                        }else if(res.data[i].record_status==3){
                                            res.data[i].record_status = '已消警'
                                        }else{
                                            res.data[i].record_status = '驳回消警'
                                        }
                                    }
                                    _this.tandata = res.data
                                }
                            })
                            $('.new_tanc').fadeIn()
                        },3000000)
    
                        
    
    
    
    
    
    
                        // 测点曲线图的三级联动
                        $.ajax({
                            type: 'get',
                            url: 'display/getLevel?city=' + _this.cityone,
                            dataType: 'json',
                            success: function (res) {
                                _this.allcity = res
                                _this.namecity = res
                                _this.numonne = _this.namecity[0].item_name
                                _this.namegc = _this.namecity[0].point
                                _this.numtwoww = _this.namegc[0].point_code
    
    
                                var id = res[0].point[0].id
                                var item_id =  res[0].point[0].item_id
                                var model = res[0].point[0].model
                            
                                $.ajax({
                                    type: "get",
                                    url: "display/getModel?mon_type_id="+res[0].point[0].mon_type_id,                            
                                    dataType: 'json',
                                    success: function (re) {
                                        _this.unundd = re.data
                                        var str = '';
                                        console.log(re,'1111111111111111111111')
                                        if (re.code == 200) {
                                            $.each(re.data, function (i, value) {
                                                str += '<option value="' + i + '">' + value + '</option>';
                                            });
                                        } else {
                                            console.log('数据有误')
                                        }
                                        $('#my-type').html(str);                              
                                        
                                                                                                
                                        _this.point_id = id
                                        _this.item_iid = item_id
                                        _this.get_chart_data(_this.item_iid, _this.point_id);
                                    }
                                });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
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
                        $('#my-time').val(timeall);
    
    
                        $(function () {
                            var $citypicker3 = $('#city-picker3');
                            $citypicker3.citypicker('reset');
                            $citypicker3.citypicker('destroy');
                            $citypicker3.citypicker({
                                province: '浙江省',
                                city: '杭州市',
                                district: '萧山区'
                            });
    
    
                            $('.ner_shanchu').click(function(){
                                $('.new_tanc').fadeOut()
                            })
    
                            $(".img-xuan").mouseenter(function () {
                                $('.xuanfu').css('display', 'block')
                            });
                            $(".xuanfu").mouseleave(function () {
                                $('.xuanfu').css('display', 'none')
                            });
                            var of1 = 0;
                            var of2 = 0;
                            var of3 = 0;
                            // 下拉点击事件
                            $('#quone').click(function () {
    
                                if (of1 != 0) {
                                    $('#diquone').css({
                                        'display': 'none',
                                    })
                                    of1 = 0;
                                } else {
                                    $('#diquone').css({
                                        'display': 'block',
                                        'min-width': '150px',
                                        'transform-origin': 'center top',
                                        'z-index': '2120',
                                        'position': 'absolute',
                                        'left': '10px'
                                    })
                                    of1 = 1;
                                }
    
    
    
                                if (of2 != 0) {
                                    $('#didiantwo').css({
                                        'display': 'none',
                                    })
                                    of2 = 0;
                                }
                                if (of3 != 0) {
                                    $('#weizhithree').css({
                                        'display': 'none',
                                    })
                                    of3 = 0;
                                }
                            })
                            $('#qutwo').click(function () {
                                if (of2 != 0) {
                                    $('#didiantwo').css({
                                        'display': 'none',
                                    })
                                    of2 = 0;
                                } else {
                                    $('#didiantwo').css({
                                        'display': 'block',
                                        'min-width': '150px',
                                        'transform-origin': 'center top',
                                        'z-index': '2120',
                                        'position': 'absolute',
                                        'left': '0px'
                                    })
                                    of2 = 1;
                                }
                                if (of1 != 0) {
                                    $('#diquone').css({
                                        'display': 'none',
                                    })
                                    of1 = 0;
                                }
    
                                if (of3 != 0) {
                                    $('#weizhithree').css({
                                        'display': 'none',
                                    })
                                    of3 = 0;
                                }
                            })
                            $('#quthree').click(function () {
                                if (of3 != 0) {
                                    $('#weizhithree').css({
                                        'display': 'none',
                                    })
                                    of3 = 0;
                                } else {
                                    $('#weizhithree').css({
                                        'display': 'block',
                                        'min-width': '150px',
                                        'transform-origin': 'center top',
                                        'z-index': '2120',
                                        'position': 'absolute',
                                        'left': '0px'
                                    })
                                    of3 = 1;
                                }
    
                                if (of1 != 0) {
                                    $('#diquone').css({
                                        'display': 'none',
                                    })
                                    of1 = 0;
                                }
                                if (of2 != 0) {
                                    $('#didiantwo').css({
                                        'display': 'none',
                                    })
                                    of2 = 0;
                                }
                            })
    
    
    
                            $(".wrap").delegate('#diquone ul li', 'click', function () {
                                $('#quone input').val($(this).text())
                                $('#diquone ul li').removeClass('selected')
                                $(this).addClass('selected')
                                $('#diquone').css({
                                    'display': 'none',
                                })
                                of1 = 0;
                            })
                            $(".wrap").delegate('#didiantwo ul li', 'click', function () {
                                $('#qutwo input').val($(this).text())
                                $('#didiantwo ul li').removeClass('selected')
                                $(this).addClass('selected')
                                $('#didiantwo').css({
                                    'display': 'none',
                                })
                                of2 = 0;
                                var num = $(this).index()
                                _this.namegc = _this.namecity[num].point
                                if (_this.namegc == [] || _this.namegc == '') {
                                    _this.numtwoww = ''
                                    $('#my-type').html(' ');
                                   
                                } else {
                                    _this.numtwoww = _this.namegc[0].point_code
                                    var item_id = _this.namegc[0].item_id
                                    var model = _this.namegc[0].model
                                    var point_id = _this.namegc[0].id
                                    var obj = {
                                        'item_id': item_id,
                                        'model': model,
                                        'point_id': point_id,
                                    }
                                    $.ajax({
                                        type: 'post',
                                        url: 'board/getEchart',
                                        data: obj,
                                        dataType: 'json',
                                        success: function (res) {
                                            if (res.code == 1) {
                                                var dat = res.data[0]
                                                console.log(dat)
                                                Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                                // _this.echartsthree('echartthree', dat)
                                                _this.point_id = point_id
                                                _this.item_iid = item_id
                                                _this.get_chart_data(item_id,point_id)
    
                                            }
                                        }
                                    })
                                }
    
                            })
                            $(".wrap").delegate('#weizhithree ul li', 'click', function () {
                                $('#quthree input').val($(this).text())
                                $('#weizhithree ul li').removeClass('selected')
                                $(this).addClass('selected')
                                var num = $(this).index()
                                console.log(num)
                                var item_id = _this.namegc[num].item_id
                                var model = _this.namegc[num].model
                                var point_id = _this.namegc[num].id
                                
                                var obj = {
                                    'item_id': item_id,
                                    'model': model,
                                    'point_id': point_id,
                                }
                                $.ajax({
                                    type: 'get',
                                    url: 'display/getModel?mon_type_id='+_this.namegc[num].mon_type_id,
                                    dataType: 'json',
                                    success: function (res) {
                                          var str = '';
                                          _this.unundd = res.data
                                        if (res.code == 200) {
                                            console.log(res)
                                            var list = res.data;
                                            $.each(list, function (i, time) {
                                                   str += '<option value="' + i + '">' + time + '</option>';
                                            });                                     
                                            $('#my-type').html(str);
                                            $('#my-type').selectpicker('refresh');
                                            Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                            _this.item_iid = item_id
                                            _this.point_id = point_id
                                            _this.get_chart_data(_this.item_iid, _this.point_id);
    
                                        }
                                    }
                                })
                                $('#weizhithree').css({
                                    'display': 'none',
                                })
                                of3 = 0;
    
    
    
                            })
                            $(window).resize(function () {
                                _this.options.chart.width = $('#line-chart').width();
                                Highcharts.chart('line-chart', _this.options);
                            });
    
    
    
    
                            $(".right111").delegate('.back_btn', 'click', function () {
                                console.log('111')
                                $('.back_btn').hide();
                                $('.xuanfu label input').attr("checked", false)
                                $('.xuanfu label .morenint').click()
                                Echarts.init(document.getElementById('china_map')).dispose();
                                _this.mapEchart(_this.url, _this.mingz);
                                _this.destroyMap()
                                _this.dengone = 11
                                _this.index250 = 0
                                _this.initMaps(_this.jingwei2, _this.nik0, _this.dengone);
                                _this.MAps.setMapStyle('amap://styles/darkblue');
                                _this.dianyuandian(_this.dateone)
    
                            })
    
                            $('.xuanfu label input').click(function () {
                                // console.log($(this).val())
                                if ($(this).val() == 0) {
                                    _this.destroyMap()
                                    _this.index250 = 0
                                    _this.initMaps(_this.jingwei, _this.nik0, _this.dengone)
                                    _this.dianyuandian(_this.dateone)
    
                                    _this.MAps.setMapStyle('amap://styles/darkblue');
                                } else if ($(this).val() == 1) {
                                    _this.destroyMap()
                                    _this.initMaps(_this.jingwei, _this.nik1, _this.dengone)
                                    _this.dianyuandian(_this.dateone)
    
                                    _this.index250 = 1
    
                                } else if ($(this).val() == 2) {
                                    _this.destroyMap()
                                    _this.index250 = 2
                                    _this.initMaps(_this.jingwei, _this.nik2, _this.dengone)
                                    _this.dianyuandian(_this.dateone)
    
                                } else {
                                    return false
                                }
                            })
    
                            $('.aa').css('color', '#fff')
                            //悬浮按钮移入
                            $(".right111").delegate('.right_persi', 'mouseenter', function () {
                                if ($(this).attr('vlaue') == 1) {  //报警统计
                                    $('.left').css('display', 'none')
                                    $(".centerwrap").fadeIn(500);
                                    $('#main2').fadeIn(1000)
                                    $('.right_pone').css('background', '#18BC9C')
                                    $('.right_ptwo').css('background', '#2c3a47')
                                   
    
                                } else if ($(this).attr('vlaue') == 3) {
                                    $('#main2').css('display', 'none')
                                    $(".centerwrap").fadeIn(500);
                                    $('.left').fadeIn(1000)
                                    $('.right_ptwo').css('background', '#18BC9C')
                                    $('.right_pone').css('background', '#2c3a47')
                                    _this.options.chart.width = $('#line-chart').width();
                                    Highcharts.chart('line-chart', _this.options);
                                }
                            })
                            //城市选择
    
    
    
                            $("body").click(function (event) {
                                var $this = $(event.target);
                                if ($this.attr('class') != 'el-input__inner' && $this.attr('class') != 'select__caret') {
                                    $("#diquone").hide();
                                    $("#didiantwo").hide();
                                    $("#weizhithree").hide();
                                    of1 = 0;
                                    of2 = 0;
                                    of3 = 0;
                                }
                            });
    
    
                            $(".wrap").delegate('.coxzaij', 'click', function () {
                                $(".centerwrap").fadeOut(500);
                                $('.left').css('display', 'none')
                                $('#main2').css('display', 'none')
                                $('.right_pone').css('background', '#2c3a47')
                                $('.right_ptwo').css('background', '#2c3a47')
    
                            })
                            setInterval(() => {
                                var date = new Date();
                                var year = date.getFullYear();        //年 ,从 Date 对象以四位数字返回年份
                                var month = date.getMonth() + 1;      //月 ,从 Date 对象返回月份 (0 ~ 11) ,date.getMonth()比实际月份少 1 个月
                                var day = date.getDate();             //日 ,从 Date 对象返回一个月中的某一天 (1 ~ 31)
                                var hours = date.getHours();          //小时 ,返回 Date 对象的小时 (0 ~ 23)
                                var minutes = date.getMinutes();      //分钟 ,返回 Date 对象的分钟 (0 ~ 59)
                                var seconds = date.getSeconds();      //秒 ,返回 Date 对象的秒数 (0 ~ 59)
    
                                //获取当前系统时间
                                var currentDate = year + "年" + month + "月" + day + "日" + " " + hours + ":" + minutes + ":" + seconds;
                                $('.h1-3').text(currentDate)
                            }, 1000)
    
                            // 三级联动城市选择
                            $("#city-picker3").on("cp:updated", function () {
                                var citypicker = $(this).data("citypicker");
                                var code = citypicker.getCode("district") || citypicker.getCode("city") || citypicker.getCode("province");
                                _this.cityone = $('.title').text()
                                $("#city-picker3").val(_this.cityone);
                                var aass = $('.title').find('span')                        
                                if (aass.length == 3) {
                                    $.ajax({
                                        type: 'get',
                                        url: 'display/getLevel?city=' + _this.cityone,
                                        dataType: 'json',
                                        success: function (res) {                                    
                                            if (res == [] || res == '') {
                                                _this.namecity = ''
                                                _this.namegc = ''
                                                _this.numonne = ''
                                                _this.numtwoww = ''
                                                $('#my-type').html(' ');
                                                $('#my-type').attr('title','请选择')
                                                $('#my-type').selectpicker('refresh');
                                                
                                            } else {
                                                _this.namecity = res
                                                _this.namegc = _this.namecity[0].point
                                                _this.numonne = _this.namecity[0].item_name
                                                if (_this.namegc == [] || _this.namegc == '') {
                                                    _this.numtwoww = ''
                                                    $('#my-type').html(' ');
                                                } else {
                                                    _this.numtwoww = _this.namegc[0].point_code
                                                    var item_id = res[0].point[0].item_id
                                                    var model = res[0].point[0].model
                                                    var id = res[0].point[0].id
                                                    var obj = {
                                                        'item_id': item_id,
                                                        'model': model,
                                                        'point_id': id,
                                                    }
    
    
                                                    $.ajax({
                                                        type: "get",
                                                        url: "display/getModel?mon_type_id="+res[0].point[0].mon_type_id,                            
                                                        dataType: 'json',
                                                        success: function (re) {
                                                            _this.unundd = re.data
                                                            var str = '';                                                      
                                                            if (re.code == 200) {
                                                                $.each(re.data, function (i, value) {
                                                                    str += '<option value="' + i + '">' + value + '</option>';
                                                                });
                                                            } else {
                                                                console.log('数据有误')
                                                            }
                                                            $('#my-type').html(str);                              
                                                            $('#my-type').selectpicker('refresh');                                                                                                             
                                                            _this.point_id = id
                                                            _this.item_iid = item_id
                                                            _this.get_chart_data(_this.item_iid, _this.point_id);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    })
                                } else {
                                    return
                                }
                            });
    
    
                            // 切换类型
                            $('#my-type option:nth-child(2)').prop('selected', 'selected');
                            $(document).on('change', '#my-type', function () {
                                Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                _this.get_chart_data(_this.item_iid, _this.point_id);                     
                            });
                            // 点击设置确认
                            $(document).on('click', '.set-data', set_chart_data);
                            // 点击重置
                            $(document).on('click', '#re-echart', function () {
                                Highcharts.chart('line-chart',  _this.options);
                            });
                             // 点击搜索确认
                            $(document).on('click', '.get-data', function () {
                                Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                _this.get_chart_data(_this.item_iid, _this.point_id);
                            });
    
    
    
    
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
                            _this.options = {
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
                            function  set_chart_data() {
    
                                var min = $('#y_min').val();
                                var max = $('#y_max').val();
                                min = $.trim(min, '');
                                max = $.trim(max, '');
                                _this.options.yAxis.min = min;
                                _this.options.yAxis.max = max;
                                if (min === '') {
                                    delete  _this.options.yAxis.min;
                                }
                                if (max === '') {
                                    delete  _this.options.yAxis.max;
                                }
                                Highcharts.chart('line-chart',  _this.options);
                            }
    
    
    
    
    
    
    
    
    
                        });
                    },
    
                    methods: {
                        // 高德地图
                        initMaps(centers, nike, dengji) {
                            let that = this;
                            that.MAps = new AMap.Map("container", {
                                resizeEnable: true,
                                viewMode: '3D',
                                center: centers,
                                layers: nike,
                                zoom: dengji
                            });
                       
                         
                            // that.MAps.plugin(["AMap.ToolBar", "AMap.Autocomplete", "AMap.PlaceSearch"], function() {
                            //     toolBar = new AMap.ToolBar({
                            //     liteStyle: true,
                            //     position: 'RT',
                            //     offset: new AMap.Pixel(5, 27),
                            //     });
                            //     that.MAps.addControl(toolBar);
                                
                            //     var auto = new AMap.Autocomplete({
                            //     input: "tipinput"
                            //     });
                                
                            //     var placeSearch = new AMap.PlaceSearch({
                            //     map: that.MAps
                            //     });
                            //     AMap.event.addListener(auto, "select", select2);
                                
                            //     function select2(e) {
                            //     placeSearch.setCity(e.poi.adcode);
                            //     placeSearch.search(e.poi.name); //关键字查询查询
                            //     }
                            //     });
                                
    
                           
                            // var autoOptions = {
                            //     input: "tipinput"
                            // };
                            // var auto = new AMap.Autocomplete(autoOptions);
                            // var placeSearch = new AMap.PlaceSearch({
                            //     map: that.MAps
                            // }); 
                            // AMap.event.addListener(auto, "select", select);
                            // function select(e) {
                            //     placeSearch.setCity(e.poi.adcode);
                            //     placeSearch.search(e.poi.name); 
                            // }
                          
                            
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
                          
                            // var auto = new AMap.Autocomplete(autoOptions);
                            // var placeSearch = new AMap.PlaceSearch({
                            //     map: that.MAps
                            // });
                            // AMap.event.addListener(auto, "select", select);
                            // function select(e) {
                            //     placeSearch.setCity(e.poi.adcode);
                            //     placeSearch.search(e.poi.name);
                            // }
                            // var style = [{
                            //     url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIzNzM0MTVBNUVGQjExRUM4QUU5RTgzODE1NUFGOTdCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjIzNzM0MTVCNUVGQjExRUM4QUU5RTgzODE1NUFGOTdCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjM3MzQxNTg1RUZCMTFFQzhBRTlFODM4MTU1QUY5N0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjM3MzQxNTk1RUZCMTFFQzhBRTlFODM4MTU1QUY5N0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5GJ7jvAAACmklEQVR42uyaT0hUURjFv5lMDDJdJIxUJLSJVooRglEkgSBEGrYNWkS1KYmoNkG6MYgShMiFm1ahC7Ug1IVEkWGbohbt+v/PEolq0WALO4f5HkzDu47PufPmXvHAj9nMvHfO3D/vu/fdhNx5KRZUAfaDZrAdbAFb9ZP6BD4r78E0eAjShd64rIDfbgNHQSvYpyFM2qlkK60hJsGwhousxApaYDO4DE6BcrGjP6AfXAdzUX6YjPDdjaAbvAVnLJqnNoCL4DW4AipttwCbfzSkGxRLr8Ah8MZGCxwET2M0T+3Se+4tNAD7+QTYJPGLY20KHFtpAJq/BdZJ6cRxdlu9RArQrLOCK+o3daekYX7ngF3vUAB6GVFvSwZgX78HasQ90dNdnXKNAc6BenFXDfq8CA2QAl3ivs6C6rAAl0CVBwGq1et/AfjvnxR/xFKmNjtAe55q0jVxIB/ODeCb2oMAnDoPeBiAnssZoM1yaRxnmdGSjLnKtK0mBqjzOEDdqgiQ8jhAalUE8FoMMOux/9m1AGsBLASY8TjADAOMgwUPzdPzfQb4CR54GICefwfPgTEPA4xlL2i4lbLokfnF3ABfQI9HAXqC2TO7lOgD3zww/x3cyN2VEB3MVz0I0At+hQWgboJHDpt/rB7FFOCvZF7cfXDQ/EdwRD0aAwR9rCP3iyUWXwJyH2gurJwO0zPJ7H65ouPguWk9YNIAOF3iMoP3PgGGllrQSJ4Q3ECaL4H5r5J5+z+Yb0WWT0/AblMTFkkvQONyKuXlronfgSZwHvwoonFe+wLYoy0gtgIE/ZFHAXboU3vB8izTq9e+FuXaiQJOq/CFW6dkDnuwr0bdnk/rQ3NSB2lshz3CFHbcJjhyI2ouOHJj9bjNPwEGAEEBgAy8kH4eAAAAAElFTkSuQmCC',
                            //     anchor: new AMap.Pixel(6, 6),
                            //     size: new AMap.Size(11, 11)
                            // }, {
                            //     url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQwREU0NkI3NUVGQjExRUM5OTI2QjQ2ODI1NzI5M0M5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjQwREU0NkI4NUVGQjExRUM5OTI2QjQ2ODI1NzI5M0M5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDBERTQ2QjU1RUZCMTFFQzk5MjZCNDY4MjU3MjkzQzkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDBERTQ2QjY1RUZCMTFFQzk5MjZCNDY4MjU3MjkzQzkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4DE899AAACnUlEQVR42uyazUtUURiHX8cPFExdJIyoJLkRV4URgpIkgeBGk9wGLcTaaEioG03dKIgGQtTCjUtb+AVRQhJFykSg+AdI9mWWhJQLB13Y72XeC+Nwj+OdOTNzjviDh9nM3Ps+c88995xzT5r/zSRpSDaoAzXgEigGJfLJ+Q5+CF/AMngHgvGeOCOO35aCVtAAboiEKhVCeIIisQheiJznpMVwBS6CPnAfZJGe7IMJMAZ2vPzQ5+G7uWAQfAYdGovn5IAesAEGwAXdAnz5P4F+EUlUuPDHIAAu6xK4BT66tOFEplLOWRuvALfz1yCPkh++15bA3VgFuPhnIJ1SF77PpqQWTwI10iuYkglVc/Ip+vdZkGmQANcyI7WdKMBtfQEUknnhmualy1UKdIErZG6uyvPCVcAPHpL56QQFbgK9IN8CgQKp9ZgA//vtZE94KFMULtAcZTRpWvhGbooUsC3NjgB3nTctFOCas1igUfPQOJnDjHpfkkeZulPNAmUWC5SdCQG/xQL+MyFgdVhg2+L6t88FzgU0CAQsFgiwwCtwYGHxXPNLFvgL3loowDXvOc+BOQsF5sInNLyUcmRR8UeRAltgyCKBIaf3DB9KPAG/LCj+NxiPXJUguZlHLBAYBv/cBDhPwXuDi/8gNZJK4JBCL+6+Glj8N9AiNSoFnDZ2O/KLKQ6/BOR1oB234bRbVim0+mVK7oE11XxAlefgQYqHGXzuNjB90oSGokjwAtKfFBT/k0Jv/yejzciiZQVcU13CBGUdVJ1mpHzaOfEmqAaPwG4CC+djd4PrcgVIl4DTHnkrQLk8tQ809zLDcuxRL8fOiPFf6hKJOxTa7MFt1evyfFAemotykyZts4db3LbbOFtuSIpzttxo3W7zX4ABAMdJfslbhUXjAAAAAElFTkSuQmCC',
                            //     anchor: new AMap.Pixel(4, 4),
                            //     size: new AMap.Size(7, 7)
                            // }, {
                            //     url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ4NDg0QjQ2NUVGQjExRUNCQUNDQjgwMERBRUQ4MzBEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ4NDg0QjQ3NUVGQjExRUNCQUNDQjgwMERBRUQ4MzBEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDg0ODRCNDQ1RUZCMTFFQ0JBQ0NCODAwREFFRDgzMEQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDg0ODRCNDU1RUZCMTFFQ0JBQ0NCODAwREFFRDgzMEQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6CI/ngAAACpklEQVR42uyazUtUURjG3xlNCkxdVEyUJOUipEVRhGQURRC0yYK2QYuwNhUR2qYvNwZRgdDHoo3LWuQURLWoSCxGgsI/IOw7TSKyRWILex7mvTAO9zjemXNnzhEf+DGbmXvf39xzzz3n3JPYsG2vWMhisBO0gTVgFVitn8wX8FX5CF6Bl2Cy1BNXl/DbRnAI8B/YoRKmrFdyM6kST8E9lYucRBFXYBk4B46BGrGTv6AXXAXjUX6YjPDdWnAJjIATFotnloAu8B5cBEttC/DyvwHnVSSusPALIAPW2hLYA4ZC2nCcadFzbi9VgO38CaiT8of32jNwuFgBFn8LVEnlwvusT2uJJNCmvYIr6TU1p6Shf+8HixwSYC33tbZZBdjWH4Ll4l5Y0wPtco0Cp8FGcTeb9HkRKpACp8T9nAQNYQJnQb0HAg1a6wwB/vsd4k84lFmZK9BeYDTpWngj788X8C3tgQC7zl0eCrDmGgrsszw0LucwY3eyzKNM22mlQJPHAk3zQiDlsUBqXgh4HQqMelz/6ILAgoAFgYzHAhkKPAZTHhbPmh9R4Dd44aEAa/4TPAfSHgqkcyc0XEqZ9qj46XyBb6DbI4HuoPfMHUpcB2MeFP8DXMtflRC9mS97INADJsIEmBtgwOHiB7VGMQn8k+yLu08OFv8ZHNQajQJBGzuQ/8UKhy8BuQ40HjacDstbya5+uZIj4J1pPmDKbXC8wsMMnvsouDvbhEYKSHAB6WcFiv8u2bf/dwrNyArlNdhiuoQxZRhsnstIea5z4g+gFZwBv2IsnMfuBFv1CogtgaA9civAOn1qT1nuZXr02FeiHLtqRWNz1JNxkwY3aPRp38xwZ0p1Ecd5Dm5K9t1EWorYvZKIcbtNsOWG4U6UYMuN1e02/wUYALcwfbPOKF7ZAAAAAElFTkSuQmCC',
                            //     anchor: new AMap.Pixel(3, 3),
                            //     size: new AMap.Size(5, 5)
                            // }
                            // ];
                            // var mass = new AMap.MassMarks(citys, {
                            //     opacity: 0.8,
                            //     zIndex: 111,
                            //     cursor: 'pointer',
                            //     style: style
                            // });
                            // var marker = new AMap.Marker({content: ' ', map: that.MAps});
                            // mass.on('mouseover', function (e) {
                            //     marker.setPosition(e.data.lnglat);
                            //     marker.setLabel({content: e.data.name})
                            // });
                            // mass.setMap(that.MAps);
                            // var cluster, markers = [];
                            // for (var i = 0; i < points.length; i += 1) {
                            //     markers.push(new AMap.Marker({
                            //         position: points[i]['lnglat'],
                            //         content: '<div style="background-color: hsla(180, 100%, 50%, 0.7); height: 24px; width: 24px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;"></div>',
                            //         offset: new AMap.Pixel(-15, -15)
                            //     }))
                            // }
                            // var count = markers.length;
                            // var _renderClusterMarker = function (context) {
                            //     var factor = Math.pow(context.count / count, 1 / 18);
                            //     var div = document.createElement('div');
                            //     var Hue = 180 - factor * 180;
                            //     var bgColor = 'hsla(' + Hue + ',100%,50%,0.7)';
                            //     var fontColor = 'hsla(' + Hue + ',100%,20%,1)';
                            //     var borderColor = 'hsla(' + Hue + ',100%,40%,1)';
                            //     var shadowColor = 'hsla(' + Hue + ',100%,50%,1)';
                            //     div.style.backgroundColor = bgColor;
                            //     var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
                            //     div.style.width = div.style.height = size + 'px';
                            //     div.style.border = 'solid 1px ' + borderColor;
                            //     div.style.borderRadius = size / 2 + 'px';
                            //     div.style.boxShadow = '0 0 1px ' + shadowColor;
                            //     div.innerHTML = context.count;
                            //     div.style.lineHeight = size + 'px';
                            //     div.style.color = fontColor;
                            //     div.style.fontSize = '14px';
                            //     div.style.textAlign = 'center';
                            //     context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
                            //     context.marker.setContent(div)
                            // };
                            // addCluster(2);
                            // function addCluster(tag) {
                            //     if (cluster) {
                            //         cluster.setMap(null);
                            //     }
                            //     if (tag == 2) {//完全自定义
                            //         cluster = new AMap.MarkerClusterer(that.MAps, markers, {
                            //             gridSize: 80,
                            //             renderClusterMarker: _renderClusterMarker
                            //         });
                            //     } else if (tag == 1) {//自定义图标
                            //         var sts = [{
                            //             url: "https://a.amap.com/jsapi_demos/static/images/blue.png",
                            //             size: new AMap.Size(32, 32),
                            //             offset: new AMap.Pixel(-16, -16)
                            //         }, {
                            //             url: "https://a.amap.com/jsapi_demos/static/images/green.png",
                            //             size: new AMap.Size(32, 32),
                            //             offset: new AMap.Pixel(-16, -16)
                            //         }, {
                            //             url: "https://a.amap.com/jsapi_demos/static/images/orange.png",
                            //             size: new AMap.Size(36, 36),
                            //             offset: new AMap.Pixel(-18, -18)
                            //         }, {
                            //             url: "https://a.amap.com/jsapi_demos/static/images/red.png",
                            //             size: new AMap.Size(48, 48),
                            //             offset: new AMap.Pixel(-24, -24)
                            //         }, {
                            //             url: "https://a.amap.com/jsapi_demos/static/images/darkRed.png",
                            //             size: new AMap.Size(48, 48),
                            //             offset: new AMap.Pixel(-24, -24)
                            //         }];
                            //         cluster = new AMap.MarkerClusterer(that.MAps, markers, {
                            //             styles: sts,
                            //             gridSize: 80
                            //         });
                            //     } else {//默认样式
                            //         cluster = new AMap.MarkerClusterer(that.MAps, markers, {gridSize: 80});
                            //     }
                            // }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
                        },
                        destroyMap() {
                            this.MAps.destroy();
                        },
    
    
                        dianyuandian(data) {
                            let _this = this;
    
    
                            for (var i = 0; i < data.big.length; i++) {
                                data.big[i].color = '#f8983a'
                                data.big[i].type = 'circle'
                            }
                            var leg;
                            var lnglats = []
                            for (var i = 0; i < data.small.length; i++) {
                                var l = data.small[i].lng
                                var w = data.small[i].lat
                                leg = [l, w]
                                lnglats.push(leg)
                            }
                            console.log(lnglats)
                            var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
    
                            for (var i = 0; i < lnglats.length; i++) {
                                var marker = new AMap.Marker({
                                    position: lnglats[i],
                                    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGpJREFUOE/NkrENgDAMBO8bGAQmYhiGYBgmIoNAYxSJdAYFTBHX/vefbREsBfU0bmBmnaTjCdNFMLMJWIABSMAsafWM7gy2S1w0SdJYZZBjA7vT3Hs4/yfIk8M7KPE/X+HNdzb+iTUoYYQTS3wjES/GKQ4AAAAASUVORK5CYII=",
                                    map: _this.MAps
                                });
                                // 测点编号、设备名称、工程项目、所在位置、经纬度、有效日期。
    
                                var htmlone = "<div>测点编号：" + data.small[i].point_code + "</div><div>设备名称：" + data.small[i].sensor_name + "</div><div>工程项目：" + data.small[i].name + "</div><div>所在城市：" + data.small[i].city + "<div>具体位置：" + data.small[i].address + "</div>" + "</div><div>经纬度：" + data.small[i].lng + "," + data.small[i].lat + "</div> <div>有效日期：" + data.small[i].finish_date + "</div>"
                                marker.content = htmlone;
                                marker.on('click', markerClick);   //为点标记绑定点击事件，
                                marker.emit('click', { target: marker });
    
                            }
                            function markerClick(e) {
                                infoWindow.setContent(e.target.content);
                                infoWindow.open(_this.MAps, e.target.getPosition());
    
    
                            }
                            
                            // _this.MAps.setFitView();
                            _this.mark = new FlashMarker(_this.MAps, data.big);
    
    
    
                        },
    
                        get_chart_data(item_id,points) {
                            let _this = this;                    
                            var time = $('#my-time').val();                               
                            var model = $('#my-type').val();
    
                           var title =   _this.unundd[model]
                           
                           
                           
                          
                            $.ajax({
                                type: "POST",
                                url: "engineering/data/getEchart",
                                data: { 'item_id': item_id, 'points': points, 'time': time, 'model': model },
                                // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                dataType: 'json',
                                success: function (re) {
                                    if (re.code == 1) {
                                        console.log(re, '123213213111111')
                                        Toastr.success(re.msg);
                                        _this.options.title.text = title;
                                        _this.options.series = re.data;
                                        _this.options.colors = ['#18BC9C'];
                                        Highcharts.chart('line-chart',  _this.options);
                                    } else {
                                        _this.options.series = [];
                                        Highcharts.chart('line-chart',  _this.options);
                                        // Toastr.error(re.msg);
                                    }
                                }
                            });
                        },
    
    
    
    
    
    
                        mapEchart(urrl, mingzi) {
                            let _this = this
                            $.get(urrl, function (geoJson) {
                                Echarts.registerMap(mingzi, { geoJSON: geoJson });
                                var mapchart = Echarts.init(document.getElementById('china_map'));
                                mapchart.setOption({
                                    geo: {
                                        map: 'china',
                                        roam: true,
                                        scaleLimit: { //滚轮缩放的极限控制
                                            min: 1.2,
                                            max: 15
                                        },
    
                                        label: {
                                            emphasis: {
                                                show: true,
                                                color: '#fff'
                                            },
                                            normal: {
                                                show: true, //关闭省份名展示
                                                fontSize: "12",
                                                color: "#016653"
                                            },
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
    
                                    series: [
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
                                    var type = Sdata.componentSubType;
                                    if (type == 'map') {
                                        // 获取点击的省份名字和经纬度
                                        var name = Sdata.name
                                        var jw = mapchart.convertFromPixel('geo', [Sdata.event.offsetX, Sdata.event.offsetY])
                                        _this.jingwei = jw
                                        _this.destroyMap()
                                        $('#container').css({
                                            width: '100%',
                                            height: '100%',
                                        })
                                        _this.dengone = 12
                                        if (_this.index250 == 0) {
                                            _this.initMaps(_this.jingwei, _this.nik0, _this.dengone);
                                            _this.MAps.setMapStyle('amap://styles/darkblue');
                                        } else if (_this.index250 == 1) {
                                            _this.initMaps(_this.jingwei, _this.nik1, _this.dengone);
                                        } else {
                                            _this.initMaps(_this.jingwei, _this.nik2, _this.dengone);
                                        }
    
    
                                        $('.back_btn').show();
    
    
                                        var provinces = ['shanghai', 'hebei', 'shanxi', 'neimenggu', 'liaoning', 'jilin', 'heilongjiang', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong', 'henan', 'hubei', 'hunan', 'guangdong', 'guangxi', 'hainan', 'sichuan', 'guizhou', 'yunnan', 'xizang', 'shanxi1', 'gansu', 'qinghai', 'ningxia', 'xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen', 'taiwan'];
    
                                        var provincesText = ['上海', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '北京', '天津', '重庆', '香港', '澳门', '台湾'];
    
                                        for (var i = 0; i < provincesText.length; i++) {
                                            if (name == provincesText[i]) {
                                                // console.log(provinces[i])
    
                                                Echarts.init(document.getElementById('china_map')).dispose();
    
                                                _this.creatProvince(provinces[i]);
    
                                                // 获取省份名字拼音然后渲染地图
    
                                            }
                                        }
                                        _this.dianyuandian(_this.dateone)
    
                                    } else {
    
                                        return
                                       
    
    
                                       
                                    }
                                })
                            });
    
                        },
                        creatProvince(name) {
                            let _this = this;
                            if (name == '') {
                                return false;
                            }
                            var mapchart = Echarts.init(document.getElementById('china_map'));
                            var seriesdata = [
                                {
                                    type: 'map',
                                    map: name,
                                    geoIndex: 0,
                                    aspectScale: 0.75,
                                    tooltip: {
                                        show: false
                                    },
    
                                }
                            ];
                            var option = {
                                series: seriesdata,
                                geo: {
                                    map: name,
                                    roam: true,
                                    scaleLimit: { //滚轮缩放的极限控制
                                        min: 1.2,
                                        max: 15
                                    },
    
                                    label: {
                                        emphasis: {
                                            show: true,
                                            color: '#fff'
                                        },
                                        normal: {
                                            show: true, //关闭省份名展示
                                            fontSize: "12",
                                            color: "#016653"
                                        },
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
    
                            };
                            $.get('/assets/js/json/' + name + '.json', function (gdMap) {
                                // console.log(name,gdMap)
                                Echarts.registerMap(name, gdMap);
                                mapchart.setOption(option, true);
    
                            });
                            mapchart.on('click', function (Sdata,) {
                                var name = Sdata.name
                                var jw = mapchart.convertFromPixel('geo', [Sdata.event.offsetX, Sdata.event.offsetY])
                                _this.jingwei = jw
                                _this.destroyMap()
                                $('#container').css({
                                    width: '100%',
                                    height: '100%',
                                })
                                _this.dengone = 11
                                if (_this.index250 == 0) {
                                    _this.initMaps(_this.jingwei, _this.nik0, _this.dengone);
                                    _this.MAps.setMapStyle('amap://styles/darkblue');
                                } else if (_this.index250 == 1) {
                                    _this.initMaps(_this.jingwei, _this.nik1, _this.dengone);
                                } else {
                                    _this.initMaps(_this.jingwei, _this.nik2, _this.dengone);
                                }
                                _this.dianyuandian(_this.dateone)
    
                            })
    
    
    
                        },
                        yigecida() {
                            if (this.idsaa != 0) {
                                $('#containeone').text('全屏')
                                this.exitFullscreen()
                                this.idsaa = 0
                                Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例                                            
                                this.get_chart_data(this.item_iid,this.point_id)
                            } else {
                                this.launchIntoFullscreen()
                                $('#containeone').text('退出')
                                this.idsaa = 1
                                Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例                      
                                this.get_chart_data(this.item_iid,this.point_id)
                            }
    
    
    
                        },
    
                        // 全屏
                        launchIntoFullscreen() {
                            var element = document.getElementById('main');
                            if (element.requestFullscreen) {
                                element.requestFullscreen();
                            }
                            else if (element.mozRequestFullScreen) {
                                element.mozRequestFullScreen();
                            }
                            else if (element.webkitRequestFullscreen) {
                                element.webkitRequestFullscreen();
                            }
                            else if (element.msRequestFullscreen) {
                                element.msRequestFullscreen();
                            }
                        },
                        // 退出全屏
                        exitFullscreen() {
                            if (document.exitFullscreen) {
                                document.exitFullscreen();
                            } else if (document.mozCancelFullScreen) {
                                document.mozCancelFullScreen();
                            } else if (document.webkitExitFullscreen) {
                                document.webkitExitFullscreen();
                            }
                        },
    
                        echartsthree(dom, data) {
                            var chartDom = document.getElementById(dom);
                            if (chartDom) {
                                var myChart = Echarts.init(chartDom);
                                var option;
    
                                option = {
                                    tooltip: {
                                        trigger: 'axis',
                                        position: function (pt) {
                                            return [pt[0], '10%'];
                                        }
                                    },
                                    title: {
                                        left: 'center',
                                        text: '测点：' + data.name,
                                        textStyle: {
                                            color: '#fff'
                                        }
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: false,
                                        data: data.data.time,
                                        axisLabel: {
                                            color: '#fff'
                                        }
    
                                    },
                                    yAxis: {
                                        type: 'value',
                                        boundaryGap: [0, '100%'],
                                        axisLabel: {
                                            color: '#fff'
                                        }
                                    },
                                    dataZoom: [
                                        {
                                            type: 'inside',
                                            start: 0,
                                            end: 10
                                        },
                                        {
                                            start: 0,
                                            end: 10
                                        }
                                    ],
                                    series: [
                                        {
                                            name: ' ',
                                            type: 'line',
                                            symbol: 'none',
                                            sampling: 'lttb',
                                            itemStyle: {
                                                color: '#18bc9c'
                                            },
    
                                            data: data.data.val
                                        }
                                    ]
                                };
    
                                myChart.setOption(option);
    
                            }
    
    
                        },
    
    
                    },
    
                });
    
    
    
    
                
                Controller.api.bindevent();
                Form.events.datetimepicker($("form"));
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
                $('#line-chart1').height(h - 80);
                $('#line-chart2').height(h - 80);
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
    