// axios.interceptors.request.use(function (config) {
//     config.headers.Authorization = sessionStorage["token"];
//     return config;
// });
// var app = null;
// window.vm = new Vue({
//     el: "#app",
//     data() {
//         return {
//             pageData: {
//                 url: "/com/joctec/app/xunjian/inspectTask",
//                 list: [],
//                 toggle: {
//                     before: false,
//                     now: false,
//                     done: false,
//                 },
//                 loadding: true,
//             },
//             problemRecord: {
//                 url: "/com/joctec/app/xunjian/InspectReportProblem/getRecord",
//                 list: [],
//                 paras: {
//                     pageNumber: 1,
//                     pageSize: 999,
//                     itId: null,
//                 }
//             },
//             img: {
//
//                 headerArrange: [
//                     { count: 1, widthDiv: 246, heightDiv: 162, widthImg: 246, maxHeightImg: 162 },
//                     { count: 2, widthDiv: 222, heightDiv: 147, widthImg: 222, maxHeightImg: 147 },
//                     { count: 3, widthDiv: 148, heightDiv: 98, widthImg: 148, maxHeightImg: 98 },
//                 ],
//                 pathsHeader: [],
//                 arrange: [
//                     { count: 1, widthDiv: 676, heightDiv: 448, widthImg: 676, maxHeightImg: 448 },
//                     { count: 2, widthDiv: 332, heightDiv: 220, widthImg: 332, maxHeightImg: 220 },
//                     { count: 3, widthDiv: 218, heightDiv: 144, widthImg: 218, maxHeightImg: 144 },
//                     { count: 4, widthDiv: 166, heightDiv: 115, widthImg: 166, maxHeightImg: 115 },
//                 ],
//                 paths: [],
//                 colSizeHeader: 1,
//                 colSize: 1,
//                 File: {
//                     url: "/com/joctec/app/xunjian/file",
//                     list: [],
//                     paras: {
//                         pageNumber: 1,
//                         pageSize: 99,
//                         id: 0,
//                     },
//                 }
//
//             },
//             showDate:true,
//         }
//     },
//     watch: {
//         'pageData.toggle.done'() {
//             if (this.pageData.toggle.done) {
//                 setTimeout(() => {
//                     var list = app.pageData.list
//                     for (let i = 0; i < list.length; i++) {
//                         var h = document.getElementById('houseInfo_' + i).offsetHeight
//                         document.getElementById('headerImg_' + i).style.minHeight = h + "px"
//                         /* var h1=document.getElementById('head_' + i).offsetHeight
//                         var h2=document.getElementById('content_1_' + i).offsetHeight
//                         var h3=document.getElementById('content_2_' + i).offsetHeight
//                         var h4=document.getElementById('content_3_' + i).offsetHeight
//                         var h5=document.getElementById('bottom_1_' + i).offsetHeight
//                         var h6=document.getElementById('bottom_2_' + i).offsetHeight
//                         document.getElementById('content_3_' + i).style.height=(1046-h1-h2-h3-h5-h6) + "px" */
//                     }
//                 }, 300)
//             }
//         }
//     },
//     created() {
//         app = this;
//         var taskList = JSON.parse(sessionStorage.getItem("taskIdList"))
//         console.log(sessionStorage.getItem("showDate"))
//         app.showDate = sessionStorage.getItem("showDate")
//         console.log(taskList)
//         var i = 0;
//         //开始取任务数据，以递归方式获取以保证数据次序。
//         app.getRecord(i, taskList)
//
//         console.log("--------------------")
//         console.log(app.pageData.list)
//     },
//     methods: {
//         getImgPathDone(i) {
//             if (app.pageData.list[i].before && app.pageData.list[i].now) {
//                 if (app.pageData.list[i].beforeId != 0) {
//                     app.pageData.list[i].paths = app.pageData.list[i].beforePaths.concat(app.pageData.list[i].nowPaths)
//                 } else {
//                     app.pageData.list[i].paths = app.pageData.list[i].nowPaths
//                 }
//                 var pathLen = app.pageData.list[i].paths.length;
//                 switch (pathLen) {
//                     case 1:
//                         app.pageData.list[i].colSize = 1;
//                         break;
//                     case 2: case 3: case 4: case 5: case 6:
//                         app.pageData.list[i].colSize = 2;
//                         break;
//                     case 7: case 8: case 9: case 10: case 11: case 12:
//                         app.pageData.list[i].colSize = 3;
//                         break;
//                     default:
//                         app.pageData.list[i].colSize = 4;
//                         break;
//                 }
//             }
//
//         },
//         query(url, tableName) {
//             var app = this;
//             axios(url, { params: app.img[tableName].paras }).then((response) => {
//                 console.log(response)
//                 app.img[tableName].list = response.data.list
//             })
//         },
//         getRecord(i, taskList) {
//             // var app = this;
//             if (i < taskList.length) {
//                 // app.pageData.toggle.before = false;
//                 // app.pageData.toggle.now = false;
//
//                 var paras = {};
//                 paras.taskId = taskList[i].taskId
//                 paras.status = 1
//                 // console.log(paras)
//                 axios(app.pageData.url + "/view", { params: paras }).then((response) => {
//                     var list = response.data.list
//                     if (list.length > 0) {
//                         var tmpArr = []
//                         // console.log("list:", list[0])
//                         //取得本次任务的所有立面图fileId。
//                         if (list[0].fileId != null && list[0].fileId != "") {
//                             var fileId = list[0].fileId.split(",")
//                             for (let i = 0; i < fileId.length; i++) {
//                                 if (fileId[i] != "") {
//                                     tmpArr.push(fileId[i])
//                                 }
//                             }
//                         }
//                         // app.pageData.list.push(list[0])
//                         //判断是否有beforeId，若有取得些Id数据。
//                         if (list[0].beforeId != 0) {
//                             axios(app.pageData.url + "/view", { params: { taskId: list[0].beforeId, status: 1 } }).then((response) => {
//                                 var beforeList = response.data.list;
//                                 app.pageData.list.push(list[0])
//                                 app.pageData.list[i].count = 0
//                                 app.pageData.list[i].before = false;
//                                 app.pageData.list[i].now = false;
//                                 if (beforeList.length > 0) {
//                                     app.pageData.list[i].beforeTask = beforeList[0]
//                                 }
//
//                                 // console.log(app.pageData.list[i], i)
//                                 app.getProblemList(list[0].beforeId, i, 'beforeProblem')
//                                 //取得本次任务所提交的问题
//                                 app.getProblemList(taskList[i].taskId, i, 'nowProblem')
//                                 var j = 0;
//                                 //取得fileId对应的Url
//                                 app.pageData.list[i].pathsHeader = [];
//                                 var paths = [];
//                                 app.getImgPath(i, j, tmpArr, 'pathsHeader', paths)
//                                 i++
//                                 app.getRecord(i, taskList)
//                             })
//                         } else {
//                             app.pageData.list.push(list[0])
//                             app.pageData.list[i].before = true;
//                             app.pageData.list[i].now = false;
//                             //取得本次任务所提交的问题
//                             app.getProblemList(taskList[i].taskId, i, 'nowProblem')
//                             var j = 0;
//                             //取得fileId对应的Url
//                             app.pageData.list[i].pathsHeader = [];
//                             var paths = [];
//                             app.getImgPath(i, j, tmpArr, 'pathsHeader', paths)
//                             i++
//                             app.getRecord(i, taskList)
//                         }
//
//                     }
//
//                 })
//             } else {
//                 // console.log(app.pageData.list)
//                 var setInt = setInterval(() => {
//                     var list = app.pageData.list
//                     for (let i = 0; i < list.length; i++) {
//                         if (!list[i].before || !list[i].now) {
//                             // console.log("list.length:%s,i:%s", list.length, i)
//                             break;
//                         }
//                         if (i + 1 == list.length) {
//                             if (list[i].before && list[i].now) {
//                                 app.pageData.toggle.done = true;
//                                 clearInterval(setInt)
//                             }
//                         }
//                     }
//                 }, 500)
//                 /* setTimeout(() => {
//                     app.pageData.toggle.done = true;
//                     app.pageData.ladding = false;
//                 }, 5000); */
//
//             }
//
//         },
//         getProblemList(taskId, i, problem) {
//             // var app = this;
//             var tmpParas = {}
//             tmpParas.pageNumber = 1;
//             tmpParas.pageSize = 999;
//             tmpParas.itId = taskId;
//             axios(app.problemRecord.url, { params: tmpParas }).then((response) => {
//                 let list = response.data.list
//                 // console.log(list)
//
//                 let tmpArr = []
//                 //取得问题所对应的图片fileId。
//                 for (let i = 0; i < list.length; i++) {
//                     if (list[i].fileId != null && list[i].fileId != "") {
//                         let fileId = list[i].fileId.split(",")
//                         for (let j = 0; j < fileId.length; j++) {
//                             if (fileId[j] != "") {
//                                 tmpArr.push(fileId[j])
//                             }
//                         }
//                     }
//                 }
//                 let x = 0
//                 switch (problem) {
//                     case "nowProblem":
//                         app.pageData.list[i].nowProblem = list;
//                         app.pageData.list[i].nowPaths = [];
//                         var paths = [];
//                         app.getImgPath(i, x, tmpArr, 'nowPaths', paths)
//                         break;
//                     case "beforeProblem":
//                         app.pageData.list[i].beforeProblem = list;
//                         app.pageData.list[i].beforePaths = [];
//                         var paths = [];
//                         app.getImgPath(i, x, tmpArr, 'beforePaths', paths)
//                         break;
//                 }
//             }).catch((e) => {
//                 console.log(e)
//             })
//         },
//         getImgPath(i, j, tmpArr, path, paths) {
//             // var app = this;
//             if (j < tmpArr.length) {
//                 axios(app.img.File.url, { params: { id: tmpArr[j] } }).then((response) => {
//                     var list = response.data.list
//                     if (list.length > 0) {
//                         paths.push({ path: list[0].url, fileId: tmpArr[j], deg: 0, display: true })
//                         // console.log("%s:", path, app.pageData.list[i][path])
//                     }
//                     j++
//                     app.getImgPath(i, j, tmpArr, path, paths)
//                 })
//             } else {
//                 app.pageData.list[i][path] = paths;
//                 switch (path) {
//                     case "beforePaths":
//                         app.pageData.list[i].before = true;
//                         app.getImgPathDone(i);
//                         break;
//                     case "nowPaths":
//                         app.pageData.list[i].now = true;
//                         app.getImgPathDone(i);
//                         break;
//                     case "pathsHeader":
//                         var pathHeaderLen = app.pageData.list[i].pathsHeader.length;
//                         switch (pathHeaderLen) {
//                             case 1:
//                                 app.pageData.list[i].colSizeHeader = 1;
//                                 break;
//                             case 2:
//                                 app.pageData.list[i].colSizeHeader = 2;
//                                 break;
//                             case 3: case 4: case 5: case 6:
//                                 app.pageData.list[i].colSizeHeader = 3;
//                                 break;
//                             default:
//                                 app.pageData.list[i].colSizeHeader = 3;
//                                 break;
//                         }
//                         break;
//                 }
//             }
//         },
//         transform(i, j, e, path) {
//             if (app.pageData.list[i][path][j].deg == 270) {
//                 app.pageData.list[i][path][j].deg = 0
//             } else {
//                 app.pageData.list[i][path][j].deg += 90
//             }
//             var cssText = e.target.style.cssText + "transform:rotate(" + app.pageData.list[i][path][j].deg + "deg);"
//             e.target.setAttribute('style', cssText);
//         },
//         removePic(j, n, fileId) {
//             var app = this;
//             var msg = '确定删除#：' + fileId + '？'
//             app.$confirm(msg, '删除').then(({ result }) => {
//                 if (result) {
//                     // console.log("j:%s,n:%s,fileId:%s",j,n,fileId)
//                     app.pageData.toggle.done = false
//                     app.pageData.list[j].paths[n].display = false;
//                     app.pageData.toggle.done = true
//                     // document.getElementById("pic_" + j + "_" + n).style = "display:none;"
//                 }
//             })
//         },
//         formatDate: function (dateType, time) {
//             var date;
//             if (time != undefined) {
//                 date = new Date(time);
//             } else {
//                 date = new Date();
//             }
//             // console.log("date===" + date );
//             var year = date.getFullYear();
//             var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
//             var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
//             var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
//             var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
//             var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
//             switch (dateType) {
//                 case 'date':
//                     return year + "-" + month + "-" + day;
//                     break;
//                 case 'time':
//                     return hours + ":" + minutes + ":" + seconds;
//                     break;
//                 case 'datetime':
//                     return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
//                     break;
//                 default:
//                     break;
//             }
//         },
//         getStructType(type) {
//             switch (type) {
//                 case 1: return '砖木结构';
//                 case 2: return '砖混结构';
//                 case 3: return '框架结构';
//                 case 4: return '混合结构';
//                 case 5: return '泥木结构';
//                 case 6: return '砖木砖混';
//             }
//         }
//
//     }
// })
