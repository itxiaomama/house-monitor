define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {



  var Controller = {
    index: function () {
      // 初始化表格参数配置
      Table.api.init();
      this.table.first();
      this.table.second();
    },
    table: {
      first: function () {
        // 表格1
        var table1 = $("#table1");
        table1.bootstrapTable({
          url: 'engineering/index/table1',
          toolbar: '#toolbar1',
          sortName: 'id',
          search: false,
          columns: [
            [
              // {field: 'state', checkbox: true,},
              { field: 'id', title: '监测项目' },
              { field: 'username', title: '项目数量' },
              {
                field: 'operate', title: '操作', table: table1, events: Table.api.events.operate, buttons: [
                  {
                    name: 'log',
                    title: '项目列表',
                    text: '项目列表',
                    icon: 'fa fa-list',
                    classname: 'btn btn-primary btn-xs btn-click',
                    click: function (e, data) {
                      $("#myTabContent2 .form-commonsearch input[name='username']").val(data.username);
                      $("#myTabContent2 .btn-refresh").trigger("click");
                    }
                  }
                ], formatter: Table.api.formatter.operate
              }
            ]
          ]
        });

        // 为表格1绑定事件
        Table.api.bindevent(table1);
      },
      second: function () {
        // 表格2
        var table2 = $("#table2");
        table2.bootstrapTable({
          url: 'engineering/index/table2',
          extend: {
            index_url: '',
            multi_url: '',
            table: '',
          },
          height: $(window).height() - 135,
          toolbar: '#toolbar2',
          sortName: 'status',
          sortOrder: 'asc',
          showToggle: false,
          showExport: false,
          search: false,
          columns: [
            [
              { field: 'id', title: '项目名称' },
              { field: 'username', title: '所属工程' },
              { field: 'title', title: '监测项目' },

            ]
          ],
          detailView: true,
          onExpandRow: function (index, row, $engineering_type) {
            Controller.api.initSubTable(index, row, $engineering_type);
          },
          responseHandler: function (res) {
            return res;
          },
          onLoadSuccess: function () {
            var trs = $('#table2 tbody').find('tr[data-index]');
            $.each(trs, function (m, n) {
              click_tr(m, n);
            })
            $('#table2 tbody tr').eq(0).find('.detail-icon').trigger('click');
          }
        });
        // 为表格2绑定事件
        Table.api.bindevent(table2);
        click_tr = function (index, dom) {
          if (dom == 'undefined') {
            return false;
          }
          $(dom).click(function () {
            $(dom).find('>td>.detail-icon').trigger('click')
          })
        };
        return table2


      }
    },
  };
  return Controller;
});
