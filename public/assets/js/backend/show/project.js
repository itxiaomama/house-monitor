define(['jquery', 'bootstrap', 'backend', 'table', 'form','echarts'], function ($, undefined, Backend, Table, Form,Echarts) {

    var Controller = {
        operate:{
            'click .btn-report-info': function (e, value, row, index) {
                Layer.open({
                    type: 1,
                    title: '备注',
                    area: ['600px', '80%'],
                    offset: 'auto',
                    maxmin: true,
                    content: '<div class="content">'+row.remark+'</div>'
                });
            },
        },
        click_tr:function(index,dom){
            if(dom == 'undefined'){
                return false;
            }
            $(dom).click(function () {
                $(dom).find('> td > .detail-icon').trigger('click');
            });
        },
        //子表方法
        initSubTable:function (index, row, $detail) {
            console.log(row,'this is good');
            var parentid = row.id;  //项目id
            var cur_table = $detail.html('<table></table>').find('table');
            $(cur_table).bootstrapTable({
                url: 'show/project/get_child_list',
                method: 'get',
                queryParams: { id: parentid },
                ajaxOptions: { id: parentid },
                uniqueId: "id",
                striped: true, //是否显示行间隔色
                pagination: false,//显示分页
                sidePagination: "server",
                clickToSelect: true,
                pageNumber:1,
                toolbar:'',
                pageSize: 'all',
                pageList: [10, 25],
                //快捷搜索,这里可在控制器定义快捷搜索的字段
                search: false,
                //是否显示导出按钮
                showExport: false,
                //是否显示切换按钮
                showToggle: false,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: false,
                //自定义列表字段的显示
                showColumns: false,
                //控制筛选条件
                commonSearch: false,
                extend: {
                    edit_url: '',
                    del_url: '',
                },

                columns: [
                    {field: 'mon_type_name',title:'监测内容',width:800, operate:false,formatter:Controller.api.mon_type_name},
                    {field: 'point_num',title:'测点数量', operate:false},
                    {
                        field: 'operate',
                        title: '操作',
                        table: cur_table,
                        formatter:function (value,row,index) {
                            this.buttons = [];
                            /*     if(Config.point){
                                     this.buttons.push({
                                         name:'point',
                                         text: '测点管理',
                                         title: '测点管理',
                                         classname: 'btn btn-primary btn-xs btn-addtabs',
                                         icon: 'fa fa-map-marker',
                                         url: 'engineering/point/index'
                                     });
                                 }*/
                            // if(Config.data_index){
                            // if(1){
                                this.buttons.push({
                                    name:'查看数据',
                                    text: '查看数据',
                                    title: '查看数据',
                                    classname: 'btn btn-primary btn-xs btn-addtabs',
                                    icon: 'fa fa-area-chart',
                                    url: 'engineering/data/index'
                                });
                            // }

                            return  Table.api.formatter.operate.call(this, value, row, index);
                        }
                    },
                ],

            });

            $('.detail-view').find('.fixed-table-toolbar').css('display','none');

        },
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'show/project/index'+location.search,
                    add_url: 'show/project/add',
                    edit_url: 'show/project/edit',
                    del_url: 'show/project/del',
                    multi_url: 'show/project/multi',
                    table: 'project',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                //快捷搜索,这里可在控制器定义快捷搜索的字段
                search: false,
                striped: false, //是否显示行间隔色
                //导出下拉列表选项
                exportTypes: ['csv','excel'],
                //是否显示导出按钮
                showExport: false,
                //是否显示切换按钮
                showToggle: false,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                //自定义列表字段的显示
                showColumns: false,
                height: $(window).height()-155,

                columns: [
                    [
                        {field: 'item_name', title: '项目名称',operate:false},
                        {field: 'engineering_name', title: '工程名称',formatter:Controller.api.name,operate:'LIKE'},
                        {field: 'mon_item_name', title: '监测项目',operate:false},
                        {field: 'createtime', title: '创建时间', operate:'RANGE', addclass:'datetimerange',width:'140px',formatter:Table.api.formatter.datetime},
                    ]
                ],
                detailView:true,//增加父子表,
                onExpandRow:function(index,row,$detail){
                    Controller.initSubTable(index, row, $detail);
                },
                onLoadSuccess:function(){
                    var trs = $('#table tbody').find('tr[data-index]');

                    $.each(trs,function (m,n) {
                        Controller.click_tr(m,n);
                    })
                    $('#table tbody tr').eq(0).find('> td > .detail-icon').trigger('click');

                },
            });

            $('input').attr('autocomplete','off');

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        lists:function(){
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'show/project/lists'+location.search,
                    add_url: 'show/project/add',
                    edit_url: 'show/project/edit',
                    del_url: 'show/project/del',
                    multi_url: 'show/project/multi',
                    table: 'project',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                //快捷搜索,这里可在控制器定义快捷搜索的字段
                search: false,
                striped: false, //是否显示行间隔色
                //导出下拉列表选项
                exportTypes: ['csv','excel'],
                //是否显示导出按钮
                showExport: false,
                //是否显示切换按钮
                showToggle: false,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                //自定义列表字段的显示
                showColumns: false,
                height: $(window).height()-155,

                columns: [
                    [
                        {field: 'item_name', title: '项目名称',operate:false},
                        {field: 'engineering_name', title: '工程名称',formatter:Controller.api.name,operate:'LIKE'},
                        {field: 'mon_item_name', title: '监测项目',operate:false},
                        {field: 'createtime', title: '创建时间', operate:'RANGE', addclass:'datetimerange',width:'140px',extend:"autocomplete='off'",formatter:Table.api.formatter.datetime},
                    ]
                ],
                detailView:true,//增加父子表,
                onExpandRow:function(index,row,$detail){
                    Controller.initSubTable(index, row, $detail);
                },
                onLoadSuccess:function(){
                    var trs = $('#table tbody').find('tr[data-index]');

                    $.each(trs,function (m,n) {

                        Controller.click_tr(m,n);

                    })
                    $('#table tbody tr').eq(0).find('> td > .detail-icon').trigger('click');

                },
            });
            $('input').attr('autocomplete','off');
            // 为表格绑定事件
            Table.api.bindevent(table);
        },


        api: {
            name:function(value, row, index){
                if(Config.project_detail){
                    var html = '';
                    var url = Fast.api.fixurl('engineering/project/detail');
                    url+='/ids/'+row.id;
                    html+= '<a href="'+ url + '" class="btn-addtabs" title="项目管理">'+value+'</a>';
                    return html;
                }else{
                    return value;
                }
            },
            mon_type_name:function(value, row, index){

                if(Config.data_index){
                    var html = '';
                    var url = Fast.api.fixurl('engineering/data/index');
                    url+='/ids/'+row.id;
                    html+= '<a href="'+ url + '" class="btn-addtabs" title="数据管理">'+value+'</a>';
                    return html;
                }else{
                    return value;
                }
            },
            status: function (value, row, index) {
                var custom = {0: 'success', 1: 'gray'};
                if (typeof this.custom !== 'undefined') {

                    custom = $.extend(custom, this.custom);
                }
                this.custom = custom;
                this.icon = 'fa fa-circle';
                return Table.api.formatter.normal.call(this, value, row, index);
            },

            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },

            searchList: {//渲染的方法
                alarm: function (value, row, index) {
                    return '<select class="form-control" name="alarm_state"><option value="">选择</option><option value="0">正常</option><option value="1">预警</option><option value="2">报警</option><option value="3">控制</option></select>';
                }
            },
            formatter: {//渲染的方法
                alarm: function (value, row, index) {
                    switch (value) {
                        case 0:
                            return '<span class="label label-success">正常</span>';
                            break;
                        case 1:
                            return '<span class="label bg-yellow">预警</span>';
                            break;
                        case 2:
                            return '<span class="label label-warning">报警</span>';
                            break;
                        case 3:
                            return '<span class="label label-danger">控制</span>';
                            break;
                        default:
                            return '<span class="label label-default">其他</span>';
                    }
                },
                thumb: function (value, row, index) {

                    if(row.attachment){
                        return '<a href="' + row.fileurl + '" target="_blank"><img src="' + row.thumb + '" style="height:20px;width:20px"></a>';
                    }

                },
                content: function (value, row, index) {
                    if(value.length>10){
                        var url = 'engineering/staff_report/detail/ids/'+row.id;
                        value= value.substring(0,10)+'...'+'<a href="'+url+'" title="备注详情" data-area=\'["600px","85%"]\' class="btn btn-xs btn-dialog">详情</a>';
                    }
                    return "<div>" + value + "</div>";
                },
            }
        }
    };


    return Controller;
});
