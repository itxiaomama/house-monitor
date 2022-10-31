define(['jquery', 'vue', 'bootstrap', 'backend', 'table', 'form'], function ($, Vue, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'inspection/house_front/index' + location.search,
                    add_url: 'inspection/house_front/add',
                    edit_url: 'inspection/house_front/edit',
                    del_url: 'inspection/house_front/del',
                    multi_url: 'inspection/house_front/multi',
                    import_url: 'inspection/house_front/import',
                    detail_url: 'inspection/house_front/detail',
                    table: 'inspection/house_front',
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
                        { field: 'name', title: __('Name'), operate: 'LIKE' },
                        { field: 'year', title: __('Year'), operate: 'LIKE' },
                        { field: 'address', title: __('Address'), operate: 'LIKE' },
                        {
                            field: 'operate', width: '170px', title: __('Operate'), table: table, events: this.operate, buttons: [
                                {
                                    name: 'detail',
                                    text: '详情',
                                    icon: 'fa fa-bars',
                                    classname: 'btn btn-primary btn-xs btn-addtabs',
                                    url: 'inspection/house_front/detail'
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
                    title: '房屋信息',
                    InputBox_show: false,
                    DefaultData: [],
                    Data: [
                        {
                            name: '翟国宏 翟锡增',
                            time: '1949',
                            address1: '萧山区河上镇紫霞村'
                        }
                    ],
                    SearchData: [],
                    house_nameData: '',
                    house_addressData: '',
                    isScroll: true,
                    offset: 1,
                },
                mounted() {
                    let _this = this;
                    // 请求数据
                    $.ajax({
                        type: 'get',
                        url: 'inspection/house_front?offset=0&limit=10',
                        success: function (res) {
                            _this.Data = res.rows;
                            _this.DefaultData = res.rows;
                            console.log(_this.Data, '这是房屋信息')
                        }
                    });
                    window.addEventListener('scroll', this.initHeight, true);
                    _this.getScrollTop();
                },
                beforeDestroy() {
                    document.body.style.overflow = 'scroll'
                    document.removeEventListener('touchmove', preD, { passive: false })
                    window.removeEventListener("scroll", this.initHeight)
                },
                methods: {
                    //搜索
                    Search() {
                        let _this = this
                        $.ajax({
                            type: 'get',
                            url: 'inspection/house_front?search=' + _this.house_name,
                            // data: 'search',
                            success: function (res) {
                                _this.SearchData = res.rows;
                                _this.Data = _this.SearchData;
                            }
                        })

                    },
                    //input框为空时重新渲染数据
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
                            url: 'inspection/house_front?limit=10&offset=' + (_this.offset - 1) * 10,
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
                                        year: re.year,
                                    })
                                });
                            }
                        })
                    },


                }
            })

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
            new Vue({
                el: '#langlang',
                data: {
                    //定义起点位置
                    nav_box_show: false,
                    arr123: [],
                    StartXY: {

                        lng: 120.339504,

                        lat: 30.122078,

                        city: ''
                    },

                    //定义终点位置

                    EndXY: {

                        lng: 120.582886,

                        lat: 30.051549,

                        city: "绍兴市",

                    }
                },
                mounted() {
                    console.log('111111');
                    let arr1 = this.$refs.LatitudeAndLongitude.value;
                    let shuzu = arr1.split(",")
                    this.StartXY.lng = shuzu[0];
                    this.StartXY.lat = shuzu[1];
                    console.log(shuzu[0], shuzu[1])
                    console.log(this.StartXY.lng, this.StartXY.lat)


                },
                methods: {

                    checkbox_show() {
                        this.nav_box_show = true;
                        console.log(this.nav_box_show)
                    },
                    close() {
                        this.nav_box_show = false
                    },
                    handClick(val) {
                        /* 判断手机是ios还是安卓 */
                        let u = navigator.userAgent;
                        //判断是否是安卓
                        let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
                        //判断是否是ios
                        let isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                        //判断是否点击了高德地图
                        if (val === 1) {
                            //判断是否安卓
                            if (isAndroid) {
                                let arr1 = this.$refs.LatitudeAndLongitude.value;
                                let shuzu = arr1.split(",")
                                this.StartXY.lng = shuzu[0];
                                this.StartXY.lat = shuzu[1];
                                let queryStr = `?sourceApplication=msite&lat=${this.StartXY.lat}&,&lon=${this.StartXY.lng}&dev=0&style=2`;
                                window.location.href = `androidamap://navi${queryStr}`;
                            } else if (isIos) {
                                //ios系统 高德地图不区分ios和安卓
                                let queryStr = `?sourceApplication=msite&lat=${this.StartXY.lat}&lon=${this.StartXY.lng}&dev=0&style=2`;
                                window.location.href = `iosamap://navi${queryStr}`;

                                let startTime = Date.now();
                                let count = 0;
                                let endTime = 0;
                                let t = setInterval(function () {
                                    count += 1;
                                    endTime = Date.now() - startTime;
                                    if (endTime > 3000) {
                                        clearInterval(t)
                                    }
                                    if (count < 3) return;
                                    if (!(document.hidden || document.webkitHidden)) {
                                        window.location.href = "https://uri.amap.com/marker?position=120.374294,30.157024";
                                        // window.location.href = `https://uri.amap.com/marker?position=${this.StartXY.lng},${this.StartXY.lat}`;
                                    }
                                }, 200);
                                window.onblur = function () {
                                    clearInterval(t);
                                };
                            }
                        }
                        //百度地图
                        else if (val === 2) {
                            let queryStr = `?origin=name:我的位置|latlng:${this.StartXY.lat},${this.StartXY.lng}&destination=${this.EndXY.lat},${this.EndXY.lng}&region=${this.EndXY.city}&coord_type=bd09ll&mode=driving`;
                            if (isAndroid) {
                                window.location.href = `bdapp://map/direction${queryStr}`;
                                //以下代码为判断app是否已经打开
                                let starTime = Date.now();
                                let count = 0;
                                let endTime = 0;
                                let t = setInterval(function () {
                                    count += 1;
                                    endTime = Date.now() - starTime;
                                    //如果0.8秒后还未打开 清除定时器 直接打开浏览器端
                                    if (endTime > 800) {
                                        clearInterval(t);
                                    }
                                    if (count < 30) return;
                                    //是否代开的判断逻辑为当前页面是否进入后台
                                    if (!(document.hidden || document.webkitHidden)) {
                                        window.location.href = "http://api.map.baidu.com/direction" + queryStr + "&output=html";
                                    }
                                    //0.2秒判断一次 app是否打开
                                }, 20);
                                window.onblur = function () {
                                    clearInterval(t);
                                };
                            } else if (isIos) {
                                window.location.href = `baidumap://map/direction${queryStr}`
                            }
                        }
                    }
                }
            })
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







