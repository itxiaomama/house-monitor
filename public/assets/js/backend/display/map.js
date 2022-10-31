var colors = ['#00ff00', '#ffff00', '#f39c12', '#e74c3c'];
var symbolSize = [6, 7, 7, 7];
var rippleEffect = [
  {
    'period': 0,
    'scale': 0,
    'brushType': 'stroke',
  },
  {
    'period': 6,
    'scale': 5,
    'brushType': 'stroke',
  },
  {
    'period': 4,
    'scale': 5,
    'brushType': 'stroke',
  },
  {
    'period': 1,
    'scale': 5,
    'brushType': 'stroke',
  }
];
var series = [];
var option3 = {
  title: {
    left: 'left',
    textStyle: {
      color: '#fff'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      var name = params.name;
      var seriesName = params.seriesName;
      var alarm = '正常';
      if (params.value[3] == 1) {
        alarm = '预警';
      } else if (params.value[3] == 2) {
        alarm = '报警';
      } else if (params.value[3] == 3) {
        alarm = '控制';
      } else {
        alarm = '正常';
      }
      return '工程名称：' + name + '<br>' + '监测单位：' + seriesName + '<br>' + '警情状态：' + alarm;
    },
    position: 'top',
  },
  geo: {
    map: 'china',
    zoom: 1.2,
    label: {
      normal: {
        show: false,
        position: 'center',
        color: '#ccc'
      },
      emphasis: {
        show: true,
        color: "#fff"
      }
    },
    roam: true,
    itemStyle: {
      normal: {
        areaColor: '#0b1c2d',
        borderColor: "rgba(43, 196, 243, 1)",
        borderWidth: 1
      },
      emphasis: {
        show: true,
        areaColor: "rgba(43, 196, 243, 0.42)",

      }
    }
  },
  series: series
};
var dom = document.getElementById("m-map");
var myChart3 = echarts.init(dom);
myChart3.setOption(option3);
myChart3.on('click', function (params) {
  var type = params.componentType;
  if (type == 'series') {
    var id = params.value[2];
    var url = 'engineering/project/detail/ids/' + id;
    var title = '项目管理';
    Backend.api.addtabs(url, title, 'fa fa-circle-o');
  } else {
    var url = 'dashboard/map?addr=' + params.name;
    $(this).data().area = ["900px", "90%"];
    $(this).data().title = '工程分布';
    Fast.api.open(url, '分布', $(this).data() || {});
  }
});

// 获取工程列表
var alarms = [];
var setId = 0;
$.ajax({
  type: "POST",
  url: "get_projects",
  dataType: 'json',
  success: function (re) {
    if (re.code == 1) {
      $.each(re.data, function (k, v) {
        if (v.alarm_state > 0) {
          alarms.push(k);
        }
        series.push({
          name: v.comp_name,
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: rippleEffect[v.alarm_state],
          label: {
            normal: {
              show: false,
              position: 'right'
            }
          },
          symbolSize: symbolSize[v.alarm_state],
          itemStyle: {
            normal: {
              color: colors[v.alarm_state]
            }
          },
          data: [{
            name: v.name,
            value: [v.lng, v.lat, v.id, v.alarm_state]
          }]
        });
      });
      option3.series = series;
      myChart3.setOption(option3);
      setId = setHourIndex();
    }
  }
});

myChart3.on('mouseover', function (params) {
  if (params.componentType == 'series') {
    clearHourIndex();
  }
});
myChart3.on('mouseout', function (params) {
  if (params.componentType == 'series') {
    setId = setHourIndex();
  }
});
var faultByHourIndex = 0;
function setHourIndex() {
  var faultByHourTime = setInterval(function () { //使得tootip每隔三秒自动显示
    myChart3.dispatchAction({
      type: 'showTip', // 根据 tooltip 的配置项显示提示框。
      seriesIndex: alarms[faultByHourIndex],
      dataIndex: 0
    });
    faultByHourIndex++;
    // faultRateOption.series[0].data.length 是已报名纵坐标数据的长度
    if (faultByHourIndex > alarms.length) {
      faultByHourIndex = 0;
    }
  }, 3000);
  return faultByHourTime;
}
function clearHourIndex() {
  var faultByHourTime = clearInterval(setId);
  return faultByHourTime;
}