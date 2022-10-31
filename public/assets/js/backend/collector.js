define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'collector/index' + location.search,
                    add_url: 'collector/add',
                    edit_url: 'collector/edit',
                    del_url: 'collector/del',
                    multi_url: 'collector/multi',
                    import_url: 'collector/import',
                    table: 'collector',
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
                        {field: 'dev_code', title: __('Dev_code'), operate: 'LIKE'},
                        {field: 'devicemodel.model', title: __('Devicemodel.model'), operate: 'LIKE'},
                        {field: 'owe_date', title: __('Owe_date'), operate:'RANGE', addclass:'datetimerange', autocomplete:false},
                        {field: 'owe_date', title: __('Owe_date'), operate:false,formatter: function (value,row,index) {
                                var newDate = dateFormat("YYYY-mm-dd", new Date());
                                if(value != '' && value > newDate){
                                    return '<span class="label label-success">正常</span>';
                                }else{
                                    return '<span class="label label-danger">欠费</span>';
                                }
                            }},
                        {
                            field: 'id',
                            title: '通道详情',
                            operate:false,
                            width: '100px',
                            visible:Config.channel,
                            formatter: Controller.api.channel_setting,
                        },
                        {field: 'online_state', title: '在线状态',operate:false,formatter: Controller.api.online_state},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: this.operate,
                            width: '160px',
                            align:'left',
                            formatter: function (value,row,index) {
                                this.buttons = [];

                                if(table.data('operateUselog')) {
                                    this.buttons.push(
                                        {
                                            name: '使用情况',
                                            text: '使用情况',
                                            title: '使用情况',
                                            icon: 'fa fa-list-ul',
                                            classname: 'btn btn-xs btn-primary btn-addtabs',
                                            url:function () {
                                                var url = "device/uselog/index?dev_id=" + row.id;
                                                return Fast.api.fixurl(url);
                                            },
                                        }
                                    );
                                }
                                if(table.data('operateDatapost')) {
                                    this.buttons.push(
                                        {
                                            name: '原始数据',
                                            text: '原始数据',
                                            title: '原始数据',
                                            icon: 'fa fa-bars',
                                            classname: 'btn btn-xs btn-primary btn-addtabs',
                                            url:function () {
                                                var url = "device/acquisition/datapost?dev_code=" + row.dev_code;
                                                return Fast.api.fixurl(url);
                                            },
                                        }
                                    );
                                }
                                if(table.data('operateBack') && row.online_state == 1) {
                                    this.buttons.push(
                                        {
                                            name: 'ajax',
                                            title: '回调',
                                            text: '回调',
                                            classname: 'btn btn-xs btn-primary btn-magic btn-ajax',
                                            icon: 'fa fa-rss',
                                            width: '100px',

                                        }
                                    );
                                }
                                if(table.data('operateBack') && row.online_state == 1 && row.mod_id == 53) {
                                    this.buttons.push(
                                        {
                                            name: 'ajax',
                                            title: '远程配置',
                                            text: '远程配置',
                                            classname: 'btn btn-xs btn-primary btn-addtabs',
                                            icon: 'fa fa-rss',
                                            width: '100px',
                                            url:function () {
                                                var url = "device/acquisition/set?ids=" + row.id;
                                                return Fast.api.fixurl(url);
                                            }
                                        }
                                    );
                                }
                                return  Table.api.formatter.operate.call(this, value, row, index);

                            }
                        }
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);

            function dateFormat(fmt, date) {
                let ret;
                const opt = {
                    "Y+": date.getFullYear().toString(),        // 年
                    "m+": (date.getMonth() + 1).toString(),     // 月
                    "d+": date.getDate().toString(),            // 日
                    "H+": date.getHours().toString(),           // 时
                    "M+": date.getMinutes().toString(),         // 分
                    "S+": date.getSeconds().toString()          // 秒
                    // 有其他格式化字符需求可以继续添加，必须转化成字符串
                };
                for (let k in opt) {
                    ret = new RegExp("(" + k + ")").exec(fmt);
                    if (ret) {
                        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                    };
                };
                return fmt;
            }
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            channel_setting:function(value,row,index){

                url = "device/channel?" + this.field + "=" + value;
                return '<a href="' + url + '" class="btn btn-xs btn-primary addtabsit" data-icon=\'fa fa-cog\' title="通道详情"><i class="fa fa-info-circle"></i> 通道 </a>';
            },
            online_state: function (value, row, index) {
                if(value==1){
                    return '<span class="label label-success">在线</span>';

                }else{
                    return '<span class="label label-default">离线</span>';

                }
            },
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
