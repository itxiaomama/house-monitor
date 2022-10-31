define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        add: function () {
            var engineering_id = $("#engineering_id").val();
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'engineering/engineering_staff/get_staffs' + location.search,
                    table: 'staff',
                }
            });
            var table = $("#table");
            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                height: $(window).height(),
                showToggle:false,
                showExport: false,
                search:false,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'staff_name', title: '名称'},
                        {field: 'phone', title: '手机'}
                    ]
                ],
                pagination:true
            });
            $(window).resize(function() {
                table.bootstrapTable('resetView', {
                    height: $(window).height()
                });
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
            // 点击确认
            $(document).on('click', '.btn-success-staff', function () {
                var ids = Table.api.selectedids(table);
                ids = ($.isArray(ids) ? ids.join(",") : ids);
                if(ids){
                    // 提交数据
                    $.ajax({
                        type: "POST",
                        url: "engineering/engineering_staff/add",
                        data: {'engineering_id': engineering_id,'ids': ids},
                        dataType: 'json',
                        error:function (re){
                            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                            parent.layer.close(index); //再执行关闭
                            parent.Toastr.error("操作失败");
                        },
                        success: function (re){
                            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                            parent.layer.close(index); //再执行关闭
                            if(re.code == 1){
                                parent.Toastr.success("操作成功");
                                parent.$("#table2").bootstrapTable('refresh');
                            }else{
                                parent.Toastr.error(re.msg);
                            }
                        }
                    });
                }
            });
            // 点击取消关闭窗口
            $(document).on('click', '.layer-close', function () {
                var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                parent.layer.close(index); //再执行关闭
            });
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
                // 点击取消关闭窗口
                $(document).on('click', '.layer-close', function () {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    parent.layer.close(index); //再执行关闭
                });
            }
        }
    };
    return Controller;
});
