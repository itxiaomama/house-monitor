define(['vue', 'jquery',], function (Vue, $) {
    var Controller = {

        index: function () {


            new Vue({
                el: '#selectCity',

                data: {
                    provinces: [],
                    cityPicker: '',
                    selectProvince: '',
                    selectCity: '',
                    selectDistrict: '',
                    selectTownship: '',
                    menuIndex: 0,
                    navList: ['省份', '城市', '区县', '乡镇'],


                    citys: [],
                    districts: [],
                    Townships: [],
                    active4: -1,
                    active: [],
                    active2: -1,
                    active3: -1,
                    active1: -1,

                },
                mounted() {
                    //请求省份数据
                    var that = this
                    $.ajax({
                        type: 'get',
                        url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                        dataType: 'json',
                        success: function (res) {
                            that.provinces = res.data
                            console.log(res.data)
                        }
                    })


                },
                methods: {
                    menuShow(index) {

                        this.menuIndex = index

                    },
                    showPicker() {
                        $('.myTab').show()
                    },
                    getCity(item, i, j) {
                        $('.TabContent span').removeClass('isActive')
                        var that = this
                        that.active[i] = j
                        that.selectProvince = item[j].name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 2, id: item[j].id },
                            success: function (res) {
                                that.citys = res.data
                                that.menuIndex = 1
                            }
                        })

                    },

                    getDistricts(item, index) {
                        var that = this

                        that.active2 = index
                        that.selectCity = item.name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 3, id: item.id },
                            success: function (res) {
                                that.districts = res.data
                                that.menuIndex = 2
                            }
                        })
                    },
                    getTownships(item, index) {
                        var that = this

                        that.active3 = index
                        that.selectDistrict = item.name
                        $.ajax({
                            type: 'get',
                            url: '/JMRIUsnmLz.php/disoop/getAreaInfo',
                            dataType: 'json',

                            data: { level: 4, id: item.id },
                            success: function (res) {
                                that.Townships = res.data
                                that.menuIndex = 3
                            }
                        })
                    },
                    getWLists(item, index) {
                        var that = this
                        that.active4 = index
                        that.selectTownship = item.name

                        that.cityPicker = that.selectProvince + '/' + that.selectCity + '/' + that.selectDistrict + '/' + that.selectTownship
                        $('.myTab').hide()

                    },

                },

            })
            return Controller;
        }

    }
});
