define(['vue','jquery', 'bootstrap', 'backend', 'table', 'form'], function (Vue,$, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
           
       
        
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/inspection/index' + location.search,
                    add_url: 'inspection/inspection/add',
                    edit_url: 'inspection/inspection/edit',
                    del_url: 'inspection/inspection/del',
                    multi_url: 'inspection/inspection/multi',
                    import_url: 'inspection/inspection/import',
                    table: 'inspection',
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
                        { field: 'id', title: __('Id') },
                        { field: 'name', title: '任务名称', operate: 'LIKE' },
                        { field: 'house_name', title: '建筑物名称', operate: 'LIKE' },
                        {
                            field: 'address', title: '工程地址', operate: 'LIKE', formatter: function (value, row, index) {
                                // 默认按钮组
                                return row.city + '-' + row.address;
                            }
                        },
                        { field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        { field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        {
                            field: 'join_staff_name', title: __('join_staff_name'),  formatter:function (value, row, index) {
                                return row.join_staff_name;
                            },
                            searchList: Controller.api.searchList.join_staff_name,
                            

                        },
                        { field: 'super_staff_name', title: __('Super_staff_name'), 
                        formatter:function (value, row, index) {
                            // 默认按钮组
                            return row.super_staff_name;
                        },searchList: Controller.api.searchList.super_staff_name
},
                        { field: 'status', title: __('Status'), formatter: Controller.api.formatter.status,searchList: Controller.api.searchList.status },
                        { field: 'type', title: '类型', formatter: Controller.api.formatter.type,searchList: Controller.api.searchList.type },
                        // { field: 'type', title: '类型', formatter: Controller.api.formatter.type },

                        { field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate }
                    ]
                ]
            });
                   
          
          

            // 为表格绑定事件
            Table.api.bindevent(table);
            new Vue({
                el: '#app',
                data: {
                  mark: 0,
                  alarm_count: 0,
                  alarm: [],
                  imgs: [],
                  point:[]
                },
                mounted() {
                    var that=this
                },
                methods: {
                    see(){
                        console.log("点击选择")
                        var house_id = $('#house-id').val();
                        var point
                        console.log(house_id)
                        $.ajax({
                            type: "POST",
                            url: '/JMRIUsnmLz.php/inspection/House/housePosition',
                            data:{
                                house_ids: house_id
                            },
                            error: function (re) {
                                Toastr.error('操作失败');
                            },
                            success: function (re) {
                               console.log(re.data)
                               point=re.data.house_arr
                                } 
                            })
                        if (house_id != 0) {
                            $('#map').show()
                            let that = this;
                             that.point=point
                            }else {
                            Layer.alert('未选择房屋',
                                { icon: 4, title: __('Warning') },
                                function (index) {
                                    Layer.close(index);
                                }
                            );
                        }
                    }, 
     
                    // 高德地图
                    initMaps() {

                     
          
          
                      let i = 0
                      let that = this;
                      console.log(that.point)
          
                      that.MAps = new AMap.Map("map", {
                        resizeEnable: true,
                        mapStyle: 'amap://styles/darkblue',
                        viewMode: '3D',
                        center: [that.point[0].lat,that.point[0].lng],
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
                    }}
                })
            
            
        },
        // add: function () {
        //     Controller.api.bindevent();
        // },
        add: function () {
            // 点击确认

            $(document).on('click', '.btn-submit', function () {
                var that = this;
                //验证通过提交表单
                Form.api.submit($("form[role=form]"), function (data, ret) {
                    // console.log(data);
                    var index = parent.Layer.getFrameIndex(window.name);
                    parent.Layer.close(index);
                    parent.$('#table').bootstrapTable('refresh');
                    parent.Toastr.success("成功");
                }, function (data, ret) {
                    // console.log(data);
                    var index = parent.Layer.getFrameIndex(window.name);
                    parent.Layer.close(index);
                    parent.Toastr.success("失败");
                });
            });
            // 选择方案
            $(document).on('click', '.m-plan', function () {
                var option = {
                    type: 2,
                    shadeClose: false,
                    area: ["80%", "95%"],
                    shade: 0.4,
                    moveOut: false,
                    maxmin: false
                };
                parent.Fast.api.open('inspection/house/get_house', '选择房屋', option);
         
            });
            // 点击查看
            // $(document).on('click', '.c-plan', function () {
         
              
            // });

            // 点击取消关闭窗口
            $(document).on('click', '.layer-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 巡检类型
            $("#project_all").hide();
            $("#point_all").hide();
            $(document).on('change', '#type', function () {
                var type = $("#type").val();

                if (type == 2) {  //测点
                    $("#project_all").show();
                    $("#point_all").show();
                } else if (type == 1) { //建筑物
                    $("#project_all").hide();
                    $("#point_all").hide();
                }
            });


            //项目选择
            $("#c-project_id").data("params", function (obj) {
                return { engineering_id: $("#engineering_id").val() };
            });

            //测点选择
            $("#c-point_id").data("params", function (obj) {
                return { project_id: $("#c-project_id").val() };
            });


            Controller.api.bindevent();

        },
        edit: function () {
            //监测类型为 测点时显示
            var type = $("#type").val();

            if (type == 2) {  //测点
                $("#project_all").show();
                $("#point_all").show();
            } else if (type == 1) { //建筑物
                $("#project_all").hide();
                $("#point_all").hide();
            }

            $(document).on('change', '#type', function () {
                var type = $("#type").val();

                if (type == 2) {  //测点
                    $("#project_all").show();
                    $("#point_all").show();
                } else if (type == 1) { //建筑物
                    $("#project_all").hide();
                    $("#point_all").hide();
                }
            });
            //项目选择
            $("#c-project_id").data("params", function (obj) {
                return { engineering_id: $("#engineering_id").val() };
            });

            //测点选择
            $("#c-point_id").data("params", function (obj) {
                return { project_id: $("#c-project_id").val() };
            });

            Controller.api.bindevent();
        },
        
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {
                status: function (value, row, index) {
                    if (value == 0) {
                        return '<span class="label label-success">未巡检</span>';
                    } else {
                        return '<span class="label label-default">已巡检</span>';
                    }
                },
                type: function (value, row, index) {
                    if (value == 1) {
                        return '建筑物';
                    } else if (value == 2) {
                        return '传感器';
                    }
                },
                join_staff_name:function (value, row, index) {
                    if (value == 17) {
                        return 'xhxh';
                    } else if (value == 23) {
                        return '卢修平';
                    }else if(value==34){
                        return 'abc';
                    }
                },
                super_staff_name:function (value, row, index) {
                    if (value == 17) {
                        return 'xhxh';
                    } else if (value == 23) {
                        return '卢修平';
                    }else if(value==34){
                        return 'abc';
                    }
                },
            },
            searchList: {
                status: function (value, row, index) {
                    return '<select class="form-control" name="status"><option value="">选择</option><option value="0">未巡检</option><option value="1">已巡检</option></select>';
                },
                type: function (value, row, index) {
                    return '<select class="form-control" name="type"><option value="">选择</option><option value="1">建筑物</option><option value="2">传感器</option></select>';
                },
                join_staff_name: function (value, row, index) {
                    return '<select class="form-control" name="join_staff_name"><option value="">选择</option><option value="17">xhxh</option><option value="23">卢修平</option><option value="34">abc</option></select>';
                },
                super_staff_name: function (value, row, index) {
                    return '<select class="form-control" name="super_staff_name"><option value="">选择</option><option value="17">xhxh</option><option value="23">卢修平</option><option value="34">abc</option></select>';
                },
            }
            
         }


        };
        return Controller;
    });
