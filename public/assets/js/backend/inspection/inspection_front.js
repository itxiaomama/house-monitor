define(['jquery', 'vue', 'bootstrap', 'backend', 'table', 'form'], function ($, Vue, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/inspection_front/index' + location.search,
                    add_url: 'inspection/inspection_front/add',
                    edit_url: 'inspection/inspection_front/edit',
                    del_url: 'inspection/inspection_front/del',
                    multi_url: 'inspection/inspection_front/multi',
                    import_url: 'inspection/inspection_front/import',
                    detail_url: 'inspection/inspection_front/detail',
                    table: 'inspection_front',
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
                            field: 'operate', width: '170px', title: __('Operate'), table: table, events: this.operate, buttons: [
                                {
                                    name: 'detail',
                                    text: '巡检',
                                    icon: 'fa fa-bars',
                                    classname: 'btn btn-primary btn-xs btn-addtabs',
                                    url: 'inspection/inspection_front/detail'
                                }
                            ], formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });


            new Vue({
                el: '#app',
                data: {
                    house_name: "",
                    house_address: "",
                    InputBox_show: false,
                    title: '未巡检',
                    Timeout: '超时',
                    Data: [{}],
                    SearchData: [],
                    DefaultData: [],
                    isScroll: true,
                    offset: 1,
                    month: [],
                    num: new Date().getMonth() - 5
                },
                mounted() {
                    let _this = this
                    console.log(_this.num)
                    _this.RequestData()
                    window.addEventListener('scroll', this.initHeight, true);
                    _this.getScrollTop();
                },
                methods: {
                    Search() {
                        let _this = this
                        $.ajax({
                            type: 'get',
                            url: 'inspection/inspection_front?search=' + _this.house_name,
                            success: function (res) {
                                _this.SearchData = res.rows;
                                _this.Data = _this.SearchData;
                            }
                        })
                    },
                    changeInput() {
                        let _this = this;
                        if (_this.house_name == '') {
                            _this.Data = _this.DefaultData;
                        }
                    },
                    InputShow() {
                        console.log('111')
                        this.InputBox_show = true
                    },
                    RequestData() {
                        let _this = this
                        $.ajax({
                            type: 'get',
                            url: 'inspection/inspection_front?offset=0&limit=10',
                            success: function (res) {
                                _this.Data = res.rows
                                _this.DefaultData = res.rows;
                                console.log(_this.Data, '这是未巡检的')
                                _this.getMonthBetween(res.start, res.end)
                            }
                        })
                    },
                    leftbtn() {
                        console.log("123")
                        var that = this
                        var liW = $(".box_wheel li").width()
                        //			获取li元素的长度(个数)
                        var len = $(".box_wheel li").length
                        //			计算ul的总宽度
                        var ulW = len * liW
                        //			设置ul的宽度
                        $(".box_wheel").css("width", ulW)

                        that.index--  //索引自加
                        if (that.index == -1) {//判断如果索引为-1了，就让它为最后一个li元素的索引
                            that.index = len - 1
                        }
                        that.showLi(that.index)
                    },
                    rightbtn() {
                        var that = this
                        var liW = $(".box_wheel li").width()
                        //			获取li元素的长度(个数)
                        var len = $(".box_wheel li").length
                        //			计算ul的总宽度
                        var ulW = len * liW
                        //			设置ul的宽度
                        $(".box_wheel").css("width", ulW)
                        that.index++  //索引自减
                        if (that.index == len) {//判断如果索引超过长度了，就让它为第一个li元素的索引
                            that.index = 0
                        }
                        that.showLi(that.index)
                    },

                    showLi(index) {
                        var liW = 1220
                        var move = -index * liW
                        $(".box_wheel").stop().animate({ "left": move }, 300)
                    },
                    getMonthBetween(start, end) {
                        let _this = this
                        //传入的格式YYYY-MM
                        var result = []
                        var s = start.split('-')
                        var e = end.split('-')
                        var min = new Date()
                        var max = new Date()
                        min.setFullYear(s[0], s[1]);
                        //设置结束时间
                        max.setFullYear(e[0], e[1]);
                        //复制一份起始时间对象
                        var curr = min;
                        //定义字符串
                        var str = "";
                        //起始时间在结束时间之前
                        while (curr <= max) {
                            //获取此时间的月份
                            var month = curr.getMonth();
                            //如果月份为0，也就是代表12月份
                            if (month === 0) {
                                str = (curr.getFullYear() - 1) + "-" + 12;
                            } else {//正常月份
                                str = curr.getFullYear() + "-" + (month < 10 ? ("0" + month) : month);
                            }
                            //将此年月加入数组
                            result.push(str);
                            _this.month = result

                            //更新此时间月份
                            curr.setMonth(month + 1);
                        }

                        return result;
                    },


                    tabClick(item, index) {
                        console.log(item)
                        console.log(this.num, index)
                        this.num = index;
                        console.log(this.num, index)
                        var _this = this
                        //   console.log(item,index)
                        //   　$(this).addClass("active").siblings().removeClass("active");
                        //                   　　var index = $(this).index();
                        // $(this).parent().siblings().children().eq(index).addClass("active")
                        // .siblings().removeClass("active");
                        var date = new Date(item);
                        var YY = date.getFullYear() + '-';
                        var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                        var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
                        var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
                        var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
                        var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
                        console.log(MM)
                        $.ajax({
                            type: 'get',
                            url: 'inspection/inspection_front?offset=0&limit=10',
                            data: {
                                time: YY + MM + DD + " " + hh + mm + ss

                            },
                            success: function (res) {
                                console.log(res.rows)
                                _this.Data = res.rows
                                _this.DefaultData = res.rows;
                            }
                        })
                    },
                    tijiao(id) {
                        Layer.confirm(
                            ' 确认【人工巡检任务】和【人工巡检原始记录】已完成，提交审核？',
                            { icon: 3, title: __('温馨提示'), shadeClose: true },
                            function (index) {
                                $.ajax({
                                    type: "POST",
                                    url: 'inspection/inspection_front/confirmCompletion',
                                    data: {
                                        inspection_id: id
                                    },
                                    success: function (re) {
                                        if (re.code == 200) {
                                            Toastr.success('操作成功');
                                            window.location.reload()
                                        } else {
                                            Toastr.error(re.msg);
                                        }
                                    }
                                });
                                Layer.close(index);
                            }
                        );



                    },
                    //滚动条在Y轴上的滚动距离
                    getScrollTop() {
                        var documentScrollTop = 0;
                        documentScrollTop = document.documentElement.scrollTop;
                        return documentScrollTop;
                    },
                    //文档的总高度
                    getScrollHeight() {
                        var documentScrollHeight = 0;
                        documentScrollHeight = document.documentElement.scrollHeight;
                        return documentScrollHeight;
                    },
                    //浏览器视口的高度
                    getWindowHeight() {
                        var windowHeight = 0;
                        windowHeight = document.documentElement.clientHeight;
                        console.log(windowHeight);
                        return windowHeight;
                    },
                    // 锚点定位
                    initHeight(e) {
                        const u = navigator.userAgent;
                        const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                        let isScrollBottom
                        if (isiOS) {
                            isScrollBottom = e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight + 1) <= 1
                        } else {
                            const srcollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                            const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                            isScrollBottom = srcollHeight - (scrollTop + clientHeight + 1) <= 1;
                        }
                        //结果为true就是滚动到底部
                        //e.target.scrollTop + e.target.clientHeight +1：之所以要加上1是为了兼容不同的浏览器计算结果，有时候会相错大概1px
                        if (isScrollBottom === true) {
                            this.offset++;
                            this.getRecommendData()
                        }
                    },
                    // 推荐列表
                    getRecommendData() {
                        let _this = this;
                        $.ajax({
                            type: 'get',
                            url: 'inspection/inspection_front?limit=10&offset=' + (_this.offset - 1) * 10,
                            // data: 'search',
                            success: function (res) {
                                res.rows.forEach((re) => {
                                    _this.Data.push({
                                        name: re.name,
                                        engineering_name: re.engineering_name,
                                        start_time: re.start_time,
                                        end_time: re.end_time,
                                        city: re.city,
                                        address: re.address,
                                        is_timeout: re.is_timeout,
                                        house_rate: re.house_rate,
                                        house_structure: re.house_structure,
                                        house_total_layer: re.house_total_layer
                                    })
                                });
                            }
                        })
                    },
                    watch: {
                        'Data.is_timeout': {
                            handler(val, oldVal) {
                                console.log("正常还是超时" + val.is_timeout, oldVal.is_timeout);
                            },
                            deep: true //true 深度监听
                        }
                    }
                }
            })
            // 为表格绑定事件
            // Table.api.bindevent(table);
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
            }
        }
    };
    return Controller;
});
