define(['jquery', 'vue', 'bootstrap', 'backend', 'table', 'form'], function ($, Vue, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            new Vue({
                el: '#app',
                data: {
                    formData: '20',
                    optionData: {},
                    checkboxArr: [],
                    result: [],
                    From1: [],

                    From: {

                        build_place: [],
                        build_env: [],
                        build_his_disaster: [],
                        build_repair: [],
                        build_structure: [],
                        build_identify: [],
                        survey_ground: [],
                        survey_floor: [],
                        survey_floor_other: [],
                        survey_floor_morph: [],
                        survey_floor_crack: [],
                        survey_floor_damage: [],
                        survey_house: [],
                        survey_house_crack: [],
                        survey_house_damage: [],
                        survey_house_flat: [],
                        survey_house_morph: [],
                        survey_house_other: [],
                        survey_stairs: [],
                        survey_wall: [],
                        survey_wall_morph: [],
                        survey_wall_crack: [],
                        survey_wall_damage: [],
                        survey_wall_other: [],
                        survey_attach: [],
                        survey_board: [],
                        survey_deck: [],
                        survey_door: [],
                        change: [],
                        build_change: [],
                        build_layer_up: '',
                        build_layer_down: '',
                        build_add_layer: '',
                        remark: '',

                    },
                },
                mounted() {

                },
                activated() {
                    if (('#ios').css('display') === 'block') {
                        this.getdata()
                    }
                },
                methods: {
                    getdata() {
                        var manual_id = $('#manual_id').val()
                        var inspection_id = $('#c-id').val()
                        var that = this
                        console.log(manual_id, inspection_id)
                        $.ajax({
                            type: "POST",
                            url: '/JMRIUsnmLz.php/Manual/getManualInfo',
                            data: {
                                manual_id: manual_id,
                                inspection_id: inspection_id
                            },

                            success: function (res) {
                                that.checkboxArr = res.data.data
                                console.log(that.checkboxArr)
                                that.From.build_layer_up = res.data.result.build_layer_up
                                that.From.build_layer_down = res.data.result.build_layer_down
                                that.From.build_add_layer = res.data.result.build_add_layer
                                that.From.remark = res.data.result.remark

                                that.result = res.data.result
                                if (res.data.result.build_place !== null) {
                                    that.From.build_place = res.data.result.build_place.split(',')
                                }
                                if (res.data.result.build_env !== null) {
                                    that.From.build_env = res.data.result.build_env.split(',')
                                }
                                if (res.data.result.build_his_disaster !== null) {
                                    that.From.build_his_disaster = res.data.result.build_his_disaster.split(',')
                                }
                                if (res.data.result.build_repair !== null) {
                                    that.From.build_repair = res.data.result.build_repair.split(',')
                                }
                                if (res.data.result.build_structure !== null) {
                                    that.From.build_structure = res.data.result.build_structure.split(',')
                                }
                                if (res.data.result.build_identify !== null) {
                                    that.From.build_identify = res.data.result.build_identify.split(',')
                                }
                                if (res.data.result.build_change !== null) {
                                    that.From.build_change = res.data.result.build_change.split(',')
                                }
                                if (res.data.result.change !== null) {
                                    that.From.change = res.data.result.change.split(',')
                                }


                                if (res.data.result.survey_board !== null) {
                                    that.From.survey_board = res.data.result.survey_board.split(',')
                                }
                                if (res.data.result.survey_deck !== null) {
                                    that.From.survey_deck = res.data.result.survey_deck.split(',')
                                }
                                if (res.data.result.survey_door !== null) {
                                    that.From.survey_door = res.data.result.survey_door.split(',')
                                }
                                if (res.data.result.survey_attach !== null) {
                                    that.From.survey_attach = res.data.result.survey_attach.split(',')
                                }
                                if (res.data.result.survey_floor !== null) {
                                    that.From.survey_floor = res.data.result.survey_floor.split(',')
                                }
                                if (res.data.result.survey_floor_crack !== null) {
                                    that.From.survey_floor_crack = res.data.result.survey_floor_crack.split(',')
                                }
                                if (res.data.result.survey_floor_damage !== null) {
                                    that.From.survey_floor_damage = res.data.result.survey_floor_damage.split(',')
                                }
                                if (res.data.result.survey_floor_morph !== null) {
                                    that.From.survey_floor_morph = res.data.result.survey_floor_morph.split(',')
                                }
                                if (res.data.result.survey_floor_other !== null) {
                                    that.From.survey_floor_other = res.data.result.survey_floor_other.split(',')
                                }
                                if (res.data.result.survey_ground !== null) {
                                    that.From.survey_ground = res.data.result.survey_ground.split(',')
                                }
                                if (res.data.result.survey_house !== null) {
                                    that.From.survey_house = res.data.result.survey_house.split(',')
                                }
                                if (res.data.result.survey_house_crack !== null) {
                                    that.From.survey_house_crack = res.data.result.survey_house_crack.split(',')
                                }
                                if (res.data.result.survey_house_damage !== null) {
                                    that.From.survey_house_damage = res.data.result.survey_house_damage.split(',')
                                }
                                if (res.data.result.survey_house_flat !== null) {
                                    that.From.survey_house_flat = res.data.result.survey_house_flat.split(',')
                                }
                                if (res.data.result.survey_house_morph !== null) {
                                    that.From.survey_house_morph = res.data.result.survey_house_morph.split(',')
                                }
                                if (res.data.result.survey_house_other !== null) {
                                    that.From.survey_house_other = res.data.result.survey_house_other.split(',')
                                }
                                if (res.data.result.survey_stairs !== null) {
                                    that.From.survey_stairs = res.data.result.survey_stairs.split(',')
                                }
                                if (res.data.result.survey_wall !== null) {
                                    that.From.survey_wall = res.data.result.survey_wall.split(',')
                                }
                                if (res.data.result.survey_wall_crack !== null) {
                                    that.From.survey_wall_crack = res.data.result.survey_wall_crack.split(',')
                                }
                                if (res.data.result.survey_wall_damage !== null) {
                                    that.From.survey_wall_damage = res.data.result.survey_wall_damage.split(',')
                                }
                                if (res.data.result.survey_wall_morph !== null) {
                                    that.From.survey_wall_morph = res.data.result.survey_wall_morph.split(',')
                                }
                                if (res.data.result.survey_wall_other !== null) {
                                    that.From.survey_wall_other = res.data.result.survey_wall_other.split(',')
                                }


                            }
                        })
                    },
                    getFrom() {
                        var confirm_audit = $('#examine').val()
                        $.ajax({
                            type: "POST",
                            url: '/JMRIUsnmLz.php/inspection/inspection_audit/confirmAudit',
                            data: {
                                confirm_audit: manual_id,
                                inspection_id: inspection_id
                            },

                            success: function (res) {
                                alert("审核提交成功！")
                            }
                        })
                    },
                }
            });
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/inspection_audit/index' + location.search,
                    add_url: 'inspection/inspection_audit/add',
                    edit_url: 'inspection/inspection_audit/edit',
                    del_url: 'inspection/inspection_audit/del',
                    multi_url: 'inspection/inspection_audit/multi',
                    import_url: 'inspection/inspection_audit/import',
                    detail_url: 'inspection/inspection_audit/detail',
                    table: 'inspection_audit',
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
                                // console.log(row.city)
                                if (row.address !== null) {
                                    // 默认按钮组
                                    return row.city + '-' + row.address;
                                } else {
                                    return '-'
                                }
                            }
                        },
                        { field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        { field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', autocomplete: false },
                        { field: 'audit_status', title: __('审核状态'), formatter: Controller.api.formatter.audit_status },

                        {
                            field: 'operate', width: '170px', title: __('Operate'), table: table, events: this.operate, buttons: [
                                {
                                    name: 'detail',
                                    text: '审核',
                                    icon: 'fa fa-bars',
                                    classname: 'btn btn-primary btn-xs btn-addtabs',
                                    url: 'inspection/inspection_audit/detail'
                                }
                            ], formatter: Table.api.formatter.operate
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
        detail: function () {
            $(document).on("fa.event.appendfieldlist", "#second-form .btn-append", function (e, obj) {
                Form.events.selectpage(obj);
                Form.events.datetimepicker(obj);
            });
            //因为日期选择框不会触发change事件，导致无法刷新textarea，所以加上判断
            $(document).on("dp.change", "#second-form .datetimepicker", function () {
                $(this).parent().prev().find("input").trigger("change");
            });
            $(document).on("click", ".btn-append", function () {
                Form.events.plupload("#add-form");
            });
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter: {
                audit_status: function (value, row, index) {
                    if (value == 0) {
                        return '<span class="label label-default">未审核</span>';
                    } else if (value == 1) {
                        return '<span class="label label-success">审核通过</span>';
                    } else if (value == 2) {
                        return '<span class="label label-warning">驳回</span>';
                    }
                },
            }
        },

    };
    return Controller;
});
