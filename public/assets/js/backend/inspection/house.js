define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            console.log("111141")
            $(document).ready(function(){
                $("#SubmitHouse").click(function(){
                   console.log("房屋编号")
                });
            });
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/house/index' + location.search,
                    add_url: 'inspection/house/add',
                    edit_url: 'inspection/house/edit',
                    del_url: 'inspection/house/del',
                    multi_url: 'inspection/house/multi',
                    import_url: 'inspection/house/import',
                    table: 'house',
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
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'name', title: __('Name'), operate: 'LIKE'},
                        {field: 'type', title: __('Type'),formatter: Controller.api.formatter.type},
                        {field: 'year', title: __('Year'), operate: 'LIKE'},
                        {field: 'acreage', title: __('Acreage'), operate: 'LIKE'},

                        {field: 'province', title: '省', operate: 'LIKE',formatter: Controller.api.formatter.province},
                        {field: 'city', title: '市', operate: 'LIKE',formatter: Controller.api.formatter.city},
                        {field: 'area', title: '区', operate: 'LIKE',formatter: Controller.api.formatter.area},
                        {field: 'street', title: '街道', operate: 'LIKE',formatter: Controller.api.formatter.street},

                        {field: 'address', title: __('Address'), operate: 'LIKE'},
                        {field: 'lat', title: __('Lat'), operate: 'LIKE'},
                        {field: 'lng', title: __('Lng'), operate: 'LIKE'},
                        {field: 'structure', title: __('Structure'), operate: 'LIKE'},
                        {field: 'total_layer', title: __('Total_layer'), operate: 'LIKE'},
                        {field: 'on_layer', title: __('On_layer'), operate: 'LIKE'},
                        {field: 'un_layer', title: __('Un_layer'), operate: 'LIKE'},
                        {field: 'rate', title: __('Rate'), operate: 'LIKE',formatter: Controller.api.formatter.rate},
                        {field: 'use', title: __('Use'), operate: 'LIKE'},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
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
        get_house: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/house/get_house' + location.search,
                    edit_url:'inspection/house/edit',
                    add_url:'inspection/house/add',
                    table: 'house',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height() - 35,
                showToggle: false,
                showExport: false,
                search:false,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: '房屋编号'},
                        {field: 'name', title: '房屋名称'},
                        {field: 'operate', width:'100px', title: __('Operate'), table: table, events: this.operate, buttons: [{
                                name: 'plan',
                                title: '编辑',
                                icon: 'fa fa-pencil',
                                classname: 'btn btn-success btn-xs btn-plan-info',
                            }],formatter: function (value, row, index) {
                                var table = this.table;
                                // 默认按钮组
                                var buttons = $.extend([], this.buttons || []);
                                // 所有按钮名称
                                var names = [];
                                buttons.forEach(function (item) {
                                    names.push(item.name);
                                });
                                return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                            }
                        }
                    ]
                ],
                // singleSelect: true, //单选
                pagination:true
            });
            $(window).resize(function() {
                table.bootstrapTable('resetView', {
                    height: $(window).height() - 35
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.choose-plans', function () {
                var list = $('#table').bootstrapTable('getSelections');
                var ids   =   new Array();
                var names   =   new Array();

                var  house_name= '#house-name';
                var  house_id = '#house-id';
            

                $.each(list,function(i, value){
                    ids[i] = value.id;
                    names[i] = value.name;
                });
                var houseIds=ids.join(",")
                console.log(houseIds)
                $.ajax({
                    type: "POST",
                    url: '/JMRIUsnmLz.php/inspection/House/housePosition',
                    data:{
                        house_ids: houseIds
                    },
                    error: function (re) {
                        Toastr.error('操作失败');
                    },
                    success: function (re) {
                       console.log(re.data)
                       point=re.data.house_arr
                        } 
                    })
                if(ids){
                    parent.window.frames[0].$(house_name).val(names);
                    parent.window.frames[0].$(house_id).val(ids);
                }

                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击取消
            $(document).on('click', '.choose-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
            // 点击详情
            $(".btn-add").data("area",["600px","95%"]);
            $(".btn-add").data("title",'添加房屋');
            $(".btn-add").data("maxmin",false);
        },
    
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {
                type: function (value, row, index) {
                    if (value == 0) {
                        return '<span class="label label-success">房屋</span>';
                    } else {
                        return '<span class="label label-default">桥梁</span>';
                    }
                },
                rate: function (value, row, index) {
                    if (value == 1) {
                        return '<span class="label label-success">A级</span>';
                    } else if(value == 2) {
                        return '<span class="label label-default">B级</span>';
                    }else if(value == 3) {
                        return '<span class="label label-default">C级</span>';
                    }else if(value == 4) {
                        return '<span class="label label-default">D级</span>';
                    }
                },
                province: function (value, row, index) {
                    return row.citys[row.province];
                },
                city: function (value, row, index) {
                    return row.citys[row.city];
                },
                area: function (value, row, index) {
                    return row.citys[row.area];
                },
                street: function (value, row, index) {
                    return row.citys[row.street];
                },

            }
        }
    };
    return Controller;
});
