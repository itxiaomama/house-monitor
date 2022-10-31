// define(['vue','jquery','bootstrap', 'backend', 'table', 'form', 'upload', 'bootstrap-daterangepicker'], function (Vue,$, undefined, Backend, Table, Form, Upload,) {
define(['vue', 'jquery', 'bootstrap', 'backend', 'table', 'form', 'addtabs', 'echarts', 'china', 'layer', 'looptip', 'citypicker', 'base64', 'template', 'bootstrap-daterangepicker'], function (Vue, $, undefined, Backend, Table, Form, Datatable, Echarts, china, bootstrap, Layer, looptip, citypicker, Template) {




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
        var
          ids = row.id + '#' + row.point_id + '#' + row.record_time;
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
          engineering: {},
          project: [],
          imgUr1: '',
          imgUr2: '',
          sho_img: 'shouall_img',
          rigiconshow: true,
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
          jingwei: [106.735869, 35.837817],
          jingwei2: [106.735869, 35.837817],
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
          dengone: 5,
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
          options: '',
          point_id: '',
          item_iid: '',
          unundd: '',
          tandata: '',
          citysf: '中国',
          numcishu: 0,
          cityname: '',
          Smarkers: [],
          status: 0,
          datetwo: [],
          lnglat:[],
          num:0

        },
        mounted() {
          $('.sho_img').mouseover(function () {
            $("sho_img").css("background", "../../assets/img/right_quank1.png");
          })
          $('.sho_img').mouseout(function () {
            $("sho_img").css("background", "../../assets/img/right_quank.png");
          })
          var _this = this
          //请求地图数据
          $.ajax({
            type: 'get',
            url: 'board/getEngPoint',
            dataType: 'json',
            success: function (res) {

              if (res.code == 200) {
                _this.dateone = res
                _this.datetwo = res.big
                // console.log(res)
              } else {
                return false
              }
            }
          })
          $.ajax({
            type: 'get',
            url: 'display/getStatus',
            dataType: 'json',
            success: function (res) {
             
              console.log(res.data)
              _this.status = res.data.status
              if (res.data.status === 1) {
                
                console.log(_this.datetwo)
                $(".shouall").hide()
                for(let i=0;i<_this.datetwo.length;i++){
                var l = _this.datetwo[i].lng
                var w = _this.datetwo[i].lat
                var leg = [l, w]
  
                _this.lnglat.push({ 'len': leg, 'id': _this.datetwo[i].id,'name': _this.datetwo[i].name,'city': _this.datetwo[i].city,'address': _this.datetwo[i].address,'finish_date': _this.datetwo[i].finish_date})
              }
            
                if(_this.datetwo.length>0){
                _this.xuanranyige(_this.lnglat[0])
              }

              } else {
                _this.zezhao(_this.citysf)
                _this.initMaps(_this.jingwei, _this.nik0, _this.dengone, 1)
                // window.render=_this.xuanranyige;
                // window.xiaohui=_this.destroyMap
                _this.mapEchart(_this.url, _this.mingz);
                var Item = document.getElementsByClassName('item');
                for (var i = 0; i < Item.length; i++) {
                  Item[i].className = 'item ' + _this.numList[i]
                }
              }

                //请求报警、监测类型数据
                $.ajax({
                  type: 'get',
                  url: 'display/getEngineTypeList',
                  dataType: 'json',
                  success: function (res) {
                    if (res.code == 1) {

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
                      _this.tandata = res.data
                    }
                  })
                  $('.new_tanc').fadeIn()
                }, 3000000)








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
                    var item_id = res[0].point[0].item_id
                    var model = res[0].point[0].model

                    $.ajax({
                      type: "get",
                      url: "display/getModel?mon_type_id=" + res[0].point[0].mon_type_id,
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


                        _this.point_id = id
                        _this.item_iid = item_id
                        _this.get_chart_data(_this.item_iid, _this.point_id);
                      }
                    });
                  }
                })
             
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
            $('.menu_tab').find('ul li:first-child').children('.tab_content').show(); //首行内容默认显示
            $(".menu_tab > ul > li").on("click", "label", function() {
       
              $(this).toggleClass('selected').next('.tab_content').slideToggle(500);
              $(this).parent().siblings().children('.tab_content').slideUp(500);
              $(this).parent().siblings().children('label').removeClass('selected');
       
              $("html,body").animate({scrollTop:0}, 500); // 切换menu_tab，整块内容移动到顶部
            })
      
            var $citypicker3 = $('#city-picker3');
            $citypicker3.citypicker('reset');
            $citypicker3.citypicker('destroy');
            $citypicker3.citypicker({
              province: '浙江省',
              city: '杭州市',
              district: '萧山区',
              county: '衙前镇'
            });
            console.log("123")
            $('.probox').children('.prolist').find('div:first-child').children('.prowarp').show();
            // $(".menu_tab > ul > li").on("click", "label", function() {
 
            //   $(document).toggleClass('selected').next('.tab_content').slideToggle(500);
            //   $(document).parent().siblings().children('.tab_content').slideUp(500);
            //   $(document).parent().siblings().children('label').removeClass('selected');
       
            //   $("html,body").animate({scrollTop:0}, 500); // 切换menu_tab，整块内容移动到顶部

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
                      // console.log(dat)
                      Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例
                      // _this.echartsthree('echartthree', dat)
                      _this.point_id = point_id
                      _this.item_iid = item_id
                      _this.get_chart_data(item_id, point_id)

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
                url: 'display/getModel?mon_type_id=' + _this.namegc[num].mon_type_id,
                dataType: 'json',
                success: function (res) {
                  var str = '';
                  _this.unundd = res.data
                  if (res.code == 200) {
                    // console.log(res)
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




            $(".mappro").delegate('.back_btn', 'click', function () {
              $('.Engineering').hide();

              // console.log(_this.numcishu)
              if (_this.numcishu == 1) {

                _this.numcishu = 0;
                _this.destroyMap()
                _this.dengone = 8;
                _this.initMaps(_this.jingwei, _this.nik0, _this.dengone, 2)
                _this.zezhao(sessionStorage.getItem('sfname'));
                _this.dianyuandian(_this.dateone)
                // console.log("省份等级",_this.dengone)
              }
              else if (_this.numcishu == 2) {
                _this.numcishu = 1;
                $('.leftWorp').show()
                _this.destroyMap()

                _this.dengone = 10;
                _this.initMaps(_this.jingwei2, _this.nik0, _this.dengone, 3)
                _this.zezhao(sessionStorage.getItem('cityname'));
                for (var i = 0; i < _this.dateone.big.length; i++) {
                  _this.dateone.big[i].color = '#f8983a'
                  _this.dateone.big[i].type = 'circle'
                }
                _this.mark = new FlashMarker(_this.MAps, _this.dateone.big);
                _this.markse(_this.dateone)
                // console.log("城市等级",_this.dengone)
              }
              else {  //直接返回初始化
                // console.log(_this.url, _this.mingz)
                $('.leftWorp').show()
                $('.back_btn').hide();
                $('.Engineering').hide();

                $('.MonitoringPoint').hide();
                // $('.xuanfu label input').attr("checked", false)
                // $('.xuanfu label .morenint').click()
                Echarts.init(document.getElementById('china_map')).dispose();
                _this.mapEchart(_this.url, _this.mingz);
                _this.destroyMap()
                _this.dengone = 5
                _this.numcishu = 0;
                _this.initMaps(_this.jingwei, _this.nik0, _this.dengone, 1)
                _this.zezhao('中国');

              }











            })

            // $('.xuanfu label input').click(function () {
            //     if ($(this).val() == 0) {
            //         _this.destroyMap()
            //         _this.index250 = 0
            //         _this.initMaps(_this.jingwei, _this.nik0, )
            //         _this.dianyuandian(_this.dateone)

            //         _this.MAps.setMapStyle('amap://styles/darkblue');
            //     } else if ($(this).val() == 1) {
            //         _this.destroyMap()
            //         _this.initMaps(_this.jingwei, _this.nik1, )
            //         _this.dianyuandian(_this.dateone)

            //         _this.index250 = 1

            //     } else if ($(this).val() == 2) {
            //         _this.destroyMap()
            //         _this.index250 = 2
            //         _this.initMaps(_this.jingwei, _this.nik2,)
            //         _this.dianyuandian(_this.dateone)

            //     } else {
            //         return false
            //     }
            // })

            $('.aa').css('color', '#fff')
            //悬浮按钮移入
            $(".right111").delegate('.right_persi', 'mouseenter', function () {
              if ($(this).attr('vlaue') == 1) {  //报警统计
                $('.left').css('display', 'none')
                $('#MonitoringPoint').fadeIn(1000)
                $(".centerwrap").fadeIn(500);
                $('#main2').fadeIn(1000)

                $('.right_pone').css('background', '#18BC9C')
                $('.right_ptwo').css('background', '#2c3a47')


              } else if ($(this).attr('vlaue') == 3) {
                $('#main2').css('display', 'none')
                $('#MonitoringPoint').fadeIn(1000)
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
                      $('#my-type').attr('title', '请选择')
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
                          url: "display/getModel?mon_type_id=" + res[0].point[0].mon_type_id,
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
            $('.zheabiao').click(function () {
              aa()
            })



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
              Highcharts.chart('line-chart', _this.options);
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
            function set_chart_data() {

              var min = $('#y_min').val();
              var max = $('#y_max').val();
              min = $.trim(min, '');
              max = $.trim(max, '');
              _this.options.yAxis.min = min;
              _this.options.yAxis.max = max;
              if (min === '') {
                delete _this.options.yAxis.min;
              }
              if (max === '') {
                delete _this.options.yAxis.max;
              }
              Highcharts.chart('line-chart', _this.options);
            };
            function set_chart_data() {

              var min = $('#y_min').val();
              var max = $('#y_max').val();
              min = $.trim(min, '');
              max = $.trim(max, '');
              _this.options.yAxis.min = min;
              _this.options.yAxis.max = max;
              if (min === '') {
                delete _this.options.yAxis.min;
              }
              if (max === '') {
                delete _this.options.yAxis.max;
              }
              Highcharts.chart('line-chart', _this.options);
            }









          });

        },


        methods: {
     
          // 高德地图
          initMaps(centers, nike, dengji, index) {
            console.log(centers)


            let i = 0
            let that = this;

            that.MAps = new AMap.Map("container", {
              resizeEnable: true,
              mapStyle: 'amap://styles/darkblue',
              viewMode: '3D',
              center: centers,
              layers: nike,
              zoom: dengji
            });


            that.MAps.plugin(["AMap.ToolBar",], function () {
              toolBar = new AMap.ToolBar({
                liteStyle: true,
                position: 'RT',
                offset: new AMap.Pixel(5, 27),
              });
              that.MAps.addControl(toolBar);

            });

            that.MAps.on('click', function (e) {
              var zuobiao = e.lnglat;
              //    that.regeoCode(zuobiao)

            })

            if (index === 1) {
              $('.mappro').css({ 'right': '0px' })
              $('.Engineering').hide()
              $('.MonitoringPoint').hide()
              $.ajax({
                type: "get",
                url: "display/getMapData",
                // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
                success: function (res) {
                  console.log(res)
                  let lal = []
                  let Smarkers = []
                  for (let i in res.data) {
                    var l = res.data[i].lng
                    var w = res.data[i].lat
                    leg = [l, w]
                    lal.push(leg)
                    var Smarker = new AMap.Marker({
                      position: lal[i],
                      map: that.MAps,
                      icon: '../../assets/img/mapicon.png',
                      iconSize: [50, 50],


                    });
                    Smarkers.push(Smarker)
                    Smarker.setLabel({
                      offset: new AMap.Pixel(10, 0),  //设置文本标注偏移量
                      content: "<div class='Spoint'><span>工程：</span><span class='pointdiv'>" + res.data[i].data.engineering_count + "</span><span>    项目：</span> <span class='pointdiv'>" + res.data[i].data.project_count + "</span><span>       设备：</span> <span class='pointdiv'>" + res.data[i].data.series_count + "</span>", //设置工程名称
                      direction: 'right' //设置文本标注方位
                    });
                    Smarker.setAnimation('AMAP_ANIMATION_BOUNCE');

                  }
                }
              })
            }



          },

          regeoCode(lnglat) {
            var _this = this
            var geocoder = new AMap.Geocoder({
              city: "010", //城市设为北京，默认：“全国”
              radius: 1000 //范围，默认：500
            });
            geocoder.getAddress(lnglat, function (status, result) {
              if (status === 'complete' && result.regeocode) {
                var address = result.regeocode.addressComponent.province;
                var zoom = 8.1
                _this.jingwei = lnglat
                //   _this.zezhao(address);
                //   _this.MAps.setZoomAndCenter(zoom,_this.jingwei);

              } else {
                console.log('根据经纬度查询地址失败')
              }
            });
          },
          gotoDetail(item,ids){
            this.num = ids;
  
            var _this=this
            
            _this.xuanranyige(item)
         
           
          
  

            
          },

      
          showMap() {

            var _this = this
            if ($('.mappro').css('right') === '0px') {
              $('.mappro').animate({ 'right': '-500px' })
              $('.shouall_img').removeClass('shouall_img').addClass('shouall_i')
              $('.sho_img2').removeClass('sho_img2').addClass('sho_img')
              _this.sho_img = 'shouall_i';
              setTimeout(() => {
                _this.rigiconshow = false;
              }, 1300);
            }
            if ($('.mappro').css('right') === '-500px') {
              $('.mappro').animate({ 'right': '0px' })
              $('.shouall_i').removeClass('shouall_i').addClass('shouall_img')
              $('.sho_img').removeClass('sho_img').addClass('sho_img2')
              _this.sho_img = 'shouall_img';
              _this.rigiconshow = true;
            }
          },

          zezhao(citysg) {
            console.log(citysg)
            // console.log(citysg)
            // var  polygons = []
            var that = this;

            //地图遮罩
            let opts = {
              subdistrict: 0,
              // 是否返回行政区边界坐标点
              extensions: "all",
              // 设置查询行政区级别为 区 
            };
            // 创建DistrictSearch对象
            const district = new AMap.DistrictSearch(opts);
            district.search(citysg, function (status, result) {
              // console.log(result)
              // 外多边形坐标数组和内多边形坐标数组
              var outer = [
                new AMap.LngLat(-360, 90, true),
                new AMap.LngLat(-360, -90, true),
                new AMap.LngLat(360, -90, true),
                new AMap.LngLat(360, 90, true),
              ];
              var holes = result.districtList[0].boundaries
              var pathArray = [
                outer
              ];
              // console.log(pathArray, holes)
              pathArray.push.apply(pathArray, holes)

              var polygon = new AMap.Polygon({
                pathL: pathArray,
                strokeColor: '#fff',
                strokeOpacity: 0.2, //线透明度
                strokeWeight: 1,
                fillColor: '#282C34',
                fillOpacity: 0.6
              });
              that.$nextTick(() => {
                polygon.setPath(pathArray);
                that.MAps.add(polygon)
              })

            })
          },


          xuanranyige(data) {
           console.log(data)
            $('.mappro').css({ 'right': '-500px' })
            $('.MonitoringPoint').hide()
            $('.leftWorp').hide()
            let _this = this;
            console.log(_this.status)
            if(_this.status===0){
              $('.prowarp').show()
            }
            $.ajax({
              type: "get",
              url: "engineering/engineering/getLalByIdS",
              data: { 'ids': data.id },
              // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
              dataType: 'json',
              success: function (res) {
                // console.log(res)
                var buildingLayer = new AMap.Buildings({
                  zIndex: 120,
                  merge: false,
                  sort: false,
                  zooms: [15, 20]
                });
                var options = {
                  hideWithoutStyle: true,//是否隐藏设定区域外的楼块
                  areas: [{ //围栏1
                    //visible:false,//是否可见
                    rejectTexture: true,//是否屏蔽自定义地图的纹理
                    color1: 'F21c40dd', //楼顶颜色
                    color2: 'D9001057', //楼面颜色0
                    path: eval('(' + res + ')')
                  }]
                }
                var baioutPath = [
                  [120.275524, 30.1273],
                  // [120.28003, 30.127438],
                  // [120.281065, 30.1280229],
                  // [120.281132, 30.131358],
                  [120.27563, 30.131354],
                  [120.27563, 30.131355],
                  [120.275524, 30.12731]
                ];
                var baioutPath1 = [
                  [120.275524, 30.127264],
                  // [120.28003, 30.127438],
                  // [120.281065, 30.1280229],
                  // [120.281132, 30.131358],
                  [120.276607, 30.127324],
                  [120.276607, 30.1273241],
                  [120.275524, 30.127265]
                ];
                var baioutPath2 = [
                  [120.27563, 30.131354],
                  [120.281052, 30.131368],
                  [120.281052, 30.1313681],
                  [120.27563, 30.1313541]
                ];
                var baioutPath3 = [
                  [120.281102, 30.131368],
                  [120.281044, 30.12934],
                  [120.281044, 30.129341],
                  [120.281102, 30.1313681]
                ];
                var baioutPath4 = [
                  [120.281037, 30.128709],
                  [120.281023, 30.128079],
                  [120.281023, 30.1280791],
                  [120.281037, 30.1287091]
                ];
                var baioutPath5 = [
                  [120.281023, 30.128079],
                  [120.280067, 30.127454],
                  [120.280067, 30.1274541],
                  [120.281023, 30.1280791]
                ];
                var baioutPath6 = [
                  [120.280067, 30.127454],
                  [120.277005, 30.127328],
                  [120.277005, 30.1273281],
                  [120.280067, 30.1274541]
                ];

                //红虚线
                var outPathred = [
                  [120.275504, 30.127334],
                  [120.276557, 30.127364],
                  [120.276557, 30.1273641],
                  // [120.281025, 30.1280409],
                  // [120.281092, 30.131384],
                  // [120.2756, 30.131384],
                  [120.275404, 30.127335]
                ];
                var outPathred1 = [
                  [120.275464, 30.1273],
                  [120.27556, 30.131354],
                  [120.27556, 30.131355],
                  [120.275464, 30.12731]
                ];
                var outPathred2 = [
                  [120.27563, 30.131484],
                  [120.281052, 30.131469],
                  [120.281052, 30.1314691],
                  [120.27563, 30.1314841]
                ];
                var outPathred3 = [
                  [120.281065, 30.131368],
                  [120.281014, 30.12934],
                  [120.281014, 30.129341],
                  [120.281065, 30.1313681]
                ];
                var outPathred4 = [
                  [120.281009, 30.128797],
                  [120.280999, 30.128207],
                  [120.280999, 30.1282071],
                  [120.281009, 30.1287971]
                ];
                var outPathred5 = [
                  [120.281003, 30.128129],
                  [120.280047, 30.127504],
                  [120.280047, 30.1275041],
                  [120.281003, 30.1281291]
                ];
                var outPathred6 = [
                  [120.280017, 30.127504],
                  [120.27698, 30.127388],
                  [120.27698, 30.1273881],
                  [120.280017, 30.1275041]
                ];

                //灰虚线
                var outPathhui = [
                  [120.2754454, 30.127394],
                  [120.276507, 30.127424],
                  [120.276507, 30.1274241],
                  // [120.281025, 30.1280409],
                  // [120.281092, 30.131384],
                  // [120.2756, 30.131384],
                  [120.2754464, 30.127395]
                ];
                var outPathhui1 = [
                  [120.275404, 30.1274],
                  [120.27547, 30.131404],
                  [120.27547, 30.131405],
                  [120.275404, 30.12741]
                ];
                var outPathhui2 = [
                  [120.27563, 30.131554],
                  [120.281052, 30.131559],
                  [120.281052, 30.1315591],
                  [120.27563, 30.1315541]
                ];
                var outPathhui3 = [
                  [120.281035, 30.131428],
                  [120.280985, 30.12944],
                  [120.280985, 30.129441],
                  [120.281035, 30.1314281]
                ];
                var outPathhui4 = [
                  [120.280979, 30.128867],
                  [120.280969, 30.128207],
                  [120.280969, 30.1282071],
                  [120.280979, 30.1288671]
                ];
                var outPathhui5 = [
                  [120.281, 30.128189],
                  [120.280007, 30.12754],
                  [120.280007, 30.1275401],
                  [120.281, 30.1281891]
                ];
                var outPathhui6 = [
                  [120.280007, 30.127554],
                  [120.27688, 30.127454],
                  [120.27688, 30.1274541],
                  [120.280007, 30.1275541]
                ];
                buildingLayer.setStyle(options); //此配色优先级高于自定义mapStyle
                var map = new AMap.Map("container", {
                  zoom: 20,
                  zooms: [18, 20],
                  mapStyle: 'amap://styles/913ff9ca8b2036114e01f9a0949021dd',
                  resizeEnable: true,
                  expandZoomRange: true,
                  showIndoorMap: false,
                  showLabel: true,
                  buildingAnimation: true,
                  pitch: 55,
                  zIndex: 140,
                  rotation: 38,
                  // mapStyle:'amap://styles/light',
                  center: data.len,
                  // center:eval('(' + res + ')')[0],
                  features: ['bg', 'point', 'road'],
                  viewMode: '3D',
                  layers: [
                    new AMap.TileLayer(),
                    buildingLayer,
                  ]
                });
                var object3Dlayer = new AMap.Object3DLayer({ zIndex: 1 });
                map.add(object3Dlayer);
                map.addControl(new AMap.Scale())
                new AMap.Polygon({
                  bubble: true,
                  fillOpacity: 0.4,
                  strokeWeight: 1,
                  path: options.areas[0].path,
                  map: map,
                  strokeColor: "#18bc9c",
                  fillColor: "#18bc9c"

                })
                let LabelsData = [
                  {
                    name: '广泽小区',
                    position: [120.278312, 30.129486],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '广泽小区',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 20,
                        fontWeight: 900,
                        fillColor: '#e9ff2f',
                        strokeColor: '#e9ff2f',
                        strokeWidth: 1
                        // z: 10000
                      }
                    }
                  },
                  {
                    name: '1幢',
                    position: [120.279665, 30.127807],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '1幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '2幢',
                    position: [120.279059, 30.127779],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '2幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '3幢',
                    position: [120.278506, 30.127774],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '3幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '4幢',
                    position: [120.277798, 30.127955],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '4幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '5幢',
                    position: [120.276961, 30.127691],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '5幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '6幢',
                    position: [120.276317, 30.127729],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '6幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '7幢',
                    position: [120.275759, 30.127729],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '7幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '8幢',
                    position: [120.276344, 30.128058],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '8幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '9幢',
                    position: [120.275716, 30.128049],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '9幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '10幢',
                    position: [120.275791, 30.128336],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '10幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '11幢',
                    position: [120.276371, 30.128336],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '11幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '12幢',
                    position: [120.276897, 30.12828],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '12幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '13幢',
                    position: [120.278501, 30.128183],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '13幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '14幢',
                    position: [120.278839, 30.128132],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '14幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '15幢',
                    position: [120.279354, 30.128122],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '15幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '16幢',
                    position: [120.279777, 30.128113],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '16幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '17幢',
                    position: [120.279879, 30.128424],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '17幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '18幢',
                    position: [120.27945, 30.128433],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '18幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '19幢',
                    position: [120.279037, 30.128447],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '19幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '20幢',
                    position: [120.278565, 30.128461],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '20幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '21幢',
                    position: [120.27798, 30.128526],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '21幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '22幢',
                    position: [120.277422, 30.128577],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '22幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '23幢',
                    position: [120.276934, 30.128572],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '23幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '24幢',
                    position: [120.276156, 30.128633],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '24幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '25幢',
                    position: [120.275695, 30.128651],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '25幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '26幢',
                    position: [120.275808, 30.128957],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '26幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '27幢',
                    position: [120.276301, 30.128962],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '27幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '28幢',
                    position: [120.276779, 30.128944],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '28幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '29幢',
                    position: [120.277438, 30.128902],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '29幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '30幢',
                    position: [120.277937, 30.128865],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '30幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '31幢',
                    position: [120.278404, 30.128869],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '31幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '32幢',
                    position: [120.278892, 30.128851],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '32幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '33幢',
                    position: [120.279327, 30.128809],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '33幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '34幢',
                    position: [120.279745, 30.128786],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '34幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '35幢',
                    position: [120.279772, 30.12912],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '35幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '36幢',
                    position: [120.279284, 30.129097],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '36幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '37幢',
                    position: [120.278833, 30.129101],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '37幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '38幢',
                    position: [120.278377, 30.129083],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '38幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '39幢',
                    position: [120.277911, 30.129129],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '39幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '40幢',
                    position: [120.277363, 30.129217],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '40幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '41幢',
                    position: [120.276752, 30.129236],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '41幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '42幢',
                    position: [120.276344, 30.129259],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '42幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '43幢',
                    position: [120.2757, 30.129282],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '43幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '44幢',
                    position: [120.275743, 30.129593],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '44幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '45幢',
                    position: [120.276194, 30.129593],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '45幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '46幢',
                    position: [120.276848, 30.129528],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '46幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '47幢',
                    position: [120.277347, 30.129551],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '47幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '48幢',
                    position: [120.277959, 30.129477],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '48幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '49幢',
                    position: [120.278914, 30.1295],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '49幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '50幢',
                    position: [120.279337, 30.129459],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '50幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '51幢',
                    position: [120.279734, 30.129486],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '51幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '52幢',
                    position: [120.279901, 30.129788],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '52幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '53幢',
                    position: [120.279316, 30.129769],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '53幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '54幢',
                    position: [120.278855, 30.129788],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '54幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '55幢',
                    position: [120.278426, 30.12976],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '55幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '56幢',
                    position: [120.277996, 30.129793],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '56幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '57幢',
                    position: [120.27746, 30.129807],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '57幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '58幢',
                    position: [120.2768, 30.12983],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '58幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '59幢',
                    position: [120.276296, 30.129853],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '59幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '60幢',
                    position: [120.275765, 30.129876],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '60幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '61幢',
                    position: [120.27577, 30.130215],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '61幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '62幢',
                    position: [120.27636, 30.130215],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '62幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '63幢',
                    position: [120.276891, 30.130196],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '63幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '64幢',
                    position: [120.277283, 30.130154],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '64幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '65幢',
                    position: [120.27797, 30.130136],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '65幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '66幢',
                    position: [120.278463, 30.130141],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '66幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '67幢',
                    position: [120.278871, 30.13015],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '67幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '68幢',
                    position: [120.279354, 30.130131],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '68幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '69幢',
                    position: [120.279751, 30.130094],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '69幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '70幢',
                    position: [120.279536, 30.130577],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '70幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '71幢',
                    position: [120.278806, 30.130628],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '71幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '72幢',
                    position: [120.278029, 30.130609],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '72幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '73幢',
                    position: [120.277208, 30.130577],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '73幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '74幢',
                    position: [120.276414, 30.130674],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '74幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '75幢',
                    position: [120.2757, 30.130693],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '75幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '76幢',
                    position: [120.276296, 30.131537],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '76幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '77幢',
                    position: [120.277208, 30.131481],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '77幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '78幢',
                    position: [120.278297, 30.131639],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '78幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '79幢',
                    position: [120.279423, 30.131551],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '79幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '80幢',
                    position: [120.280287, 30.131969],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '80幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '81幢',
                    position: [120.280485, 30.131129],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '81幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '82幢',
                    position: [120.280437, 30.130122],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '82幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '83幢',
                    position: [120.280426, 30.129514],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '83幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  },
                  {
                    name: '84幢',
                    position: [120.280394, 30.128586],
                    zooms: [10, 20],
                    opacity: 1,
                    zIndex: 0,
                    text: {
                      content: '84幢',
                      direction: 'bottom',
                      offset: [0, 0],
                      style: {
                        fontSize: 14,
                        fontWeight: 'normal',
                        fillColor: '#D8FFFF',
                        strokeColor: '#0081D2',
                        strokeWidth: 1
                      }
                    }
                  }
                ];
                let layer = new AMap.LabelsLayer({
                  zooms: [3, 20],
                  zIndex: 1000,
                  // 开启标注避让，默认为开启，v1.4.15 新增属性
                  collision: false,
                  // 开启标注淡入动画，默认为开启，v1.4.15 新增属性
                  animation: true
                });
                map.add(layer);
                let markerdong = [];
                for (let i = 0; i < LabelsData.length; i++) {
                  let curData = LabelsData[i];
                  curData.extData = {
                    index: i
                  };
                  // eslint-disable-next-line
                  let labelMarker = new AMap.LabelMarker(curData);
                  markerdong.push(labelMarker);
                  layer.add(labelMarker);
                }

                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath,
                  map: map
                });
                // console.log("123")
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath1,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath2,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath3,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath4,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath5,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 5,
                  strokeColor: '#9c9884',
                  strokeStyle: 'solid', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: baioutPath6,
                  map: map
                });

                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred,
                  map: map
                });

                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred1,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred2,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred3,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred4,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred5,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#D84C29',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathred6,
                  map: map
                });

                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui1,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui2,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui3,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui4,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui5,
                  map: map
                });
                new AMap.Polygon({
                  bubble: true,
                  fillColor: 'argb(.8, 120, 140, 120)',
                  fillOpacity: 0,
                  strokeWeight: 1,
                  strokeColor: '#ddd',
                  strokeStyle: 'dashed', // strokeDasharray: [10, 10],
                  strokeOpacity: 1,
                  strokeShadow: '#fff',
                  path: outPathhui6,
                  map: map
                });
              }
            })
            $.ajax({
              type: "get",
              url: "display/getEngineerInfo",
              data: { 'id': data.id },
              // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
              dataType: 'json',
              success: function (res) {
                $('.leftWorp').hide()
                _this.engineering = res.data.engineering_data
                _this.project = res.data.project
                $('.Engineering').show()
              }
            })
          },



          destroyMap() {
            this.MAps && this.MAps.destroy();
          },


          dianyuandian(data) {
            $('.leftWorp').hide()
            let _this = this;

            let arr = []

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
              // _this.dateone.small[i].color = '#18bc9c'
              // _this.dateone.small[i].type = 'circle'
            }

            // _this.mark = new FlashMarker(_this.MAps, _this.dateone.small);
            var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
            for (var i = 0; i < lnglats.length; i++) {
              var marker = new AMap.CircleMarker({
                center: lnglats[i],
                // Position: lnglats[i],
                // icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGpJREFUOE/NkrENgDAMBO8bGAQmYhiGYBgmIoNAYxSJdAYFTBHX/vefbREsBfU0bmBmnaTjCdNFMLMJWIABSMAsafWM7gy2S1w0SdJYZZBjA7vT3Hs4/yfIk8M7KPE/X+HNdzb+iTUoYYQTS3wjES/GKQ4AAAAASUVORK5CYII=",
                map: _this.MAps,
                radius: 4 + Math.random() * 10,//3D视图下，CircleMarker半径不要超过64px
                strokeColor: '#18bc9c',
                strokeWeight: 2,
                strokeOpacity: 0.5,
                fillColor: '#18bc9c',
                fillOpacity: 0.5,
                zIndex: 4,
                bubble: true,
                cursor: 'pointer',
                clickable: true
              });
              // 测点编号、设备名称、工程项目、所在位置、经纬度、有效日期。
              // console.log(marker, data.small[i])

              var htmlone = "<div class='point'><div><label>测点编号：</label>" + data.small[i].point_code + "</div><div><label>设备名称：</label>" + data.small[i].sensor_name + "</div><div><label>工程项目：</label>" + data.small[i].name + "</div><div><label>所在城市：</label>" + data.small[i].city + "</div><div><label>具体位置：</label>" + data.small[i].address + "</div><div><label>经纬度：</label>" + data.small[i].lng + "," + data.small[i].lat + "</div> <div><label>有效日期：</label>" + data.small[i].finish_date + "</div>"
              marker.content = htmlone;
              arr.push(htmlone)
              $(".arr").html(arr);
              $(".MonitoringPoint").show();

              marker.on('click', markerClick);   //为点标记绑定点击事件，
              // marker.emit('click', { target: marker });   //自动点击一个

            }
            function markerClick(e) {
              infoWindow.setContent(e.target.content);
              infoWindow.open(_this.MAps, e.target.getCenter());



            }


            // _this.MAps.setFitView();
            // _this.mark = new FlashMarker(_this.MAps, data.big);





          },
          markse(data) {
            // console.log(data)
            let _this = this;
            $(".MonitoringPoint").hide();
            var leg = {};
            var lnglats = []
            for (var i = 0; i < data.big.length; i++) {
              var l = data.big[i].lng
              var w = data.big[i].lat
              leg = [l, w]

              lnglats.push({ 'lal': leg, 'id': data.big[i].id, 'name': data.big[i].name })
            }
            // console.log(lnglats)
            // var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
            for (var i = 0; i < lnglats.length; i++) {

              var marker = new AMap.Marker({
                title: lnglats[i].name,
                position: lnglats[i].lal,
                offset: new AMap.Pixel(-19, -19),
                extData: {
                  id: lnglats[i].id,
                  len: lnglats[i].lal
                },
                icon: new AMap.Icon({
                  image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFRJREFUOE9jZKAQMFKon2HUAAbCYXBJjkFQ7xHDe1yBjTcQb8lxuPxj+Leb8d9/c/Unv09hM4RgLNyUZ2tVf/irmiwXEJNGCLqAkCGjBhCRkAgFIgAjYhARFtuhVAAAAABJRU5ErkJggg==",
                  // size: new AMap.Size(80, 80),  //图标大小
                  imageSize: new AMap.Size(40, 40)
                }),
                map: _this.MAps
              });
              marker.setLabel({
                offset: new AMap.Pixel(20, 20),  //设置文本标注偏移量
                content: "<div class='info'>" + lnglats[i].name + "</div>", //设置工程名称
                direction: 'right' //设置文本标注方位
              });
              marker.on('click', markerClick);
            }
            function markerClick(e) {
              var data = e.target.De.extData

              _this.xuanranyige(data)
              _this.numcishu = 2
              $('.leftWorp').show()



            }
          },
          showtK(x) {

            if (x === 2) {
              $(".Engineering").hide();
            }
          },


          get_chart_data(item_id, points) {
            let _this = this;
            var time = $('#my-time').val();
            var model = $('#my-type').val();

            var title = _this.unundd[model]




            $.ajax({
              type: "POST",
              url: "engineering/data/getEchart",
              data: { 'item_id': item_id, 'points': points, 'time': time, 'model': model },
              // data: { 'item_id': 74, 'points': [58], 'time': "2021-12-01 17:22:51 - 2021-12-07 17:32:51", 'model': 'data1', },
              dataType: 'json',
              success: function (re) {
                if (re.code == 1) {
                  Toastr.success(re.msg);
                  _this.options.title.text = title;
                  _this.options.series = re.data;
                  _this.options.colors = ['#18BC9C'];
                  Highcharts.chart('line-chart', _this.options);
                } else {
                  _this.options.series = [];
                  Highcharts.chart('line-chart', _this.options);
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
                    max: 1.5
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
                console.log(type)
                if (type == 'map') {

                  // 获取点击的省份名字和经纬度
                  var name = Sdata.name
                  _this.numcishu = 0
                  // console.log(_this.numcishu)
                  _this.cityname = name
                  sessionStorage.setItem('sfname', Sdata.name);
                  var jw = mapchart.convertFromPixel('geo', [Sdata.event.offsetX, Sdata.event.offsetY])
                  _this.jingwei = jw
                  // _this.destroyMap()
                  _this.dengone = 8
                  _this.initMaps(_this.jingwei, _this.nik0, _this.dengone, 2)
                  _this.$nextTick(() => {
                    _this.MAps.setZoomAndCenter(_this.dengone, _this.jingwei);
                    _this.zezhao(sessionStorage.getItem('sfname'));

                  })

                  // setTimeout(() => {
                  //     _this.MAps.setZoomAndCenter(_this.dengone, _this.jingwei);
                  // }, 500)

                  $('.back_btn').show();


                  var provinces = ['shanghai', 'hebei', 'shanxi', 'neimenggu', 'liaoning', 'jilin', 'heilongjiang', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong', 'henan', 'hubei', 'hunan', 'guangdong', 'guangxi', 'hainan', 'sichuan', 'guizhou', 'yunnan', 'xizang', 'shanxi1', 'gansu', 'qinghai', 'ningxia', 'xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen', 'taiwan'];

                  var provincesText = ['上海', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '北京', '天津', '重庆', '香港', '澳门', '台湾'];

                  for (var i = 0; i < provincesText.length; i++) {
                    if (name === provincesText[i]) {
                      // console.log(provinces[i])

                      Echarts.init(document.getElementById('china_map')).dispose();

                      _this.creatProvince(provinces[i]);

                      // 获取省份名字拼音然后渲染地图

                    }
                  }
                  _this.$nextTick(() => {
                    _this.dianyuandian(_this.dateone)
                  })

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
                  max: 1.5
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
              mapchart.resize()

            });


            mapchart.on('click', function (Sdata,) {
              var type = Sdata.componentSubType;
              if (type == 'map') {
                // 获取点击的城市名字
                _this.numcishu = 1

                var name = Sdata.name
                sessionStorage.setItem('cityname', Sdata.name);//重点在这里
                var jw = mapchart.convertFromPixel('geo', [Sdata.event.offsetX, Sdata.event.offsetY])
                _this.jingwei2 = jw
                // _this.destroyMap()
                _this.dengone = 10
                _this.initMaps(jw, _this.nik0, _this.dengone, 3)
                _this.$nextTick(() => {

                  _this.MAps.setZoomAndCenter(_this.dengone, jw);
                  _this.zezhao(sessionStorage.getItem('cityname'));
                })




                for (var i = 0; i < _this.dateone.big.length; i++) {
                  _this.dateone.big[i].color = '#f8983a'
                  _this.dateone.big[i].type = 'circle'
                }
                _this.mark = new FlashMarker(_this.MAps, _this.dateone.big);

                _this.markse(_this.dateone)





              }
            })



          },
          yigecida() {
            if (this.idsaa != 0) {
              $('#containeone').text('全屏')
              this.exitFullscreen()
              this.idsaa = 0


              Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例                                            
              this.get_chart_data(this.item_iid, this.point_id)


            } else {
              this.launchIntoFullscreen()
              $('#containeone').text('退出')
              this.idsaa = 1
              Echarts.init(document.getElementById('line-chart')).dispose(); // 销毁实例                      
              this.get_chart_data(this.item_iid, this.point_id)
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
