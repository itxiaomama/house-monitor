// define(['vue','jquery','bootstrap', 'backend', 'table', 'form', 'upload', 'bootstrap-daterangepicker'], function (Vue,$, undefined, Backend, Table, Form, Upload,) {
// define(['vue', 'jquery', 'bootstrap', 'backend', 'table', 'form', 'addtabs', 'echarts', 'china', 'layer', 'looptip', 'citypicker', 'base64', 'template', 'bootstrap-daterangepicker'], function (Vue, $, undefined, Backend, Table, Form, Datatable, Echarts, china, bootstrap, Layer, looptip, citypicker, Template) {
define(['vue', 'jquery', 'bootstrap', 'backend', 'table', 'form', 'addtabs', 'echarts', 'citypicker', 'china', 'layer', 'looptip', 'base64', 'template', 'bootstrap-daterangepicker'], function (Vue, $, undefined, Backend, Table, Form, Datatable, Echarts, china, citypicker, bootstrap, Layer, looptip, Template) {


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

                    myChart: null,
                    geoJSON: [],
                    level: 0,
                    datetwo: [],
                    cityName: '萧山',
                    engineering: {},
                    project: [],
                    image: [],
                    checked: false,
                    scale: null,
                    toolbar: null,
                    overView: null,
                    controlBar: null,
                    alarm: [],
                    alarm_count: 0,
                    mytimeValue: [new Date(2022, 12, 01, 00, 00), new Date(2022, 10, 31, 24, 00)],
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
                    arryone: [],
                    arrytwo: [],
                    arrthree: [],
                    arrthree1: '',
                    arrthree2: '',
                    arrthree3: '',
                    arrthree4: '',
                    arrfor: [],
                    dateThree: [],
                    numonne: '',
                    numtwoww: '',
                    numthree: '',
                    namecity: [],
                    namegc: [],
                    allcity: '',
                    dateone: '',
                    cityone: '浙江省/杭州市/萧山区/衙前镇',
                    tq1: '',
                    tq2: '',
                    options: '',
                    curIndex: 0,
                    xjlist: [
                        {
                            title: '未完成',
                            contList1: []
                        },
                        {
                            title: '已完成',
                            contList2: []
                        }],
                    xjchart: {},
                    activeName: 'first',
                    mytypeValue: 'data1',
                    mytypeOption: [],
                    monitorData: [],
                    townshipList: [],
                    clicktwo: false,
                    clickone: true,
                    selectData: [],
                    tab: 0,
                    tab1: 0,
                    defaultType: 1,
                    Mapmode: 0,
                    isVisible: false,
                    projectId: '',
                    map: null,
                    polygons: [],
                    district: null,
                    menuIndex: 0,
                    navList: ['省份', '城市', '区县', '乡镇'],
                    provinces: [],
                    count: "",
                    citys: [],
                    districts: [],
                    Townships: [],
                    active4: -1,
                    active: [],
                    active2: -1,
                    active3: -1,
                    active1: -1,

                    cityPicker: '浙江省/杭州市/萧山区/衙前镇',
                    selectProvince: '',
                    selectCity: '',
                    selectDistrict: '',
                    selectTownship: '',
                    selectProvince1: '',
                    selectCity1: '',
                    selectDistrict1: '',
                    selectTownship1: '',
                    select2Arr: '',
                    tabTitle:[],
          

                    box4Context:[],
                    total:0,
                    tabSelectIndex:0,
                    current_page: 1, //当前页 
                    pages:0, //总页数 
                    changePage:'',//跳转页 
                    nowIndex:0, 
                    pageSize:13,
                    ids:'',
                    box4Name:'',
                    is_show:false,
            
               
              
               
 
                },
                created() {
                    this.IntMap();
                    // this.page=Math.ceil(this.total/this.pageSize)
                    // console.log(this.page)
                },
                computed: {
                    show:function(){ 
                      
                                  return this.pages && this.pages !=1 
                                  
                              }, 
                             efont: function() { 
                               if (this.pages <= 7) return false; 
                              return this.current_page > 5 
                             }, 
                             indexs: function() { 
                           
                          
                                var left = 1, 
                                 right = this.pages, 
                                 ar = []; 
                                if (this.pages >= 7) { 
                                 if (this.current_page > 5 && this.current_page < this.pages - 4) { 
                                    left = Number(this.current_page) - 3; 
                                    right = Number(this.current_page) + 3; 
                                 } else { 
                                   if (this.current_page <= 5) { 
                                     left = 1; 
                                      right = 7; 
                                  } else { 
                                     right = this.pages; 
                          
                                    left = this.pages - 6; 
                                   } 
                                  } 
                               } 
                              while (left <= right) { 
                                 ar.push(left); 
                                 left++; 
                                } 
                               return ar; 
                              }, 
                    },
       
               
                mounted() {
                  
                    var that = this
                    that.tabSelect();
                    that.IntMap();
                    that.$nextTick(() => {
                        that.getchart()
                    })

                    that.province()
                    // this.getchart()
                    // this.getdata()
        
                
                    
                    $("#administrativeTK").hover(function () {
                        $('#administrativeTK').addClass('active')
                        $('.administrative').css('display', 'block')


                    }, function () {
                        $('#administrativeTK').removeClass('active')
                        $('.administrative').css('display', 'none')
                    })
                    $("#townlistTK").hover(function () {
                        $('.TownshipList').css('display', 'block')
                        $('.administrative').css('display', 'none')

                    }, function () {
                        $('.TownshipList').css('display', 'none')
                    })
                    $("#alarmTK").hover(function () {
                        $('#main2').css('display', 'block')
                        $('.administrative').css('display', 'none')

                    }, function () {
                        $('#main2').css('display', 'none')
                    })
                    $('div.daterangepicker>.dropdown-menu').hover(function () {
                        $('.tkleft').css('display', 'block')

                        $('.administrative').css('display', 'none')
                    })

                    $("#MeasuringpointTK").hover(function () {

                        $('.tkleft').css('display', 'block')

                        $('.administrative').css('display', 'none')

                    }, function () {
                        $('.tkleft').css('display', 'none')
                    })
                    // $(".daterangepicker").hover(function () {
                    //     $('.tkleft').css('display', 'block')
                    //     $('.administrative').css('display', 'none')

                    // }, function () {
                    //     $('.tkleft').css('display', 'none')
                    // })
                    $("#xjTK").hover(function () {
                        $('.ssxj').css('display', 'block')
                        $('.administrative').css('display', 'none')

                    }, function () {
                        $('.ssxj').css('display', 'none')
                    })
                    $("#typhoonTK").hover(function () {
                        $('.typhoon').css('display', 'block')
                        $('.administrative').css('display', 'none')

                    }, function () {
                        $('.typhoon').css('display', 'none')
                    })
                    $(document).ready(function () {
                        $('input[name="record_time"]').daterangepicker({
                            parentEl: $('.tkleft')
                        });
                    });
                    //请求报警、监测类型数据
                    $.ajax({
                        type: 'get',
                        url: 'display/getEngineTypeList',
                        dataType: 'json',
                        success: function (res) {
                            if (res.code == 1) {


                                that.alarm_count = res.alarm.count
                                that.alarm = res.alarm.data
                                that.monitor = res.type

                                var num = that.monitor.length
                                var nums = num / 2
                                for (var i = 0; i < that.monitor.length; i++) {
                                    var subStr = new RegExp('安全');
                                    var subStrtwo = new RegExp('监测');
                                    that.monitor[i].mon_item_name = that.monitor[i].mon_item_name.replace(subStr, "");
                                    that.monitor[i].mon_item_name = that.monitor[i].mon_item_name.replace(subStrtwo, "");

                                    if (i < nums) {
                                        that.arryone.push(that.monitor[i])
                                    } else {
                                        that.arrytwo.push(that.monitor[i])
                                    }
                                }
                                // console.log(that.arryone)
                                // console.log(that.arrytwo)

                            } else {
                                console.log('请求失败')
                            }
                        }
                    })
                    $.ajax({
                        type: 'get',
                        url: '//public/JMRIUsnmLz.php/show/project/index',
                        data: {
                            'addtabs': 1,
                            'sort': 'id',
                            'order': 'desc',
                            'offset': 0,
                            'limit': 999
                        },
                        dataType: 'json',
                        success: function (res) {
                            // console.log('实时监测数据', res)
                            that.monitorData = res.rows

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

                                    that.arrthree.push(obj)


                                } else {
                                    var obj1 = {
                                        name: '',
                                        num: ''
                                    }
                                    obj1.name = res.yAxis[i]
                                    obj1.num = res.series[i]
                                    that.arrfor.push(obj1)

                                }


                            }

                            that.arrthree1 = that.arrthree[0].num
                            that.arrthree2 = that.arrthree[1].num
                            that.arrthree3 = that.arrthree[2].num
                            that.arrthree4 = that.arrthree[3].num
                        }
                    })
                    //请求省份数据
                    $.ajax({
                        type: 'get',
                        url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                        dataType: 'json',
                        success: function (res) {
                            that.provinces = res.data
                            // that.provincesH = res.data[1]
                            // that.provincesL = res.data[2]
                            // that.provincesT = res.data[3]
                        }
                    })



                    setInterval(function () {
                        $.ajax({
                            type: 'get',
                            url: 'board/getAlarmPop',
                            dataType: 'json',
                            success: function (res) {

                                for (var i = 0; i < res.data.length; i++) {
                                    if (res.data[i].alarm_status == 1) {
                                        res.data[i].alarm_status = '预警'
                                    } else {
                                        res.data[i].alarm_status = '报警'
                                    }
                                    if (res.data[i].record_status == 0) {
                                        res.data[i].record_status = '未处理'
                                    } else if (res.data[i].record_status == 1) {
                                        res.data[i].record_status = '处理中'
                                    } else if (res.data[i].record_status == 2) {
                                        res.data[i].record_status = '待消警'
                                    } else if (res.data[i].record_status == 3) {
                                        res.data[i].record_status = '已消警'
                                    } else {
                                        res.data[i].record_status = '驳回消警'
                                    }
                                }
                                that.tandata = res.data
                            }
                        })
                        $('.new_tanc').fadeIn()
                    }, 3000000)








                    // 测点曲线图的三级联动
                    $.ajax({
                        type: 'get',
                        url: 'display/getLevel?city=' + that.cityPicker,
                        dataType: 'json',
                        success: function (res) {

                            that.allcity = res
                            that.namecity = res
                            that.numonne = that.namecity[0].item_name
                            that.namegc = that.namecity[0].point
                            that.numtwoww = that.namegc[0].point_code


                            var id = res[0].point[0].id
                            var item_id = res[0].point[0].item_id
                            var model = res[0].point[0].model

                            $.ajax({
                                type: "get",
                                url: "display/getModel?mon_type_id=" + res[0].point[0].mon_type_id,
                                dataType: 'json',
                                success: function (re) {
                                    that.unundd = re.data
                                    var str = '';

                                    if (re.code == 200) {
                                        $.each(re.data, function (i, value) {
                                            // $('#my-type').append('<option value="' + i + '">' + value + '</option>');
                                            that.selectData.push({ 'value': i, 'label': value })
                                        });
                                    } else {
                                        console.log('数据有误')
                                    }



                                    that.point_id = id
                                    that.item_iid = item_id
                                    that.get_chart_data(that.item_iid, that.point_id);
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
                    that.time = year + '年' + getNow(mon) + '月' + getNow(day) + '日' + week


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
                            district: '萧山区',
                            county: '衙前镇'
                        });


                        // $('.ner_shanchu').click(function () {
                        //     $('.new_tanc').fadeOut()
                        // })

                        // $(".img-xuan").mouseenter(function () {
                        //     $('.xuanfu').css('display', 'block')
                        // });
                        // $(".xuanfu").mouseleave(function () {
                        //     $('.xuanfu').css('display', 'none')
                        // });

                        $('.ner_shanchu').click(function () {
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
                            $('.myTab').hide()
                            if (of2 != 0) {
                                $('#didiantwo').css({
                                    'display': 'none',
                                })
                                of2 = 0;
                            } else {
                                $('#didiantwo').css({
                                    'display': 'block',
                                    'min-width': '200px',
                                    'transform-origin': 'center top',
                                    'z-index': '2120',
                                    'position': 'absolute',
                                    'left': '33%',
                                    'top': '19%',
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
                                    'min-width': '100px',
                                    'transform-origin': 'center top',
                                    'z-index': '99999',
                                    'position': 'absolute',

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
                            console.log(num)
                            that.namegc = that.namecity[num].point
                            if (that.namegc == [] || that.namegc == '') {
                                that.numtwoww = ''
                                $('#my-type').html(' ');

                            } else {
                                that.numtwoww = that.namegc[0].point_code
                                var item_id = that.namegc[0].item_id
                                var model = that.namegc[0].model
                                var point_id = that.namegc[0].id
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
                                            // console.log(dat)
                                            Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                            //that.echartsthree('echartthree', dat)
                                            that.point_id = point_id
                                            that.item_iid = item_id
                                            that.get_chart_data(item_id, point_id)

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
                            // console.log(num)
                            var item_id = that.namegc[num].item_id
                            var model = that.namegc[num].model
                            var point_id = that.namegc[num].id

                            var obj = {
                                'item_id': item_id,
                                'model': model,
                                'point_id': point_id,
                            }
                            $.ajax({
                                type: 'get',
                                url: 'display/getModel?mon_type_id=' + that.namegc[num].mon_type_id,
                                dataType: 'json',
                                success: function (res) {
                                    var str = '';
                                    that.unundd = res.data
                                    if (res.code == 200) {

                                        var list = res.data;
                                        $.each(list, function (i, time) {
                                            str += '<option value="' + i + '">' + time + '</option>';
                                        });
                                        $('#my-type').html(str);
                                        $('#my-type').selectpicker('refresh');
                                        Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                                        that.item_iid = item_id
                                        that.point_id = point_id
                                        that.get_chart_data(that.item_iid, that.point_id);

                                    }
                                }
                            })
                            $('#weizhithree').css({
                                'display': 'none',
                            })
                            of3 = 0;



                        })
                        $(window).resize(function () {
                            that.$nextTick(() => {
                                that.options.chart.width = $('#line-chart').width();
                                Highcharts.chart('line-chart', that.options);
                            })
                        });




                        $(".right111").delegate('.back_btn', 'click', function () {
                            console.log('111')
                            $('.back_btn').hide();
                            $('.xuanfu label input').attr("checked", false)
                            $('.xuanfu label .morenint').click()
                            Echarts.init(document.getElementById('china_map')).dispose();
                            that.mapEchart(that.url, that.mingz);
                            that.destroyMap()



                        })
                        $('.xuanfu label input').click(function () {
                            // console.log($(this).val())
                            if ($(this).val() == 0) {
                                that.destroyMap()
                                that.index250 = 0

                                that.MAps.setMapStyle('amap://styles/darkblue');
                            } else if ($(this).val() == 1) {
                                that.destroyMap()

                                that.index250 = 1

                            } else if ($(this).val() == 2) {
                                that.destroyMap()
                                that.index250 = 2

                            } else {
                                return false
                            }
                        })





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
                            $('.tkleft').css('display', 'none')
                            $('#main2').css('display', 'none')
                            $('.xselect').css('display', 'none')
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
                            var that = this
                            var citypicker = $(this).data("citypicker");
                            var code = citypicker.getCode("district") || citypicker.getCode("city") || citypicker.getCode("province") || citypicker.getCode("county");;
                            that.cityone = $('.title').text()
                            console.log($('.title').text())
                            $("#city-picker3").val(that.cityone);
                            var aass = $('.title').find('span')
                            if (aass.length == 3) {
                                console.log(that.cityone)
                                $.ajax({
                                    type: 'get',
                                    url: 'display/getLevel?city=' + that.cityone,
                                    dataType: 'json',
                                    success: function (res) {
                                        if (res == [] || res == '') {
                                            that.namecity = ''
                                            that.namegc = ''
                                            that.numonne = ''
                                            that.numtwoww = ''
                                            $('#my-type').html(' ');
                                            $('#my-type').attr('title', '请选择')
                                            $('#my-type').selectpicker('refresh');

                                        } else {
                                            that.namecity = res
                                            that.namegc = that.namecity[0].point
                                            that.numonne = that.namecity[0].item_name
                                            if (that.namegc == [] || that.namegc == '') {
                                                that.numtwoww = ''
                                                $('#my-type').html(' ');
                                            } else {
                                                that.numtwoww = that.namegc[0].point_code
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
                                                    url: "display/getModel?mon_type_id=" + res[0].point[0].mon_type_id,
                                                    dataType: 'json',
                                                    success: function (re) {
                                                        that.unundd = re.data
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
                                                        that.point_id = id
                                                        that.item_iid = item_id
                                                        that.get_chart_data(that.item_iid, that.point_id);
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
                            that.get_chart_data(that.item_iid, that.point_id);
                        });
                        // 点击设置确认
                        $(document).on('click', '.set-data', set_chart_data);
                        // 点击重置
                        $(document).on('click', '#re-echart', function () {
                            Highcharts.chart('line-chart', this.options);
                        });
                        // 点击搜索确认
                        $(document).on('click', '.get-data', function () {

                            Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                            that.get_chart_data(that.item_iid, that.point_id);
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
                        that.options = {
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
                        function set_chart_data() {

                            var min = $('#y_min').val();
                            var max = $('#y_max').val();
                            min = $.trim(min, '');
                            max = $.trim(max, '');
                            that.options.yAxis.min = min;
                            that.options.yAxis.max = max;
                            if (min === '') {
                                deletethat.options.yAxis.min;
                            }
                            if (max === '') {
                                deletethat.options.yAxis.max;
                            }
                            Highcharts.chart('line-chart', that.options);
                        }









                    });
                },

                methods: {
                    jumpPage: function(id) { 
                              this.current_page = id; 
                              console.log( this.ids)
                              this.tabSelect(this.tabSelectIndex,this.ids)
                           
                             }, 
                    
        
         
                    //直接点击页数事件
                
                    hideSelecttab(index){
                       this.$set(this.monitorData[index],'is_show',false)
                       this.$set(this.monitorData[index],'is_request',false)
                       $('#tq').show()
                    },
                    IntMap() {

                        var that = this

                        var weather = new AMap.Weather();
                        weather.getLive('萧山区', function (err, data) {
                            that.tq1 = data.weather;
                            that.tq2 = '，' + data.temperature + '℃';
                            // console.log(str)

                        })

                        that.map = new AMap.Map("container", {
                            zoom: 12,
                            resizeEnable: true,
                            zooms: [5, 20],
                            // mapStyle:'amap://styles/light',
                            center: [120.270932, 30.187355],
                            showLabel: false //不显示地图文字标记
                            // center:eval('(' + res + ')')[0],

                        });

                        that.trafficLayer = new AMap.TileLayer({
                            zIndex: 10,

                        });




                        that.map.addControl(new AMap.MapType({
                            defaultType: that.defaultType
                        }))

                        that.mapToolBar();
                        // that.mapControlBar();
                        that.mapScale();
                        // that.mapOverView();







                        $.getJSON('/assets/js/json/xiaoshan.json', function (geoJSON) {
                            that.townshipList = []
                            var geojson = new AMap.GeoJSON({
                                geoJSON: geoJSON,
                                // 还可以自定义getMarker和getPolyline

                                getPolygon: function (geojson, lnglats) {

                                    // console.log(geojson, lnglats)
                                    var latarr = []
                                    var lats = []
                                    for (let s = 0; s < geojson.geometry.coordinates[0].length; s++) {

                                        latarr = geojson.geometry.coordinates[0]
                                        // console.log(latarr)
                                    }
                                    var lat = []

                                    lat.push(geojson.properties.centerx, geojson.properties.centery)
                                    that.townshipList.push(geojson.properties.name)


                                    var text = new AMap.Text({
                                        text: geojson.properties.name,
                                        anchor: 'center', // 设置文本标记锚点
                                        // draggable:true,
                                        cursor: 'pointer',
                                        offset: new AMap.Pixel(50, -30),
                                        style: {
                                            'padding': '.5rem 1.25rem',
                                            'margin-bottom': '1rem',
                                            'border-radius': '.25rem',
                                            'background-color': 'rgb(0 229 255 / 0%)',
                                            'border-width': 0,
                                            'text-align': 'center',
                                            'font-size': '18px',
                                            'font-family': '微软雅黑',
                                            'color': '#fff',
                                            'font-weight': '800',
                                        },
                                        position: lat
                                    });
                                    text.setMap(that.map);

                                    that.geoJSON.push(geojson)
                                    // console.log( that.geoJSON)
                                    // 计算面积
                                    var area = AMap.GeometryUtil.ringArea(lnglats[0])
                                    AMap.convertFrom(latarr, 'gps', function (status, result) {
                                        // console.log(result.locations)

                                        var path2 = result.locations;


                                        var polygon = new AMap.Polygon({
                                            path: path2,
                                            fillOpacity: 0.5,// 面积越大透明度越高
                                            strokeColor: 'white',
                                            fillColor: '#798441',
                                            offset: new AMap.Pixel(-20, -20),
                                            fillOpacity: 0.7,
                                            strokeWeight: 1,
                                            extData: {
                                                name: geojson.properties.name,
                                            },
                                            zIndex: 13
                                        });
                                        that.map.add(polygon)
                                        polygon.on('mouseover', (e) => {
                                            polygon.setOptions({
                                                fillOpacity: 0.8, // 改变透明度
                                                fillColor: '#627312' // 改变颜色
                                            });

                                        });
                                        polygon.on('mouseout', (e) => {
                                            polygon.setOptions({
                                                fillOpacity: 0.5, // 改变透明度
                                                fillColor: '#798441' // 改变颜色
                                            });

                                        });
                                        polygon.on('click', (e) => {
                                            console.log(e)
                                            // console.log(e, that, this)
                                            var city = e.target.De.extData.name
                                            console.log(city)
                                            that.map.clearMap();
                                            that.handlePolygon(city)
                                        })

                                        return polygon
                                    })
                                }

                            })


                            geojson.setMap(that.map);
                            // that.addlabel()

                        })
                        //请求巡检数据列表
                        $.ajax({
                            type: 'POST',
                            url: '/public/JMRIUsnmLz.php/disoop/getAreaInspectInfo',
                            dataType: 'json',
                            data: { 'area': '萧山区', 'status': 0 },
                            success: function (res) {
                                that.xjlist.contList1 = res.data.list
                                // console.log(that.xjlist.contList1)

                            }
                        })
                        $.ajax({
                            type: 'POST',
                            url: '/public/JMRIUsnmLz.php/disoop/getAreaInspectInfo',
                            dataType: 'json',
                            data: { 'area': '萧山区', 'status': 1 },
                            success: function (res) {
                                that.xjlist.contList2 = res.data.list


                            }
                        })
                        $.ajax({
                            type: 'POST',
                            url: '/JMRIUsnmLz.php/disoop/Inspectpercentage',
                            dataType: 'json',
                            data: { 'area': '萧山区' },
                            success: function (res) {
                                that.xjchart = res.data

                                var myChart20 = echarts.init(document.getElementById('echart20'));
                                var option20;
                                var myChart30 = echarts.init(document.getElementById('echart30'));
                                var option30;
                                var myChart31 = echarts.init(document.getElementById('echart31'));
                                var option31;
                                option20 = {
                                    color: ["#03b2ff", "#ee6666"],
                                    tooltip: {
                                        trigger: 'item'
                                    },

                                    legend: {
                                        textStyle: { color: "#000" },
                                        right: '0px',
                                        top: "center",
                                        itemGap: 10,
                                        orient: 'vertical', orient: 'vertical',
                                        formatter: function (name) {
                                            // console.log(name)
                                            let data = option20.series[0].data;
                                            let total = 0;
                                            let tarValue = 0;
                                            for (let i = 0, l = data.length; i < l; i++) {
                                                total += data[i].value;
                                                if (data[i].name == name) {
                                                    tarValue = data[i].value;
                                                }
                                            }
                                            let p = ((tarValue / total) * 100).toFixed(0);
                                            return name + ' ' + ' ' + p + '%';
                                        },
                                        data: ['已完成', '未完成']
                                    },

                                    series: [

                                        {
                                            center: ['30%', '50%'],
                                            radius: ['40%', '70%'],
                                            name: '完成情况',
                                            type: 'pie',

                                            avoidLabelOverlap: false,
                                            label: {
                                                show: false,
                                                position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '14',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: [
                                                { value: (that.xjchart.finish * 100).toFixed(0), name: '已完成' },
                                                { value: (that.xjchart.undone * 100).toFixed(0), name: '未完成' },


                                            ]
                                        }
                                    ]
                                };
                                option30 = {
                                    color: ["#03b2ff", "#ee6666"],
                                    tooltip: {
                                        trigger: 'item'
                                    },

                                    legend: {
                                        textStyle: { color: "#000" },
                                        right: '0px',
                                        top: "center",
                                        itemGap: 10,
                                        orient: 'vertical',
                                        formatter: function (name) {

                                            let data = option30.series[0].data;
                                            let total = 0;
                                            let tarValue = 0;
                                            for (let i = 0, l = data.length; i < l; i++) {
                                                total += data[i].value;
                                                if (data[i].name == name) {
                                                    tarValue = data[i].value;
                                                }
                                            }
                                            let p = ((tarValue / total) * 100).toFixed(0);
                                            return name + ' ' + ' ' + p + '%';
                                        },
                                        data: ['已完成', '未完成']
                                    },

                                    series: [

                                        {
                                            center: ['30%', '50%'],
                                            radius: ['40%', '70%'],
                                            name: '巡检情况',
                                            type: 'pie',

                                            avoidLabelOverlap: false,
                                            label: {
                                                show: false,
                                                position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '14',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: [
                                                { value: (that.xjchart.finish * 100).toFixed(0), name: '已完成' },
                                                { value: (that.xjchart.undone * 100).toFixed(0), name: '未完成' },


                                            ]
                                        }
                                    ]
                                };
                                option31 = {
                                    color: ["#03b2ff", "#ee6666"],
                                    tooltip: {
                                        trigger: 'item'
                                    },

                                    legend: {
                                        textStyle: { color: "#000" },
                                        right: '0px',
                                        top: "center",
                                        itemGap: 10,
                                        orient: 'vertical',
                                        formatter: function (name) {
                                            let data = option31.series[0].data;
                                            let total = 0;
                                            let tarValue = 0;
                                            for (let i = 0, l = data.length; i < l; i++) {
                                                total += data[i].value;
                                                if (data[i].name == name) {
                                                    tarValue = data[i].value;
                                                }
                                            }
                                            let p = ((tarValue / total) * 100).toFixed(0);
                                            return name + ' ' + ' ' + p + '%';
                                        },
                                        data: ['已完成', '未完成']

                                    },

                                    series: [

                                        {
                                            center: ['30%', '50%'],
                                            radius: ['40%', '70%'],
                                            name: '提交情况',
                                            type: 'pie',

                                            avoidLabelOverlap: false,
                                            label: {
                                                show: false,
                                                position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '14',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: [
                                                { value: (that.xjchart.finish * 100).toFixed(0), name: '已完成' },
                                                { value: (that.xjchart.undone * 100).toFixed(0), name: '未完成' },


                                            ]
                                        }
                                    ]
                                };
                                option20 && myChart20.setOption(option20);
                                option30 && myChart30.setOption(option30);
                                option31 && myChart31.setOption(option31);
                            }
                        })

                    },
                    province() {
                        // 行政区划查询
                        let opts = {
                            subdistrict: 1, // 返回下一级行政区
                            showbiz: false // 最后一级返回街道信息
                        }
                        this.district = new AMap.DistrictSearch(opts) // 注意：需要使用插件同步下发功能才能这样直接使用
                        this.district.search('中国', (status, result) => {

                            if (status === 'complete') {
                                this.getData(result.districtList[0])
                            }
                        })
                    },
                 
                    
                    getData(data, level) {



                        var that = this
                        if (level === 'province') {
                            that.selectProvince1 = data.name
                        }
                        if (level === 'city') {
                            that.selectCity1 = data.name
                        }
                        if (level === 'district') {
                            that.selectDistrict1 = data.name
                        }
                        that.select2Arr = that.selectProvince1 + that.selectCity1 + that.selectDistrict1



                        if (data.name === "中华人民共和国") {
                            that.cityName = '萧山'
                        } else {
                            that.cityName = (data.name)
                            var weather = new AMap.Weather();
                            weather.getLive(that.cityName, function (err, data) {
                                that.tq1 = data.weather;
                                that.tq2 = '，' + data.temperature + '℃';
                                // console.log(str)

                            })
                        }




                        // that.townshipList = []
                        let citySelect = document.getElementById('city')
                        let districtSelect = document.getElementById('district')

                        let bounds = data.boundaries


                        if (bounds) {


                            var markerContent = "<div class='cityName'>" + data.name + "</div>"

                            that.marker = new AMap.Marker({
                                position: bounds[0][0],
                                // 将 html 传给 content
                                content: markerContent,
                                // 以 icon 的 [center bottom] 为原点
                                offset: new AMap.Pixel(0, 0)
                            });

                            // 将 markers 添加到地图
                            that.map.add(that.marker);
                            for (let i = 0, l = bounds.length; i < l; i++) {
                                let polygon = new AMap.Polygon({
                                    map: that.map,
                                    strokeColor: "#fff",
                                    strokeWeight: 1,
                                    strokeOpacity: 1,
                                    fillOpacity: 0.5,
                                    fillColor: "#798441",
                                    path: bounds[i],
                                    zIndex: 10
                                })
                                that.polygons.push(polygon)
                                console.log(polygon)
                                if (level === 'province') {
                                    that.map.setFitView(that.polygons)// 地图自适应
                                } else {
                                    that.map.setFitView(polygon)
                                }

                            }

                        }
                        // 清空下一级别的下拉列表
                        if (level === 'province') {
                            citySelect.innerHTML = ''
                            that.townshipList = []
                            districtSelect.innerHTML = ''


                        } else if (level === 'city') {
                            districtSelect.innerHTML = ''
                            that.townshipList = []


                        }
                        let subList = data.districtList
                        if (subList) {
                            let contentSub = "";
                            let curlevel = subList[0].level;
                            let curList = document.querySelector("#" + curlevel);
                            if (!curList) return false;
                            if (curlevel === "province") {
                                curList.add(new Option("全国"));
                            } else if (curlevel === "city") {
                                curList.add(new Option("全市"));
                            } else {
                                curList.add(new Option("全区"));
                            }
                            for (let i = 0, l = subList.length; i < l; i++) {
                                let name = subList[i].name
                                let levelSub = subList[i].level
                                contentSub = new Option(name)
                                contentSub.setAttribute('value', levelSub)
                                contentSub.center = subList[i].center
                                contentSub.adcode = subList[i].adcode
                                curList.add(contentSub)

                                //    console.log(levelSub,typeof levelSub)
                                if (levelSub === 'street') {
                                    that.townshipList.push(name)



                                }
                            }
                        }

                    },
                    search(obj) {
                        console.log(obj)


                        // 清除地图上所有覆盖物
                        let that = this

                        for (let i = 0, l = this.polygons.length; i < l; i++) {
                            this.polygons[i].setMap(null)
                            this.marker.setMap(null)

                        }
                        let option = obj.srcElement[obj.srcElement.options.selectedIndex]
                        let adcode = option.adcode
                        this.district.setLevel(option.value) // 行政区级别
                        this.district.setExtensions('all')
                        // 行政区查询
                        // 按照adcode进行查询可以保证数据返回的唯一性
                        this.district.search(adcode, function (status, result) {
                            if (status === 'complete') {
                                that.getData(result.districtList[0], obj.srcElement.id)
                            }
                        })
                    },
                    menuShow(index) {

                        this.menuIndex = index

                    },

                    selectClass($event) {

                        Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                        this.get_chart_data(this.item_iid, this.point_id);
                    },
                    destroyMap() {
                        this.MAps.destroy();
                    },
                    getCity(item, i, j) {
                        $('.TabContent span').removeClass('isActive')
                        var that = this
                        that.active[i] = j
                        that.selectProvince = item[j].name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 2, id: item[j].id },
                            success: function (res) {
                                that.citys = res.data
                                that.menuIndex = 1
                            }
                        })

                    },

                    getDistricts(item, index) {
                        var that = this

                        that.active2 = index
                        that.selectCity = item.name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 3, id: item.id },
                            success: function (res) {
                                that.districts = res.data
                                that.menuIndex = 2
                            }
                        })
                    },
                    getTownships(item, index) {
                        var that = this

                        that.active3 = index
                        that.selectDistrict = item.name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 4, id: item.id },
                            success: function (res) {
                                that.Townships = res.data
                                that.menuIndex = 3
                            }
                        })
                    },
                    getWLists(item, index) {
                        var that = this
                        that.active4 = index
                        that.selectTownship = item.name

                        that.cityPicker = that.selectProvince + '/' + that.selectCity + '/' + that.selectDistrict + '/' + that.selectTownship

                        $('.myTab').hide()
                        var that = this
                        $.ajax({
                            type: 'get',
                            url: 'display/getLevel?city=' + that.cityPicker,
                            dataType: 'json',
                            success: function (res) {
                                if (res == [] || res == '') {
                                    that.namecity = ''
                                    that.namegc = ''
                                    that.numonne = ''
                                    that.numtwoww = ''
                                    $('#my-type').html(' ');
                                    $('#my-type').attr('title', '请选择')
                                    $('#my-type').selectpicker('refresh');

                                } else {
                                    that.namecity = res
                                    that.namegc = that.namecity[0].point
                                    that.numonne = that.namecity[0].item_name
                                    if (that.namegc == [] || that.namegc == '') {
                                        that.numtwoww = ''
                                        $('#my-type').html(' ');
                                    } else {
                                        that.numtwoww = that.namegc[0].point_code
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
                                            url: "display/getModel?mon_type_id=" + res[0].point[0].mon_type_id,
                                            dataType: 'json',
                                            success: function (re) {
                                                that.unundd = re.data
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
                                                that.point_id = id
                                                that.item_iid = item_id
                                                that.get_chart_data(that.item_iid, that.point_id);
                                            }
                                        });
                                    }
                                }
                            }
                        })


                    },
                    showPicker() {
                        $('.myTab').show()
                    },
                    // hidePicker(){
                    //     $('.myTab').hide()
                    // },

                    // setCenter(obj){
                    //     console.log(obj)
                    //     console.log(obj.srcElement[obj.srcElement.options.selectedIndex].center)
                    //     this.map.setCenter(obj.srcElement[obj.srcElement.options.selectedIndex].center)
                    // },
                    gototown(town) {
                        var that = this
                        that.cityName = town
                        if (town === '党湾镇' || town === '北干街道' || town === '南阳街道' || town === '城厢街道' || town === '宁围街道' || town === '戴村镇' || town === '楼塔镇' || town === '河上镇' || town === '浦阳镇'
                            || town === '新街街道' || town === '蜀山街道' || town === '闻堰街道' || town === '靖江街道' || town === '衙前镇' || town === '临浦镇' || town === '义桥镇' || town === '所前镇' || town === '瓜沥镇'
                            || town === '益农镇' || town === '新塘街道' || town === '盈丰街道' || town === '进化镇') {
                            console.log("11111")
                            that.map.clearMap();
                            that.handlePolygon(town)

                        } else {

                            that.marker.setMap(null)
                            that.markLocation(town)
                        }

                    },
                    markLocation(address) {//除萧山外的其他地址定位
                        var that = this
                        var addressArr = that.select2Arr + address
                        that.level = 1
                        that.$nextTick(() => {
                            that.getTwochart()
                        })

                        AMap.plugin('AMap.Geocoder', function () {
                            var geocoder = new AMap.Geocoder();

                            geocoder.getLocation(addressArr, function (status, result) {

                                if (status === 'complete' && result.info === 'OK') {

                                    // 经纬度                      
                                    var lng = result.geocodes[0].location.lng;
                                    var lat = result.geocodes[0].location.lat;

                                    var lal = [lng, lat]
                                    that.map.addControl(new AMap.MapType({
                                        defaultType: that.defaultType
                                    }))
                                    that.map.setCenter(lal)
                                    var markerContent = "<div class='cityName'>" + address + "</div>"
                                    that.marker = new AMap.Marker({
                                        position: lal,
                                        // 将 html 传给 content
                                        content: markerContent,
                                        // 以 icon 的 [center bottom] 为原点
                                        offset: new AMap.Pixel(0, 0)
                                    });

                                    // 将 markers 添加到地图
                                    that.map.add(that.marker);


                                } else {
                                    console.log('定位失败！');
                                }
                            });
                        });
                    },
                    handlePolygon(result) {

                        let bounds = []
                        let polygons = []
                        var that = this
                        that.map = new AMap.Map("container", {
                            zoom: 9
                        });
                        that.map.addControl(new AMap.MapType({
                            defaultType: that.defaultType
                        }))
                        that.cityName = result
                        that.level = 1
                        that.$nextTick(() => {
                            that.getTwochart()
                        })


                        for (let i = 0; i < that.geoJSON.length; i++) {
                            if (result === that.geoJSON[i].properties.name) {
                                var lat = []
                                lat.push(that.geoJSON[i].properties.centerx, that.geoJSON[i].properties.centery)
                                // console.log(that.geoJSON[i].geometry.coordinates[0])
                                AMap.convertFrom(that.geoJSON[i].geometry.coordinates[0], 'gps', function (status, result) {
                                    bounds = result.locations
                                    var polygon = new AMap.Polygon({
                                        // 这些就是图形的一些基本样式了，颜色 线条粗细 透明度之类的
                                        path: bounds,

                                        strokeColor: "#fff",
                                        strokeWeight: 1,
                                        strokeOpacity: 1,
                                        fillOpacity: 0.3,
                                        fillColor: "#798441",
                                        offset: new AMap.Pixel(-20, -20),
                                        zIndex: 2,
                                    });
                                    var markerContent = "<div class='cityName'>" + that.cityName + "</div>"

                                    that.marker = new AMap.Marker({
                                        position: lat,
                                        // 将 html 传给 content
                                        content: markerContent,
                                        // 以 icon 的 [center bottom] 为原点
                                        offset: new AMap.Pixel(0, 0)
                                    });

                                    // 将 markers 添加到地图
                                    that.map.add(that.marker);
                                    that.map.add(polygon);
                                    // 缩放地图到合适的视野级别
                                    that.map.setFitView([polygon]);
                                })


                            }
                        }
                        //请求地图测点数据
                        $.ajax({
                            type: 'get',
                            url: 'board/getEngPoint',
                            dataType: 'json',
                            success: function (res) {

                                if (res.code == 200) {
                                    that.dateThree = res.small



                                    var lnglats2 = []
                                    var leg2;

                                    for (var i = 0; i < that.dateThree.length; i++) {
                                        var l = parseFloat(that.dateThree[i].lng)
                                        var w = parseFloat(that.dateThree[i].lat)
                                        leg2 = [l, w]
                                        lnglats2.push({ 'lal': leg2, 'id': that.dateThree[i].id, 'name': that.dateThree[i].sensor_name })
                                        //that.dateone.data[i].color = '#18bc9c'
                                        //that.dateone.data[i].type = 'circle'
                                    }



                                    for (var i = 0; i < lnglats2.length; i++) {

                                        that.marker2 = new AMap.Marker({
                                            title: lnglats2[i].name,
                                            position: lnglats2[i].lal,
                                            zIndex: 150,
                                            content: '<div class="markerClass"></div>',
                                            map: that.map,
                                            offset: new AMap.Pixel(-13, -30),
                                            achor: 'top-left'
                                        });
                                        // that.marker2.setLabel({
                                        //     offset: new AMap.Pixel(5, 0),  //设置文本标注偏移量
                                        //     content:  lnglats2[i].name,
                                        //     zIndex: 150, //设置工程名称
                                        //     direction: 'right' //设置文本标注方位
                                        // });
                                        // marker2.setAnimation('AMAP_ANIMATION_BOUNCE');
                                        var htmlone = "<div class='point'><div><label>测点编号：</label>" + that.dateThree[i].point_code + "</div><div><label>设备名称：</label>" + that.dateThree[i].sensor_name + "</div><div><label>工程项目：</label>" + that.dateThree[i].name + "</div><div><label>所在城市：</label>" + that.dateThree[i].city + "</div><div><label>具体位置：</label>" + that.dateThree[i].address + "</div><div><label>经纬度：</label>" + that.dateThree[i].lng + "," + that.dateThree[i].lat + "</div> <div><label>有效日期：</label>" + that.dateThree[i].finish_date + "</div>"
                                        that.marker2.content = htmlone;


                                        that.marker2.on('click', that.markerClick3);    //为点标记绑定点击事件，
                                        // marker.emit('click', { target: marker });   //自动点击一个


                                    }
                                } else {
                                    false
                                }
                            }
                        })

                        //请求巡检数据列表
                        $.ajax({
                            type: 'POST',
                            url: '/public/JMRIUsnmLz.php/disoop/getAreaInspectInfo',
                            dataType: 'json',
                            data: { 'area': '萧山区', 'street': result, 'status': 0 },
                            success: function (res) {
                                that.xjlist.contList1 = res.data.list
                                // console.log(that.xjlist.contList1)

                            }
                        })
                        $.ajax({
                            type: 'POST',
                            url: '/public/JMRIUsnmLz.php/disoop/getAreaInspectInfo',
                            dataType: 'json',
                            data: { 'area': '萧山区', 'street': result, 'status': 1 },
                            success: function (res) {
                                that.xjlist.contList2 = res.data.list
                                // console.log(that.xjlist.contList2)

                            }
                        })
                        //请求巡检数据饼图
                        $.ajax({
                            type: 'POST',
                            url: '/JMRIUsnmLz.php/disoop/Inspectpercentage',
                            dataType: 'json',
                            data: { 'area': '萧山区', 'street': result },
                            success: function (res) {
                                that.xjchart = res.data

                                var myChart20 = echarts.init(document.getElementById('echart20'));
                                var option20;
                                option20 = {
                                    color: ["#03b2ff", "#ee6666"],
                                    tooltip: {
                                        trigger: 'item'
                                    },

                                    legend: {
                                        textStyle: { color: "#fff" },
                                        right: 0,
                                        top: "center",
                                        itemGap: 10,
                                        orient: 'vertical'
                                    },

                                    series: [
                                        {
                                            name: '完成情况',
                                            type: 'pie',
                                            center: ['30%', '50%'],
                                            radius: ['40%', '70%'],
                                            avoidLabelOverlap: false,
                                            label: {
                                                show: false,
                                                position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '14',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: [
                                                { value: Number(that.xjchart.finish) * 100, name: '已完成' },
                                                { value: Number(that.xjchart.undone) * 100, name: '未完成' },


                                            ]
                                        }
                                    ]
                                };
                                option20 && myChart20.setOption(option20);
                            }
                        })
                        $.ajax({
                            type: 'POST',
                            url: '/JMRIUsnmLz.php/disoop/getHouseInfo',
                            data: {
                                area: '萧山区',
                                street: result
                            },
                            dataType: 'json',
                            success: function (res) {

                                if (res.code == 0) {

                                    that.dateone = res.data.enginner
                                    that.datetwo = res.data.house

                                } else {
                                    return false
                                }

                                var leg;
                                var leg1;
                                var lnglats = []
                                var lnglats1 = []
                                for (var i = 0; i < res.data.house.length; i++) {
                                    var l = parseFloat(res.data.house[i].lng)
                                    var w = parseFloat(res.data.house[i].lat)
                                    leg = [l, w]
                                    lnglats.push({ 'lal': leg, 'id': res.data.house[i].id, 'name': res.data.house[i].name })
                                    //that.dateone.data[i].color = '#18bc9c'
                                    //that.dateone.data[i].type = 'circle'
                                }
                                for (var i = 0; i < res.data.enginner.length; i++) {
                                    var l = parseFloat(res.data.enginner[i].lng)
                                    var w = parseFloat(res.data.enginner[i].lat)
                                    leg1 = [l, w]
                                    lnglats1.push({ 'lal': leg1, 'id': res.data.enginner[i].id, 'name': res.data.enginner[i].name })
                                    //that.dateone.data[i].color = '#18bc9c'
                                    //that.dateone.data[i].type = 'circle'
                                }

                                // console.log(lnglats1)
                                for (var i = 0; i < lnglats1.length; i++) {

                                    var marker1 = new AMap.Marker({
                                        title: lnglats1[i].name,
                                        position: lnglats1[i].lal,
                                        extData: {
                                            id: lnglats1[i].id,
                                            len: lnglats1[i].lal,
                                            name: lnglats1[i].name,
                                        },
                                        icon: new AMap.Icon({
                                            image: "../../assets/img/mapicon.png",
                                            // size: new AMap.Size(80, 80),  //图标大小
                                            imageSize: new AMap.Size(40, 40)
                                        }),
                                        offset: new AMap.Pixel(-13, -30),
                                        map: that.map
                                    });
                                    marker1.setLabel({
                                        offset: new AMap.Pixel(20, 20),  //设置文本标注偏移量
                                        content: lnglats1[i].name, //设置工程名称
                                        direction: 'right' //设置文本标注方位
                                    });
                                    marker1.setAnimation('AMAP_ANIMATION_BOUNCE');
                                    marker1.on('click', that.markerClick2);
                                    marker1.setMap(that.map);
                                }

                                // console.log(lnglats)

                                for (var i = 0; i < lnglats.length; i++) {
                                    var marker = new AMap.Marker({
                                        title: lnglats[i].name,
                                        position: lnglats[i].lal,
                                        content: '<div class="markerClass2"></div>',
                                        map: that.map,
                                        offset: new AMap.Pixel(-13, -30),
                                        // icon: new AMap.Icon({
                                        //     image: "../../assets/img/icon1.png",
                                        //     // size: new AMap.Size(80, 80),  //图标大小
                                        //     imageSize: new AMap.Size(40, 40)
                                        // }),
                                        extData: {
                                            id: lnglats[i].id,
                                            len: lnglats[i].lal,
                                            name: lnglats[i].name,
                                        },
                                    });

                                    // var marker = new AMap.CircleMarker({
                                    //     center: lnglats[i].lal,
                                    //     extData: {
                                    //         id: lnglats[i].id,
                                    //         len: lnglats[i].lal,
                                    //         name: lnglats[i].name,
                                    //     },
                                    //     // Position: lnglats[i],
                                    //     // icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGpJREFUOE/NkrENgDAMBO8bGAQmYhiGYBgmIoNAYxSJdAYFTBHX/vefbREsBfU0bmBmnaTjCdNFMLMJWIABSMAsafWM7gy2S1w0SdJYZZBjA7vT3Hs4/yfIk8M7KPE/X+HNdzb+iTUoYYQTS3wjES/GKQ4AAAAASUVORK5CYII=",
                                    //     map: that.map,
                                    //     radius: 4 + Math.random() * 10,//3D视图下，CircleMarker半径不要超过64px
                                    //     strokeColor: '#e91010',
                                    //     strokeWeight: 2,
                                    //     strokeOpacity: 0.5,
                                    //     fillColor: '#e91010',
                                    //     fillOpacity: 0.5,
                                    //     zIndex: 3,
                                    //     bubble: true,
                                    //     cursor: 'pointer',
                                    //     clickable: true
                                    // });


                                    var htmlone = "<div class='point'><div><label>建筑物名称：</label>" + that.datetwo[i].name + "</div><div><label>建筑物地址：</label>" + that.datetwo[i].address + "</div><div><label>结构形式：</label>" + that.datetwo[i].structure + "</div><div><label>层数：</label>" + that.datetwo[i].un_layer + '-' + that.datetwo[i].on_layer + "</div><div><label>建筑面积：</label>" + that.datetwo[i].area + "</div><div><label>鉴定等级：</label>" + that.datetwo[i].rate + "</div> <div><label>产权情况：</label>" + that.datetwo[i].use + "</div>"
                                    marker.content = htmlone;


                                    marker.on('click', that.markerClick);
                                    marker.setMap(that.map); //为点标记绑定点击事件，
                                    // marker.emit('click', { target: marker });   //自动点击一个

                                }

                            }
                        })


                    },

                    mapToolBar() {
                        var that = this
                        this.toolbar = new AMap.ToolBar({
                            position: {
                                top: "110px",
                                right: "40px",
                            },
                        });
                        that.map.addControl(this.toolbar);
                    },
                    mapScale() {
                        var that = this
                        this.scale = new AMap.Scale();
                        that.map.addControl(this.scale);
                    },
                    toggleScale(e) {
                        if (e.target.checked) {
                            this.scale.show();
                            console.log("true");
                        } else {
                            this.scale.hide();
                            console.log("false");
                        }
                    },
                    toggleToolBar(e) {
                        console.log(this.toolbar);
                        if (e.target.checked) {
                            this.toolbar.show();
                        } else {
                            this.toolbar.hide();
                        }
                    },
                    toggleControlBar(e) {
                        if (e.target.checked) {
                            this.controlBar.show();
                        } else {
                            this.controlBar.hide();
                        }
                    },
                    getOne() {

                        var that = this
                        that.level = 0
                        that.cityName = '萧山'
                        that.IntMap()

                        that.$nextTick(() => {
                            that.getchart()
                        })
                    },

                    getTab(x) {
                        console.log(x)
                        var that = this
                        if (x === 1) {
                            that.clickone = true
                        } else {
                            that.clictwo = true
                        }
                    },
                    handleClick(tab, event) {
                        console.log(tab, event);
                    },
                    markerClick(e) {

                        var that = this
                        var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
                        infoWindow.setContent(e.target.content);
                        infoWindow.open(that.map, e.target.getPosition());
                        var data = e.target.De.extData
                        that.xuanranyige(data, 2)

                    },
                    markerClick2(e) {
                        var that = this
                        var data = e.target.De.extData
                        that.xuanranyige(data, 1)

                    },
                    markerClick3(e) {
                        var that = this
                        var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
                        infoWindow.setContent(e.target.content);
                        infoWindow.open(that.map, e.target.getPosition());


                    },
                    showSelecttab(index,item){
                        this.$set(this.monitorData[index],'is_show',true)
                        $('#tq').hide()
                 
                        if(!item.is_request){
                        this.$set(this.monitorData[index],'is_request',true)
                        this.showMonitoring(item)
                        }
                    },
                    showMonitoring(item) {
            
                        var that = this
                       
                        that.box4Name=item.engineering_name+'('+item.item_name+')'
              
                      
                        $.ajax({
                            type: "get",
                            url: "show/project/get_child_list",
                            data: { 'id': item.id },
                            // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                            dataType: 'json',
                            success: function (res) {
                                console.log(res)
                                that.tabTitle=res.rows
                                that.ids=res.rows[0].id
                                that.tabSelect(0,res.rows[0].id)
                              

                            }
                        })
                    },
                    tabSelect(index,id,name){
                     
                        var that = this
                        that.mon_type_name=name
                        that.ids=id
                        that.tabSelectIndex = index
                      
                        // $(that).addclass('box4active').siblings().removeClass("box4active")
                        $.ajax({
                            type: "get",
                            url: "engineering/data/index",
                            data: {
                            'ids':id,
                            'addtabs': 1,
                            'sort': 'record_time',
                            'order': 'desc',
                            'offset': that.current_page*that.pageSize-that.pageSize,
                            'limit':that.pageSize,
                         
                            // currentPage : 1,//当前页号
                            // pagesize :10 //每页大小

                        },
                            // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                            dataType: 'json',
                            success: function (res) {
                            
                                that.box4Context=res.rows
                                that.total=res.total
                                that.pages=Math.ceil(that.total/that.pageSize)
                         
                           
                              
                            }
                        })

                    },
                    tabSelect1(index){
                        this.tabSelectIndex = index
                    },
                    xuanranyige(data, y) {
                        if (y === 1) {

                            let that = this;
                            that.cityName = (data.name)
                            that.level = 2
                            that.$nextTick(() => {
                                that.getThreechart()
                            })
                            that.map.clearMap()

                            $.ajax({
                                type: "get",
                                url: "engineering/engineering/getLalByIdS",
                                data: { 'ids': data.id },
                                // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                dataType: 'json',
                                success: function (res) {

                                    var buildingLayer = new AMap.Buildings({
                                        zIndex: 130,
                                        merge: false,
                                        sort: false,

                                    });
                                    var options = {
                                        hideWithoutStyle: true,//是否隐藏设定区域外的楼块
                                        areas: [{ //围栏1
                                            // visible:flase,//是否可见
                                            rejectTexture: true,//是否屏蔽自定义地图的纹理
                                            // color1: 'F21c40dd', //楼顶颜色
                                            // color2: '18bc9ceb', //楼面颜色0
                                            lineColor: '18bc9ceb', //底部线的颜色 rgba
                                            // path: eval('(' + res.data + ')')
                                            path: res.data
                                        }]
                                    }

                                    buildingLayer.setStyle(options); //此配色优先级高于自定义mapStyle


                                    var Polygon = new AMap.Polygon({
                                        bubble: true,
                                        fillColor: '#18bc9c',
                                        fillOpacity: 0.3,
                                        strokeWeight: 1,
                                        path: res.data,
                                        map: that.map
                                    })
                                    that.map.setFitView();

                                    that.map.addControl(new AMap.MapType({
                                        defaultType: that.defaultType
                                    }))

                                    var object3Dlayer = new AMap.Object3DLayer({ zIndex: 1 });
                                    that.map.add(that.marker2)
                                    that.map.add(object3Dlayer);

                                    that.map.addControl(new AMap.Scale())
                                }
                            })

                            $.ajax({

                                type: "get",
                                url: "display/getEngineerInfo",
                                data: { 'id': data.id },
                                // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                dataType: 'json',
                                success: function (res) {

                                    $('.prowarp').show()
                                    that.engineering = res.data.engineering_data
                                    that.project = res.data.project
                                    that.image = res.data.image
                                    that.projectId = res.data.project[0].id
                                    $.ajax({
                                        type: "get",
                                        url: "/JMRIUsnmLz.php/disoop/getPointInfo",
                                        data: { 'id': res.data.project[0].id },
                                        // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                        dataType: 'json',
                                        success: function (res) {
                                            // console.log(res.data.list)
                                            var lnglats3 = []
                                            var leg3;

                                            for (var i = 0; i < res.data.list.length; i++) {
                                                var l = parseFloat(res.data.list[i].lng)
                                                var w = parseFloat(res.data.list[i].lat)
                                                leg3 = [l, w]
                                                lnglats3.push({ 'lal': leg3, 'id': res.data.list[i].id, 'name': res.data.list[i].sensor_name })
                                                //that.dateone.data[i].color = '#18bc9c'
                                                //that.dateone.data[i].type = 'circle'
                                            }



                                            for (var i = 0; i < lnglats3.length; i++) {

                                                // console.log(lnglats3[i])

                                                that.marker3 = new AMap.Marker({

                                                    title: lnglats3[i].name,
                                                    position: lnglats3[i].lal,

                                                    content: '<div class="markerClass"></div>',
                                                    map: that.map,

                                                });

                                                var htmlone = "<div class='point'><div><label>测点编号：</label>" + res.data.list[i].point_code + "</div><div><label>设备名称：</label>" + res.data.list[i].sensor_name + "</div><div><label>工程ID：</label>" + res.data.list[i].project_id + "</div><div><label>采集仪ID：</label>" + res.data.list[i].dev_code + "</div>"
                                                that.marker3.content = htmlone;


                                                that.marker3.on('click', that.markerClick3);    //为点标记绑定点击事件，
                                                // marker.emit('click', { target: marker });   //自动点击一个


                                                // })

                                            }
                                        }
                                    })

                                }
                            })





                        } else {
                            if (data === null) {
                                alert("未找到该建筑物对应的项目")
                            } else {
                                let that = this
                                that.cityName = (data.name)
                                that.level = 2
                                that.$nextTick(() => {
                                    that.getThreechart()
                                })
                                that.map.clearMap()

                                $.ajax({
                                    type: "get",
                                    url: "engineering/engineering/getLalByIdS",
                                    data: { 'ids': data.id, 'type': 2 },
                                    // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                    dataType: 'json',
                                    success: function (res) {

                                        var buildingLayer = new AMap.Buildings({
                                            zIndex: 120,
                                            merge: false,
                                            sort: false,

                                        });
                                        var options = {
                                            hideWithoutStyle: false,//是否隐藏设定区域外的楼块
                                            areas: [{ //围栏1
                                                //visible:false,//是否可见
                                                rejectTexture: true,//是否屏蔽自定义地图的纹理
                                                // color1: '18bc9ceb', //楼顶颜色
                                                // color2: '18bc9ceb', //楼面颜色0
                                                lineColor: 'D9001057', //底部线的颜色 rgba
                                                path: res.data
                                            }]
                                        }

                                        buildingLayer.setStyle(options); //此配色优先级高于自定义mapStyle
                                        // that.map = new AMap.Map("container", {
                                        //     zoom: 18,
                                        //     zooms: [15, 20],
                                        //     resizeEnable: true,
                                        //     expandZoomRange: true,
                                        //     showIndoorMap: false,
                                        //     showLabel: true,
                                        //     buildingAnimation: true,
                                        //     pitch: 50,
                                        //     // mapStyle:'amap://styles/light',
                                        //     center: res.data,
                                        //     // center:eval('(' + res + ')')[0],
                                        //     features: ['bg', 'point', 'road'],
                                        //     viewMode: '3D',
                                        //     layers: [
                                        //         new AMap.TileLayer(),
                                        //         buildingLayer,
                                        //     ]
                                        // });
                                        new AMap.Polygon({
                                            bubble: true,
                                            fillColor: '#18bc9c',
                                            fillOpacity: 0.8,
                                            strokeWeight: 1,
                                            path: res.data,
                                            map: that.map
                                        })

                                        var Polygon = new AMap.Polygon({
                                            bubble: true,
                                            fillColor: '#18bc9c',
                                            fillOpacity: 0.3,
                                            strokeWeight: 1,
                                            path: res.data,
                                            map: that.map
                                        })
                                        that.map.setFitView();

                                        var object3Dlayer = new AMap.Object3DLayer({ zIndex: 1 });
                                        that.map.addControl(new AMap.MapType({
                                            defaultType: that.defaultType
                                        }))
                                        that.map.add(object3Dlayer);
                                        that.map.add(that.marker2)
                                        that.map.addControl(new AMap.Scale())


                                    }

                                })

                            }

                            $.ajax({
                                type: "get",
                                url: "display/getEngineerInfo",
                                data: { 'house_id': data.id, 'type': 2 },
                                // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                                dataType: 'json',
                                success: function (res) {


                                    $('.prowarp').show()
                                    that.engineering = res.data.engineering_data
                                    that.project = res.data.project
                                    that.image = res.data.image

                                }
                            })
                        }
                    },
                    getPointsCenter(points) {
                        var point_num = points.length; //坐标点个数
                        var X = 0, Y = 0, Z = 0;
                        for (let i = 0; i < points.length; i++) {

                            if (points[i] == '') {
                                continue;
                            }
                            let point = points[i].split(',');
                            var lat, lng, x, y, z;
                            lat = parseFloat(point[0]) * Math.PI / 180;
                            lng = parseFloat(point[1]) * Math.PI / 180;
                            x = Math.cos(lat) * Math.cos(lng);
                            y = Math.cos(lat) * Math.sin(lng);
                            z = Math.sin(lat);
                            X += x;
                            Y += y;
                            Z += z;
                        }
                        X = X / point_num;
                        Y = Y / point_num;
                        Z = Z / point_num;

                        var tmp_lng = Math.atan2(Y, X);
                        var tmp_lat = Math.atan2(Z, Math.sqrt(X * X + Y * Y));

                        return [tmp_lat * 180 / Math.PI, tmp_lng * 180 / Math.PI];
                    },
                    getchart() {

                        var myChart = echarts.init(document.getElementById('echartInfo'));
                        var option;

                        var myChart21 = echarts.init(document.getElementById('echart21'));
                        var option21;
                        var myChart27 = echarts.init(document.getElementById('echart27'));
                        var option27;
                        var namedate = ['水准仪在线率', '倾角仪在线率', '水准仪正常', '倾角仪正常', '水准仪异常', '倾角仪异常'];
                        var numdate = [60, 100, 80, 70, 30, 10];
                        var colorlist = [];
                        numdate.forEach(element => {
                            if (element < 60) {
                                colorlist.push(["#fc7095", "#fa8466"])
                            } else if (element >= 60 && element < 90) {
                                colorlist.push(["#386ffd", "#74b3ff"])
                            } else {
                                colorlist.push(["#1aa8ce", "#49d3c6"])
                            }
                        });
                        option27 = {

                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                }
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    textStyle: { color: "#fff" },
                                    data: namedate,
                                    
                                    axisTick: {
                                        alignWithLabel: true,
                                     
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: "#4dd1c4",
                                            width: 1
                                        }
                                    },
                                    axisLabel: {
                                        show: true,
                                        interval:0,
                                        rotate:60,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize:'10',
                                        },  lineStyle: {
                                            color: '#fff',
                                        }
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    textStyle: { color: "#fff" },
                                    axisLabel: {
                                        formatter: '{value} %',
                                        show: true,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize:'12',
                                        }
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: "#fff",
                                            width: 1,
                                            show:true,
                                        },
                                        
                                    },
                                    splitLine: {
                                        show: false,
                                        lineStyle: {
                                            type: 'dashed',
                                            color: '#ddd'
                                        }
                                    }

                                }
                            ],
                            series: [
                                {
                                    name: '',
                                    type: 'bar',
                                    barWidth: '60%',
                                    data: numdate,
                                    itemStyle: {
                                        normal: {

                                            color: function (params) {
                                                // var colorList = colorlist;
                                                // return colorList[params.dataIndex];
                                                var colorList = colorlist

                                                var index = params.dataIndex;
                                                // if(params.dataIndex >= colorList.length){
                                                //         index=params.dataIndex-colorList.length;
                                                // }
                                                return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                                                    [
                                                        { offset: 1, color: colorList[index][0] },
                                                        { offset: 0, color: colorList[index][1] }
                                                    ]);


                                            }
                                        }
                                    }
                                }
                            ]
                        };

                        option = {
                            color: ["#ee6666", "#fac858", "#5470c6"],
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {
                                textStyle: { color: "#fff" },
                                bottom: '0%',
                                right: '10%'
                            },

                            series: [

                                {
                                    center: ['50%', '50%'],
                                    name: '建筑监测状况',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,

                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '14',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: 1048, name: '一级报警' },
                                        { value: 735, name: '二级报警' },
                                        { value: 580, name: '三级报警' }
                                    ]
                                }
                            ]
                        };

                        option21 = {
                            color: ["#ee6666", "#03b2ff", "#e6ff03"],
                            tooltip: {
                                trigger: 'item'
                            },

                            legend: {
                                textStyle: { color: "#fff" },
                                bottom: '0%',
                                right: '10%'
                            },

                            series: [
                                {
                                    center: ['50%', '50%'],
                                    name: '老旧房屋',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '14',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: 1, name: '30年以上' },
                                        { value: 2, name: '20年以上' },
                                        { value: 26, name: '20-30' },

                                    ]
                                }
                            ]
                        };

                        option && myChart.setOption(option);
                        option27 && myChart27.setOption(option27);

                        option21 && myChart21.setOption(option21);
                        window.addEventListener("resize", function () {
                            myChart27.resize();
                          });

                    },
                    getTwochart() {//二级图表

                        var that = this



                        var mychart24 = echarts.init(document.getElementById('echart24'));
                        var option24;
                        var myChart27 = echarts.init(document.getElementById('echart27'));
                        var option27;
                        var myChart22 = echarts.init(document.getElementById('echart22'));
                        var option22;
                        var myChart25 = echarts.init(document.getElementById('echart25'));
                        var option25;
                  
                    
                        var myChart23 = echarts.init(document.getElementById('echart23'));

                        var option23;
                        var namedate = ['水准仪在线率', '倾角仪在线率', '水准仪正常', '倾角仪正常', '水准仪异常', '倾角仪异常'];
                        var numdate = [60, 100, 80, 70, 30, 10];
                        var colorlist = [];
                        numdate.forEach(element => {
                            if (element < 60) {
                                colorlist.push(["#fc7095", "#fa8466"])
                            } else if (element >= 60 && element < 90) {
                                colorlist.push(["#386ffd", "#74b3ff"])
                            } else {
                                colorlist.push(["#1aa8ce", "#49d3c6"])
                            }
                        });
                     



                        option27 = {

                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                }
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    textStyle: { color: "#fff" },
                                    data: namedate,
                                    
                                    axisTick: {
                                        alignWithLabel: true,
                                     
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: "#4dd1c4",
                                            width: 1
                                        }
                                    },
                                    axisLabel: {
                                        show: true,
                                        interval:0,
                                        rotate:60,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize:'10',
                                        },  lineStyle: {
                                            color: '#fff',
                                        }
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    textStyle: { color: "#fff" },
                                    axisLabel: {
                                        formatter: '{value} %',
                                        show: true,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize:'12',
                                        }
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: "#fff",
                                            width: 1,
                                            show:true,
                                        },
                                        
                                    },
                                    splitLine: {
                                        show: false,
                                        lineStyle: {
                                            type: 'dashed',
                                            color: '#ddd'
                                        }
                                    }

                                }
                            ],
                            series: [
                                {
                                    name: '',
                                    type: 'bar',
                                    barWidth: '60%',
                                    data: numdate,
                                    itemStyle: {
                                        normal: {

                                            color: function (params) {
                                                // var colorList = colorlist;
                                                // return colorList[params.dataIndex];
                                                var colorList = colorlist

                                                var index = params.dataIndex;
                                                // if(params.dataIndex >= colorList.length){
                                                //         index=params.dataIndex-colorList.length;
                                                // }
                                                return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                                                    [
                                                        { offset: 1, color: colorList[index][0] },
                                                        { offset: 0, color: colorList[index][1] }
                                                    ]);


                                            }
                                        }
                                    }
                                }
                            ]
                        };

                        option23 = {
                            title: {
                                text: ''
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'shadow'
                                }
                            },
                            center: ['0%', '0%'],
                            legend: { textStyle: { color: "#fff" } },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            xAxis: [{
                                type: 'value',
                                boundaryGap: [0, 0.01],
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                },
                                axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                            }],
                            yAxis: [{
                                type: 'category',
                                axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                                data: ['低层', '中层', '高层'],
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                }

                            }],
                            series: [
                                {
                                    name: '',
                                    type: 'bar',
                                    data: [3, 97, 0]
                                },

                            ]
                        };
                        option22 = {
                            color: ["#ee6666", "#03b2ff", "#e6ff03"],
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {
                                textStyle: { color: "#fff" },
                                bottom: '0%',
                                right: '5%'
                            },

                            series: [
                                {
                                    name: '老旧房屋',
                                    type: 'pie',
                                    center: ['50%', '35%'],
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '14',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: 1, name: '30年以上' },
                                        { value: 2, name: '20年以上' },
                                        { value: 26, name: '20-30' },

                                    ]
                                }
                            ]
                        };
                        option25 = {
                            color: ["#5470c6", "#ee6666"],

                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {
                                orient: 'vertical',
                                left: 'left',
                                show: false,
                            },
                            series: [
                                {
                                    name: '监测状态',
                                    type: 'pie',
                                    radius: '50%',
                                    data: [
                                        { value: 90, name: '监测无异常' },
                                        { value: 1, name: '异常' },

                                    ],
                                    emphasis: {
                                        itemStyle: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        };
                        option28 = {
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {
                                bottom: '3%',
                                left: 'center',
                                textStyle: { color: "#fff" }
                            },
                            series: [
                                {
                                    name: '监测状况',
                                    type: 'pie',
                                    center: ["45%", "28%"],
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: '14',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: [
                                        { value: 1048, name: '沉降监测异常' },
                                        { value: 735, name: '倾角监测异常' },
                                        { value: 580, name: '沉降倾角监测异常' },

                                    ]
                                }
                            ]
                        };
                        option24 = {
                            legend: { textStyle: { color: "#fff" } },
                            xAxis: [{
                                type: 'category',
                                data: ['0~50', '50~100', '100~150'],
                                textStyle: { color: "#fff" },
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                },
                                axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                            }],
                            yAxis: [{
                                type: 'value',
                                textStyle: { color: "#fff" },
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                }, axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                            }],
                            series: [
                                {
                                    data: [120, 200, 150, 80, 70, 110, 130],
                                    type: 'bar'
                                }
                            ]
                        };


                        option24 && mychart24.setOption(option24);




                        option22 && myChart22.setOption(option22);
                        option25 && myChart25.setOption(option25);
                        option28 && myChart28.setOption(option28);
                        option27 && myChart27.setOption(option27);
                        option23 && myChart23.setOption(option23);
                        window.addEventListener("resize", function () {
                            myChart27.resize();
                          });
                    },

                    getThreechart() {

                        var that = this


                        var myChart41 = echarts.init(document.getElementById('echart41'));

                        var option41;




                        option41 = {
                            legend: { textStyle: { color: "#fff" } },
                            xAxis: [{
                                type: 'category',
                                data: ['0~50', '50~100', '100~150'],
                                textStyle: { color: "#fff" },
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                },
                                axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                            }],
                            yAxis: [{
                                type: 'value',
                                textStyle: { color: "#fff" },
                                axisLabel: {   // X轴线 标签修改 
                                    textStyle: {
                                        color: '#fff', //坐标值得具体的颜色
                                    }
                                }, axisTick: { // X轴线 刻度线 
                                    show: true,
                                    lineStyle: {
                                        color: '#fff',
                                    }
                                },
                            }],
                            series: [
                                {
                                    data: [120, 200, 150, 80, 70, 110, 130],
                                    type: 'bar'
                                }
                            ]
                        };


                        option41 && myChart41.setOption(option41);


                    },


                    get_chart_data(item_id, points) {
                        let that = this;
                        var time = $('#my-time').val();
                        var model = $('#my-type').val();

                        if (model === '请选择采样值') {
                            model = that.mytypeValue
                        }

                        var title = that.unundd[model]





                        $.ajax({
                            type: "POST",
                            url: "engineering/data/getEchart",
                            data: { 'item_id': item_id, 'points': points, 'time': time, 'model': model },
                            // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                            dataType: 'json',
                            success: function (re) {
                                if (re.code == 1) {

                                    Toastr.success(re.msg);
                                    that.options.title.text = title;
                                    that.options.series = re.data;
                                    that.options.colors = ['#18BC9C'];
                                    that.count = re.count

                                    that.$nextTick(() => {
                                        Highcharts.chart('line-chart', that.options);

                                    })

                                } else {
                                    that.count = re.count
                                    that.options.series = [];
                                    that.$nextTick(() => {
                                        Highcharts.chart('line-chart', that.options);
                                    })
                                    // Toastr.error(re.msg);
                                }
                            }
                        });
                    },








                    yigecida() {
                        if (this.idsaa != 0) {
                            $('#containeone div').removeClass('tuichu').addClass('quanpin')
                            this.exitFullscreen()
                            console.log("123")
                            this.idsaa = 0

                            Echarts.init(document.getElementById('line-chart')).dispose();

                            this.$nextTick(() => { // 销毁实例                                            
                                this.get_chart_data(this.item_iid, this.point_id)
                            })
                        } else {

                            this.launchIntoFullscreen()
                            $('#containeone div').removeClass('quanpin').addClass('tuichu')
                            this.idsaa = 1
                            Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例 
                            this.$nextTick(() => {
                                this.get_chart_data(this.item_iid, this.point_id)
                            })
                        }



                    },

                    tabMap() {
                        var that = this
                        that.trafficLayer.setMap(that.map);

                        if (that.isVisible) {
                            that.trafficLayer.hide();
                            that.isVisible = false;
                            that.defaultType = 1
                            $('#containetwo').text("地图")



                        } else {
                            that.trafficLayer.show();
                            that.isVisible = true;
                            that.defaultType = 0
                            $('#containetwo').text("卫星")

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
                        if (document.fullscreenElement && document.exitFullscreen) {
                            document.exitFullscreen()
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
