define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        index: function () {
            //
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'example/baidumap/index',
                    add_url: 'example/baidumap/add',
                    edit_url: 'example/baidumap/edit',
                    del_url: 'example/baidumap/del',
                    multi_url: 'example/baidumap/multi',
                    table: '',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        { checkbox: true },
                        { field: 'id', title: 'ID', operate: false },
                        { field: 'admin_id', title: __('Admin_id'), visible: false, operate: false },
                        { field: 'username', title: __('Username'), formatter: Table.api.formatter.search },
                        { field: 'title', title: __('Title') },
                        { field: 'url', title: __('Url'), align: 'left' },
                        { field: 'ip', title: __('IP') },
                        { field: 'createtime', title: __('Create time'), formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange', sortable: true },
                        { field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate }
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        map: function () {
            Form.api.bindevent($("form[role=form]"));
            // Fast.api.query('name')
            var address = Fast.api.query('name')
            require(['async!BMap'], function () {
                // 更多文档可参考 http://lbsyun.baidu.com/jsdemo.htm
                // 百度地图API功能

                var map = new BMap.Map("allmap");
                var point = new BMap.Point(120.374294, 30.157024);

                map.centerAndZoom(point, 13); //设置中心坐标点和级别
                // var marker = new BMap.Marker(point);  // 创建标注
                // map.addOverlay(marker);               // 将标注添加到地图中
                // marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
                map.enableDragging();   //开启拖拽
                map.enableScrollWheelZoom(true); //是否允许缩放
                map.centerAndZoom(address, 10); //根据城市名设定地图中心点
                var styleJson = [{
                    "featureType": "land",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#091220ff"
                    }
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#113549ff"
                    }
                }, {
                    "featureType": "green",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#0e1b30ff"
                    }
                }, {
                    "featureType": "building",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "building",
                    "elementType": "geometry.topfill",
                    "stylers": {
                        "color": "#113549ff"
                    }
                }, {
                    "featureType": "building",
                    "elementType": "geometry.sidefill",
                    "stylers": {
                        "color": "#143e56ff"
                    }
                }, {
                    "featureType": "building",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#dadada00"
                    }
                }, {
                    "featureType": "subwaystation",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#113549B2"
                    }
                }, {
                    "featureType": "education",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "medical",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "scenicspots",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "weight": "4"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#fed66900"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "weight": "2"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffeebb00"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "arterial",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on",
                        "weight": "1"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#979c9aff"
                    }
                }, {
                    "featureType": "local",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffffff"
                    }
                }, {
                    "featureType": "railway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "weight": "1"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#d8d8d8ff"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#979c9aff"
                    }
                }, {
                    "featureType": "subway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffffff"
                    }
                }, {
                    "featureType": "continent",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "continent",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "continent",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "continent",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "city",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "city",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "city",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "city",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "town",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "town",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "town",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#454d50ff"
                    }
                }, {
                    "featureType": "town",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffffff"
                    }
                }, {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "poilabel",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "districtlabel",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "road",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "district",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "poilabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "poilabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "poilabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "manmade",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "districtlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffffff"
                    }
                }, {
                    "featureType": "entertainment",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "shopping",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "nationalway",
                    "stylers": {
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "stylers": {
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "stylers": {
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "stylers": {
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "stylers": {
                        "level": "10",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "10",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "10",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-10"
                    }
                }, {
                    "featureType": "cityhighway",
                    "stylers": {
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "stylers": {
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "stylers": {
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "stylers": {
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "off",
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "6",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "7",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "8",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off",
                        "level": "9",
                        "curZoomRegionId": "0",
                        "curZoomRegion": "6-9"
                    }
                }, {
                    "featureType": "subwaylabel",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "subwaylabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "tertiarywaysign",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "tertiarywaysign",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "provincialwaysign",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "provincialwaysign",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "nationalwaysign",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "nationalwaysign",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "highwaysign",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "highwaysign",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "village",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "district",
                    "elementType": "labels.text",
                    "stylers": {
                        "fontsize": "20"
                    }
                }, {
                    "featureType": "district",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "district",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "country",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "country",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "water",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "tertiaryway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "tertiaryway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff10"
                    }
                }, {
                    "featureType": "provincialway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "provincialway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "highway",
                    "elementType": "labels.text",
                    "stylers": {
                        "fontsize": "20"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "nationalway",
                    "elementType": "labels.text",
                    "stylers": {
                        "fontsize": "20"
                    }
                }, {
                    "featureType": "provincialway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "provincialway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "provincialway",
                    "elementType": "labels.text",
                    "stylers": {
                        "fontsize": "20"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels.text",
                    "stylers": {
                        "fontsize": "20"
                    }
                }, {
                    "featureType": "cityhighway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "estate",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "tertiaryway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "tertiaryway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "fourlevelway",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "fourlevelway",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "scenicspotsway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "scenicspotsway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "universityway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "universityway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "vacationway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "vacationway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "fourlevelway",
                    "elementType": "geometry",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "fourlevelway",
                    "elementType": "geometry.fill",
                    "stylers": {
                        "color": "#12223dff"
                    }
                }, {
                    "featureType": "fourlevelway",
                    "elementType": "geometry.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "transportationlabel",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "transportationlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "transportationlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "transportationlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "educationlabel",
                    "elementType": "labels",
                    "stylers": {
                        "visibility": "on"
                    }
                }, {
                    "featureType": "educationlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "educationlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "educationlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "transportation",
                    "elementType": "geometry",
                    "stylers": {
                        "color": "#113549ff"
                    }
                }, {
                    "featureType": "airportlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "airportlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "scenicspotslabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "scenicspotslabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "medicallabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "medicallabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "medicallabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "scenicspotslabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "airportlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "entertainmentlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "entertainmentlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "entertainmentlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "estatelabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "estatelabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "estatelabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "businesstowerlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "businesstowerlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "businesstowerlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "companylabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "companylabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "companylabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "governmentlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "governmentlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "governmentlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "restaurantlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "restaurantlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "restaurantlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "hotellabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "hotellabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "hotellabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "shoppinglabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "shoppinglabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "shoppinglabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "lifeservicelabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "lifeservicelabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "lifeservicelabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "carservicelabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "carservicelabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "carservicelabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "financelabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "financelabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "financelabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "otherlabel",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "otherlabel",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "otherlabel",
                    "elementType": "labels.icon",
                    "stylers": {
                        "visibility": "off"
                    }
                }, {
                    "featureType": "manmade",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "manmade",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "transportation",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "transportation",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "education",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "education",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "medical",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "medical",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }, {
                    "featureType": "scenicspots",
                    "elementType": "labels.text.fill",
                    "stylers": {
                        "color": "#2dc4bbff"
                    }
                }, {
                    "featureType": "scenicspots",
                    "elementType": "labels.text.stroke",
                    "stylers": {
                        "color": "#ffffff00"
                    }
                }]
                map.setMapStyleV2({
                    styleJson
                });
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});