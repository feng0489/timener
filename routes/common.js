

module.exports={
    stampToTime:function(timestamp) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear();
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
        var D = (date.getDate()<10?'0'+date.getDate():date.getDate());
        var h = (date.getHours()<10?'0'+date.getHours():date.getHours());
        var m = (date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
        var s = (date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds());
        return Y+"-"+M+"-"+D+" "+h+":"+m+":"+s;
    },
    dateStartStamp:function(){
        var myDate = new Date();//获取系统当前时间
        var moths = myDate.getMonth()+1
        var moth = moths < 10 ? '0'+moths : moths;
        var day = myDate.getDate()<10 ? '0'+myDate.getDate():myDate.getDate();
        var DateTime = myDate.getFullYear()+'-'+moth+'-'+day;
        var dates= DateTime  +' 00:00:00';
        var tmp = Date.parse(dates).toString();
        tmp = tmp.substr(0,10);
        return tmp;
    },
    dateEndStamp:function(){
        var myDate = new Date();//获取系统当前时间
        var moths = myDate.getMonth()+1
        var moth = moths < 10 ? '0'+moths : moths;
        var day = myDate.getDate()<10 ? '0'+myDate.getDate():myDate.getDate();
        var DateTime = myDate.getFullYear()+'-'+moth+'-'+day;
        var dates= DateTime  +' 23:59:59';
        var tmp = Date.parse(dates).toString();
        tmp = tmp.substr(0,10);
        return tmp;
    },

    keysort:function (key,sortType) { //sortType true为降序；false为升序
        return function(a,b){
            return sortType ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
        }
    },
    descSort:function (key) {
        return function(a,b){
            var value1 = a[key];
            var value2 = b[key];
            return value2 - value1;
        }

    },
    ascSort:function (key) {
        return function(a,b){
            var value1 = a[key];
            var value2 = b[key];
            return value1 - value2;
        }

    },
    specialKeyWord:function(str) {
        var reg = /\\+|\~+|\!+|\@+|\=+|\#+|¥+|\￥+|\%+|\^+|\&+|\*+|\(+|\)+|\'+|(\")+|\$+|`+|\“+|\”+|\‘+|\’+|\s+/g;
        var res = str.replace(reg,"");
        return res;
    },
    nowDate:function () {

            var myDate = new Date();//获取系统当前时间
            var moths = myDate.getMonth()+1
            var moth = moths < 10 ? '0'+moths : moths;
            var day = myDate.getDate()<10 ? '0'+myDate.getDate():myDate.getDate();
            var DateTime = myDate.getFullYear()+'-'+moth+'-'+day;

            var h = (myDate.getHours()<10?'0'+myDate.getHours():myDate.getHours());
            var m = (myDate.getMinutes()<10?'0'+myDate.getMinutes():myDate.getMinutes());
            var s = (myDate.getSeconds()<10?'0'+myDate.getSeconds():myDate.getSeconds());
            var dates= DateTime  +' '+h+':'+m+':'+s;
            return dates;

    },
    twentyAgo:function () {
        var myDate = new Date();//获取系统当前时间
        var moths = myDate.getMonth()+1
        var moth = moths < 10 ? '0'+moths : moths;
        var day = myDate.getDate()<10 ? '0'+myDate.getDate():myDate.getDate();
        var DateTime = myDate.getFullYear()+'-'+moth+'-'+day;
        var h = (myDate.getHours()<10?'0'+myDate.getHours():myDate.getHours());
        var m = (myDate.getMinutes()<10?'0'+myDate.getMinutes():myDate.getMinutes());
        var s = (myDate.getSeconds()<10?'0'+myDate.getSeconds():myDate.getSeconds());
        var dates= DateTime  +' '+h+':'+m+':'+s;
        var tmp = Date.parse(dates).toString();
        tmp = tmp.substr(0,10);
        var twentyAgo = parseInt(tmp)-1200;//获取二十分中前的时间戳
        var date = new Date(twentyAgo * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        var D = (date.getDate()<10?'0'+date.getDate():date.getDate()) + ' ';
        var h = (date.getHours()<10?'0'+date.getHours():date.getHours()) + ':';
        var m =  (date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())+ ':';
        var s = (date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds());
        return Y+M+D+h+m+s;

    },
    timeToStmp :function (time) {
        var tmp = Date.parse(new Date(time));
        tmp =  tmp / 1000;;
        return tmp;

    },
    firstDayOfMonth:function () {//获取当前月的第一天
        var myDate = new Date();//获取系统当前时间
        var moths = myDate.getMonth()+1
        var moth = moths < 10 ? '0'+moths : moths;
        var DateTime = myDate.getFullYear()+'-'+moth+'-01 00:00:00';
        var tmp = Date.parse(DateTime).toString();
        tmp = tmp.substr(0,10);
        return tmp;

    },
    nowToStemp:function () {
        var myDate = new Date();//获取系统当前时间
        var moths = myDate.getMonth()+1
        var moth = moths < 10 ? '0'+moths : moths;
        var day = myDate.getDate()<10 ? '0'+myDate.getDate():myDate.getDate();
        var DateTime = myDate.getFullYear()+'-'+moth+'-'+day;
        var h = (myDate.getHours()<10?'0'+myDate.getHours():myDate.getHours());
        var m = (myDate.getMinutes()<10?'0'+myDate.getMinutes():myDate.getMinutes());
        var s = (myDate.getSeconds()<10?'0'+myDate.getSeconds():myDate.getSeconds());
        var dates= DateTime  +' '+h+':'+m+':'+s;
        var tmp = Date.parse(dates).toString();
        tmp = tmp.substr(0,10);
        return tmp;
    }



}