// define(['jquery', 'bootstrap', 'backend', 'addtabs', 'layui', 'echarts',], function ($, undefined, Backend, Datatable, Layui, Echarts) {
//   var Controller = {
//     index: function () {
//       //这句话在多选项卡统计表时必须存在，否则会导致影响的图表宽度不正确
//       $(document).on("click", ".charts-custom a[data-toggle=\"tab\"]", function () {
//         var that = this;
//         setTimeout(function () {
//           var id = $(that).attr("href");
//           var chart = Echarts.getInstanceByDom($(id)[0]);
//           chart.resize();
//         }, 0);
//       });

//       //初始化echarts实例  地图

      



//       //基于准备好的dom，初始化echarts实例



//       // 查看工程详情
//       $(document).on('click', '.show-map', function () {
//         var url = 'engineering/project/layout';
//         $(this).data().area = ["100%", "100%"];
//         $(this).data().title = '工程分布';
//         $(this).data().maxmin = false;
//         Fast.api.open(url, '分布', $(this).data() || {});
//       });
//     },
//     change: function () {

//     },
//     api: {
//       formatter: {//渲染的方法
//         alarm: function (value, row, index) {
//           switch (value) {
//             case 0:
//               return '<i class="fa fa-square" aria-hidden="true" style="color: #009688;"> 正常</i>';
//               break;
//             case 1:
//               return '<i class="fa fa-square" aria-hidden="true" style="color: #FFCC00;"> 预警</i>';
//               break;
//             case 2:
//               return '<i class="fa fa-square" aria-hidden="true" style="color: #FF6600;"> 报警</i>';
//               break;
//             case 3:
//               return '<i class="fa fa-square" aria-hidden="true" style="color: #ed5565;"> 控制</i>';
//               break;
//             default:
//               return '<i class="fa fa-square" aria-hidden="true" style="color: #009688;"> 其他</i>';
//           }
//         }
//       }
//     }

//   };
//   return Controller;
// });
// // 获取数据量统计
// // function get_data_num(url) {
// //     $.ajax({
// //         type: "POST",
// //         url: url,
// //         dataType: 'json',
// //         success: function (re) {
// //             if (re.code == 1) {
// //                 var count = re.count;
// //                 var arr = count.split('');
// //                 var num = 9 - arr.length;
// //                 $.each(arr, function (k, v) {
// //                     var n = num + k + 1;
// //                     $('#d' + n).html(v);
// //                 }); 

// //             }
// //         }
// //     });
// // }
// // setInterval(function () {
// //     get_data_num('dashboard/get_datas');
// // }, 2000);
// // 获取类型统计
// // $.ajax({
// //     type: "POST",
// //     url: "get_monitors",
// //     dataType: 'json',
// //     success: function (re) {
// //         if (re.code == 1) {
// //             $('#m-type-1').text(re.num1);
// //             $('#m-type-2').text(re.num2);
// //             $('#m-type-3').text(re.num3);
// //             $('#m-type-4').text(re.num4);
// //             $('#m-type-5').text(re.num5);
// //             $('#m-type-6').text(re.num6);
// //         }
// //     }
// // });
// // 获取设备总数、报警总数、
// $.ajax({
//   type: "POST",
//   url: "get_census_num",
//   dataType: 'json',
//   success: function (re) {
//     if (re.code == 1) {
//       // 设备
//       $('#dev-num').text(re.devices);
//       // 报警
//       $('#alarm-num').text(re.alarms);
//       // 年累计项目
//       $('#year').text(' ' + re.year + ' ');
//       // 月累计项目
//       $('#moon').text(' ' + re.moon + ' ');
//       var series = [{
//         value: re.moon,
//         name: '月累计'
//       },
//       {
//         value: re.year,
//         name: '年累计'
//       }
//       ];
//       option4.series[0].data = series;
//       option4.series[1].data = series;
//       myChart4.setOption(option4, true);
//     }
//   }
// });
// // 设备统计
// var maxData = 20;
// var option1 = {
//   tooltip: {},
//   grid: {
//     left: '1%',
//     right: '30',
//     top: '1%',
//     bottom: '1%',
//     containLabel: true
//   },
//   xAxis: {
//     max: maxData,
//     offset: 10,
//     axisLine: {
//       show: false
//     },
//     axisLabel: {
//       show: false
//     },
//     splitLine: {
//       show: false
//     }
//   },
//   yAxis: {
//     data: ['锚索测力计', '钢筋计', '应变计', '土压力计', '激光测距仪', '渗压计', '拉线位移计', '固定测斜仪', '双轴倾角计', '静力水准仪'],
//     inverse: true,
//     axisTick: {
//       show: false
//     },
//     axisLine: {
//       show: false
//     },
//     axisLabel: {
//       color: '#fff',
//     }
//   },
//   series: [{
//     type: 'pictorialBar',
//     itemStyle: {
//       normal: {
//         color: function (params) {
//           var colorList = ['#38FFF3', '#38FFF3', '#38FFF3', '#38FFF3',
//             '#38FFF3', '#38FFF3', '#38FFF3', '#38FFF3', '#38FFF3',
//             '#38FFF3'
//           ];
//           return colorList[params.dataIndex];
//         }
//       },
//     },
//     symbol: '',
//     symbolRepeat: 'fixed',
//     symbolMargin: '1',
//     symbolClip: true,
//     symbolSize: ['4', '80%'],
//     symbolBoundingData: maxData,
//     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     z: 10
//   }, {
//     type: 'pictorialBar',
//     itemStyle: {
//       normal: {
//         opacity: 0.2,
//         color: '#ccc',
//       },
//     },
//     label: {
//       show: true,
//       position: 'right',
//       offset: [0, 0],
//       color: '#fff',
//       fontSize: 12
//     },
//     animationDuration: 0,
//     symbolRepeat: 'fixed',
//     symbolMargin: '1',
//     symbol: '',
//     symbolSize: ['4', '80%'],
//     symbolBoundingData: maxData,
//     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     z: 5
//   }]
// };
// var dom1 = document.getElementById("m-dev");
// var myChart1 = echarts.init(dom1);
// // myChart1.setOption(option1, true);
// // 获取设备统计
// $.ajax({
//   type: "POST",
//   url: "get_devices",
//   dataType: 'json',
//   success: function (re) {
//     if (re.code == 1) {
//       if (re.max > maxData) {
//         maxData = re.max
//       }
//       option1.xAxis.max = maxData;
//       option1.yAxis.data = re.yAxis;
//       option1.series[0].data = re.series;
//       option1.series[0].symbolBoundingData = maxData;
//       option1.series[1].data = re.series;
//       option1.series[1].symbolBoundingData = maxData;
//       myChart1.setOption(option1, true);
//     }
//   }
// });
// // 获取报警统计
// $.ajax({
//   type: "POST",
//   url: "get_alarms",
//   dataType: 'json',
//   success: function (re) {
//     if (re.code == 1) {
//       $('#alarm-count').text(re.count);
//       $('#alarm-today').text(re.today);
//       var str = '';
//       var alarms = ['正常', '预警', '报警', '控制'];
//       $.each(re.list, function (k, v) {
//         var id = v.alarm_id;
//         var item_name = v.item_name;
//         var point_code = v.point_code;
//         var alarm = alarms[v.alarm_state];
//         var alarm_time = v.create_date;
//         var url = 'exception/alarm/detail/ids/' + id;
//         str += '<a href="' + url +
//           '" class="btn-addtabs" title="警情管理"><div class="row1"><span class="col">' +
//           point_code + '</span><span class="col">' + item_name +
//           '</span><span class="col">' + alarm_time +
//           '</span> <span class="col">' + alarm +
//           '</span> <span class="icon-dot"></span> </div> </a>';
//       });
//       $('#m-list').html(str);
//     }
//   }
// });
// // 项目完工统计
// var option2 = {
//   tooltip: {
//     trigger: 'item',
//     formatter: '{a} <br/>{b}: {c} ({d}%)'
//   },
//   legend: {
//     show: false
//   },
//   series: [{
//     name: '项目数量',
//     type: 'pie',
//     radius: ['45%', '47%'],
//     avoidLabelOverlap: false,
//     center: ['50%', '55%'],
//     label: {
//       show: false,
//       position: 'center',
//       color: '#fff'
//     },
//     emphasis: {
//       label: {
//         show: true,
//         fontSize: '20',
//         fontWeight: 'bold'
//       }
//     },
//     labelLine: {
//       show: false
//     },
//     hoverAnimation: false,
//     itemStyle: {
//       normal: {
//         color: function (params) {
//           var colorList = [{
//             c1: '#F8D172', //管理
//             c2: '#03142D'
//           },
//           {
//             c1: '#03142D', //实践
//             c2: '#38FFF3'
//           },
//           ];
//           return new echarts.graphic.LinearGradient(1, 0, 0, 1,
//             [{ //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
//               offset: 0,
//               color: colorList[params.dataIndex].c1
//             }, {
//               offset: 1,
//               color: colorList[params.dataIndex].c2
//             }])
//         }
//       }
//     },
//     data: [{
//       value: 0,
//       name: '进行中'
//     },
//     {
//       value: 0,
//       name: '已完工'
//     }
//     ]
//   },
//   {
//     name: '项目数量',
//     type: 'pie',
//     radius: ['50%', '70%'],
//     avoidLabelOverlap: false,
//     center: ['50%', '55%'],
//     label: {
//       show: false,
//       position: 'center',
//       color: '#fff'
//     },
//     emphasis: {
//       label: {
//         show: true,
//         fontSize: '20',
//         fontWeight: 'bold'
//       }
//     },
//     labelLine: {
//       show: false
//     },
//     itemStyle: {
//       emphasis: {
//         shadowBlur: 10,
//         shadowOffsetX: 0,
//         shadowColor: 'rgba(0, 0, 0, 0.5)'
//       },
//       normal: {
//         color: function (params) {
//           var colorList = [{
//             c1: '#F8D172', //管理
//             c2: '#03142D'
//           },
//           {
//             c1: '#03142D', //实践
//             c2: '#38FFF3'
//           },
//           ];
//           return new echarts.graphic.LinearGradient(1, 0, 0, 1,
//             [{ //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
//               offset: 0,
//               color: colorList[params.dataIndex].c1
//             }, {
//               offset: 1,
//               color: colorList[params.dataIndex].c2
//             }])
//           /*  return colorList[params.dataIndex]*/
//         }
//       }
//     },
//     data: [{
//       value: 0,
//       name: '进行中'
//     },
//     {
//       value: 0,
//       name: '已完工'
//     }
//     ]
//   }
//   ]
// };
// var dom2 = document.getElementById("m-item2");
// var myChart2 = echarts.init(dom2);
// myChart2.setOption(option2, true);
// // 项目完工统计
// var option4 = {
//   tooltip: {
//     trigger: 'item',
//     formatter: '{a} <br/>{b}: {c} ({d}%)'
//   },
//   legend: {
//     show: false
//   },
//   series: [{
//     name: '项目数量',
//     type: 'pie',
//     radius: ['45%', '47%'],
//     avoidLabelOverlap: false,
//     center: ['50%', '55%'],
//     label: {
//       show: false,
//       position: 'center',
//       color: '#fff'
//     },
//     emphasis: {
//       label: {
//         show: true,
//         fontSize: '20',
//         fontWeight: 'bold'
//       }
//     },
//     labelLine: {
//       show: false
//     },
//     hoverAnimation: false,
//     itemStyle: {
//       normal: {
//         color: function (params) {
//           var colorList = [{
//             c1: '#F14D42',
//             c2: '#03142D'
//           },
//           {
//             c1: '#03142D',
//             c2: '#42BEFD'
//           },
//           ];
//           return new echarts.graphic.LinearGradient(1, 0, 0, 1,
//             [{ //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
//               offset: 0,
//               color: colorList[params.dataIndex].c1
//             }, {
//               offset: 1,
//               color: colorList[params.dataIndex].c2
//             }])
//         }
//       }
//     },
//     data: [{
//       value: 0,
//       name: '月累计'
//     },
//     {
//       value: 0,
//       name: '年累计'
//     }
//     ]
//   },
//   {
//     name: '项目数量',
//     type: 'pie',
//     radius: ['50%', '70%'],
//     avoidLabelOverlap: false,
//     center: ['50%', '55%'],
//     label: {
//       show: false,
//       position: 'center',
//       color: '#fff'
//     },
//     emphasis: {
//       label: {
//         show: true,
//         fontSize: '20',
//         fontWeight: 'bold'
//       }
//     },
//     labelLine: {
//       show: false
//     },
//     itemStyle: {
//       emphasis: {
//         shadowBlur: 10,
//         shadowOffsetX: 0,
//         shadowColor: 'rgba(0, 0, 0, 0.5)'
//       },
//       normal: {
//         color: function (params) {
//           var colorList = [{
//             c1: '#F14D42',
//             c2: '#03142D'
//           },
//           {
//             c1: '#03142D',
//             c2: '#42BEFD'
//           },
//           ];
//           return new echarts.graphic.LinearGradient(1, 0, 0, 1,
//             [{ //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
//               offset: 0,
//               color: colorList[params.dataIndex].c1
//             }, {
//               offset: 1,
//               color: colorList[params.dataIndex].c2
//             }])
//         }
//       }
//     },
//     data: [{
//       value: 0,
//       name: '月累计'
//     },
//     {
//       value: 0,
//       name: '年累计'
//     }
//     ]
//   }
//   ]
// };
// var dom4 = document.getElementById("m-item1");
// var myChart4 = echarts.init(dom4);
// myChart4.setOption(option4, true);
// // 获取项目完工统计
// $.ajax({
//   type: "POST",
//   url: "get_items",
//   dataType: 'json',
//   success: function (re) {
//     if (re.code == 1) {
//       var series = re.series;
//       option2.series[0].data = series;
//       option2.series[1].data = series;
//       myChart2.setOption(option2, true);
//       $('#m-run').text(' ' + series[0].value + ' ');
//       $('#m-end').text(' ' + series[1].value + ' ');
//     }
//   }
// });
// // 合作伙伴
// var size = 10;
// var swiper = new Swiper('#case4', {
//   loop: true, //允许从第一张到最后一张，或者从最后一张到第一张  循环属性
//   slidesPerView: size, // 设置显示三张
//   centeredSlides: true, //使当前图片居中显示
//   freeMode: true, // 使幻灯片滑动时不止滑动一格，且不会自动贴合
//   slidesPerGroup: 1, //定义1张图片为一组
//   // autoplay: true,//可选选项，自动滑动
//   speed: 8000, //设置过度时间
//   grabCursor: true, //鼠标样式根据浏览器不同而定
//   autoplay: {
//     delay: 1,
//     disableOnInteraction: true,
//   },
//   /*  设置每隔3000毫秒切换 */
//   pagination: {
//     el: '.swiper-pagination',
//     clickable: true,
//   },
//   scrollbar: {
//     el: '.swiper-scrollbar',
//     hide: true,
//   },
// });
// /* 鼠标悬停 停止动画 */
// $('.swiper-slide').mouseenter(function () {
//   swiper.autoplay.stop();
// })
// $('.swiper-slide').mouseleave(function () {
//   swiper.autoplay.start();
// })
// // 自适应
// $(window).resize(function () {
//   setHeight();
// });

// function setHeight() {
//   var h = $(window).height();

//   var h1 = $('.tr1').height();
//   var h2 = $('.tr3').height();
//   var h3 = (h - h1 - h2 - 0.005 * h) / 2;
//   $('.tr2').height(h3);

//   var h_1 = $('#m-dev').height();
//   var w_1 = $('#m-dev').width();
//   myChart1.resize(w_1, h_1);

//   var w = $(window).width();
//   var w1 = 3 * (w - 30) / 10;
//   var w2 = 5 * (w1) / 10;
//   var h4 = 6 * h3 / 10;
//   myChart2.resize(w2, h4);
//   myChart4.resize(w2, h4);
//   var h5 = 80 * (h - h1 - h2 - 0.005 * h) / 100;
//   var w3 = 4 * (w - 30) / 10;
//   myChart3.resize(w3, h5);
//   $('#case4').width(w - 50);
// }

// var h = $(window).height();
// var h1 = $('.tr1').height();
// var h2 = $('.tr3').height();
// var h3 = (h - h1 - h2 - 0.005 * h) / 2;
// $('.tr2').height(h3);
// $('.td2').height(h3);
// var w = $(window).width();
// $('#case4').width(w - 50);
// var w1 = 3 * (w - 30) / 10;
// var w2 = 7 * (w1) / 10 - 30;
// var h4 = 6 * h3 / 10 - 15;