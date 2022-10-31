define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
  var Controller = {
    operate: {
      'click .btn-item': function (e, value, row, index) {
        var url = 'engineering_type/monitor?id=' + row.id;
        $('#table2').bootstrapTable('refresh', { 'url': url });
      }
    },
    index: function () {
      // 初始化表格参数配置
      Table.api.init({
        extend: {
          index_url: 'engineering_type/index' + location.search,
          table: 'type',
        }
      });
      var table1 = $("#table1");
      // 初始化表格
      table1.bootstrapTable({
        url: $.fn.bootstrapTable.defaults.extend.index_url,
        pk: 'id',
        sortName: 'id',
        height: $(window).height() - 100,
        toolbar: '#toolbar1',
        showToggle: false,
        showExport: false,
        search: false,
        commonSearch: false,
        columns: [
          [
            {
              field: 'mon_item_name', title: '监测项目', events: this.operate, formatter: Controller.api.formatter.monitor
            },
            { field: 'count', title: '项目数量' },
            {
              field: 'operate', title: __('Operate'), table: table1, events: this.operate, buttons: [{
                text: '项目列表',
                icon: 'fa fa-bars',
                classname: 'btn btn-primary btn-xs btn-click',
                click: function (e, data) {
                  var url = 'engineering_type/monitor?id=' + data.id;
                  $('#table2').bootstrapTable('refresh', { 'url': url });
                }
              }], formatter: Table.api.formatter.operate
            }
          ]
        ],
        pagination: false,
        responseHandler: function (res) {
          return res;
        }
      });
      var table2 = $("#table2");
      // 初始化表格
      table2.bootstrapTable({
        url: '',
        toolbar: '#toolbar2',
        pk: 'id',
        sortName: 'id',
        height: $(window).height() - 100,
        showToggle: false,
        showExport: false,
        search: false,
        commonSearch: false,
        columns: [
          [
            { field: 'serial', title: '流水号', visible: false },
            { field: 'item_name', title: '项目名称', },
            { field: 'engineering_name', title: '所属工程', formatter: Controller.api.formatter.project },
            { field: 'mon_category_name', title: '监测项目', width: '120px' }
          ]
        ],
        detailView: true,//增加父子表,
        onExpandRow: function (index, row, $detail) {
          initSubTable(index, row, $detail);
        },
        pagination: true,
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
      click_tr = function (index, dom) {
        if (dom == 'undefined') {
          return false;
        }
        $(dom).click(function () {
          $(dom).find('> td > .detail-icon').trigger('click');
        });
      };
      $(window).resize(function () {
        table1.bootstrapTable('resetView', {
          height: $(window).height() - 100
        });
        table2.bootstrapTable('resetView', {
          height: $(window).height() - 100
        });
      });
      // 为表格绑定事件
      Table.api.bindevent(table1);
      Table.api.bindevent(table2);
      function initSubTable(index, row, $detail) {
        var parentid = row.id;
        var cur_table = $detail.html('<table></table>').find('table');
        $(cur_table).bootstrapTable({
          url: 'engineering_type/get_item_list',
          method: 'get',
          queryParams: { id: parentid },
          ajaxOptions: { id: parentid },
          uniqueId: "id",
          striped: false, //是否显示行间隔色
          pagination: false,//显示分页
          sidePagination: "server",
          clickToSelect: true,
          toolbar: '',
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
          columns: [
            {
              field: 'mon_type_name', title: '监测内容', operate: false,
              events: Controller.operate,
              formatter: function (value, row, index) {
                if (table2.data('operateData')) {
                  var url = '/engineering/data/index/ids/' + row.id;
                  return '<a href="' + url + '" title="数据管理" class="btn-addtabs">' + row.mon_type_name + '</a>';
                } else {
                  return row.mon_type_name;
                }
              }
            },
            { field: 'point_num', title: '测点数量', width: '100px', operate: false },
            {
              field: 'operate',
              title: '操作',
              width: '100px',
              table: cur_table,
              formatter: function (value, row, index) {
                this.buttons = [];
                if (table2.data('operateData')) {
                  this.buttons.push({
                    name: '数据管理',
                    text: '数据管理',
                    classname: 'btn btn-info btn-xs btn-detail btn-addtabs',
                    icon: 'fa fa-list-ul',
                    url: 'engineering/data/index'
                  });
                }
                return Table.api.formatter.operate.call(this, value, row, index);
              }
            },
          ],
          responseHandler: function (res) {
            return res;
          }
        });
      };
    },
    api: {
      bindevent: function () {
        Form.api.bindevent($("form[role=form]"));
      },
      formatter: {
        project: function (value, row, index) {
          if ($('#table2').data('operateProject')) {
            return '<a href="/hezhiyun/public/admin.php/engineering/project/detail/ids/' + row.project_id + '" class="btn-addtabs" title="项目管理">' + value + '</a>';
          } else {
            return value;
          }
          console.log($('#table2').data('operateProject'));

        },
        monitor: function (value, row, index) {
          return '<a href="javascript:;" class="btn-item" >' + value + '</a>';
        }
      }
    }
  };
  return Controller;
});
