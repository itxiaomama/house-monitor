define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        operate: {
            'click .btn-editone': function (e, value, row, index) {
                e.stopPropagation();
                e.preventDefault();
                var table = $(this).closest('table');
                var options = table.bootstrapTable('getOptions');
                var ids = row[options.pk];
                row = $.extend({}, row ? row : {}, {ids: ids});
                var url = options.extend.edit_url;
                $(this).data().area = ['600px','90%'];
                $(this).data().maxmin  = false;
                Fast.api.open(Table.api.replaceurl(url, row, table), '编辑', $(this).data() || {});
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
                Layer.confirm(
                    __('Are you sure you want to delete this item?'),
                    {icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true},
                    function (index) {
                        var table = $(that).closest('table');
                        var options = table.bootstrapTable('getOptions');
                        Table.api.multi("del", row[options.pk], table, that);
                        Layer.close(index);
                    }
                );
            }
        },

    index: function () {
        var agency_id = $("#agency_id").val();
        // 初始化表格参数配置
        Table.api.init({
            extend: {
                index_url: 'staff/index/ids/'+ agency_id+ '/'+ location.search,
                add_url: 'staff/add/agency_id/'+agency_id,
                edit_url: 'staff/edit',
                del_url: 'staff/del',
                multi_url: 'staff/multi',
                import_url: 'staff/import',
                table: 'staff',
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
                        {field: 'staff_name', title: __('Staff_name'), operate: 'LIKE'},
                        {field: 'duty', title: __('Duty'), operate: 'LIKE'},
                        {field: 'phone', title: __('Phone'), operate: 'LIKE'},
                        {field: 'project_count', title: __('Project_count')},
                        // {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: this.operate,
                            align:'left',
                            width: '150px',
                            formatter: function (value,row,index) {
                                if(row.admin_id == Config.admin_id){
                                    var url_edit = Fast.api.fixurl('staff/edit');
                                    url_edit+='/ids/'+row.id;
                                    var html = '';
                                    html+= '<a href="'+ url_edit + '" class="btn btn-xs btn-success btn-editone" title="编辑"><i class="fa fa-pencil"></i></a>';
                                    return html;
                                }else{
                                    if(row.groups == '*') {
                                        return '';
                                    }
                                }
                                this.buttons = [];
                                if(row.admin_id != Config.admin_id){
                                    this.buttons.push({
                                        name:'账号分配',
                                        text: '账号分配',
                                        title: '账号分配',
                                        extend: "data-area='[\"600px\",\"90%\"]' data-maxmin='false'",
                                        classname: 'btn btn-xs btn-primary btn-dialog',
                                        icon: 'fa fa-user-circle-o',
                                        url: 'staff/account_assignment_show',
                                        callback: function (data) {
                                            Toastr.success('分配成功');
                                            table.bootstrapTable('refresh', {});
                                        },
                                    });
                                }
                                return  Table.api.formatter.operate.call(this, value, row, index);
                            }
                        }
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
        account_assignment_show: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        },
    };
    return Controller;
});
