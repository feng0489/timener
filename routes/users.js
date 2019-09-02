var express = require('express');
var router = express.Router();

var comm = require('./common.js');
var db = require('./mysql.js');

let request = require('request');
let jison = require('./jsonlint.js');
const log4js= require('./log4');
const errlogger = log4js.getLogger('err');
const othlogger = log4js.getLogger('oth');



/* GET users listing. */
router.all('/', function(req, res) {
    request({
        url: 'http://www.gifshow.com/s/On6Luh47/',
        method: "GET",
        json: false,
        headers: {
            "content-type": "text/html; charset=utf-8",
        },
        //body: JSON.stringify(requestData)
    }, function(error, response, body) {
        res.send(body);
    })

});

/* GET users listing. */
router.all('/add', function(req, res) {
  res.send('respond with a resource');
});

/**
 * this function for Ajax_getpoints
 * 用户及时金额
 */

/* All users listing. */
router.all('/recash', function(req, res) {// this function for Ajax_getpoints

    var uid = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':''
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    var sql =  "select user_money from ecs_users where user_id="+uid;
    db.query(sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0){
            var user_money = results[0].user_money >0 ? results[0].user_money.toFixed(3) : 0.00;
            result = {
                'code':'200',
                'msg':'ok',
                'data':user_money
            };
            res.send(result);
        }else{
            res.send(result);
        }

    });

});


/**
 * this function for Ajax_pointsBill
 * 用户活跃记录
 */

/* All users listing. */
router.all('/huoyuelst', function(req, res) {// this function for Ajax_pointsBill

    var uid      = parseInt(req.query.uid) ||0;
    var page     =   parseInt(req.query.page) ||0;
    var pageSize =   parseInt(req.query.pageSize) ||10;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':{
                'page':page,
                'totalPage':1,
                'list':''
            }
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    var change_type = [];
    change_type[95]  = '购买商品';
    change_type[96]  = '粉丝购买商品';
    change_type[55]  = '运动奖励';
    //change_type[33]  = '分享人注册';
    change_type[25]  = '任务奖励';
    change_type[2]  = '取消购买商品';
    change_type[71]   = '有效粉丝加成';
    change_type[66]   = '月奖金';

    var count_sql=" select count(log_id) as count from ecs_account_log where user_id="+uid+" and (change_type =2 or change_type>=25)"
    db.query(count_sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0 && results[0].count >0){
            var count = results[0].count;
            var totalPage = count > 0 ? Math.ceil(count / pageSize) : 1;//总页数
            var pageInfo = page* pageSize;

            var huoyue_sql=" select log_id,pay_points,change_time,change_desc,change_type from ecs_account_log where user_id="+uid+" and (change_type =2 or change_type>=25)  order by log_id desc limit "+pageInfo+","+pageSize;
            db.query(huoyue_sql,function(err, rest, fie){
                if (err){
                    result={
                        'code':'140023',
                        'msg':'发生未知错误，请客服！',
                        'data':''
                    }
                    res.send(result);
                    return;
                }
                if(rest.length > 0){
                    rest.forEach(function(v,i){
                        var mtype = rest[i].change_type;
                        rest[i].change_desc = change_type[mtype];
                        rest[i].change_time = comm.stampToTime(rest[i].change_time);
                    })

                }else{
                    rest = '';
                }
                var ret = {
                    'totalPage':totalPage,
                    'page':page,
                    'list':rest
                }
                result = {
                    'code':'200',
                    'msg':'ok',
                    'data':ret
                };
                res.send(result);
            })

        }else{
            res.send(result);
        }

    });

});

/**
 * this function for Ajax_extract
 * 用户提现/充值记录
 *
 */

/* All users listing. */
router.all('/outOfCash', function(req, res) {// this function for Ajax_extract

    var uid      = parseInt(req.query.uid) ||0;
    var page     =   parseInt(req.query.page) ||0;
    var pageSize =   parseInt(req.query.pageSize) ||10;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':{
                'page':page,
                'totalPage':1,
                'list':''
            }
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    var is_paid = new Array('未审核','已审核','已取消');


    var count_sql=" select count(id) as count from ecs_user_account where user_id="+uid;
    db.query(count_sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0 && results[0].count >0){
            var count = results[0].count;
            var totalPage = count > 0 ? Math.ceil(count / pageSize) : 1;//总页数
            var pageInfo = page* pageSize;
            var huoyue_sql=" select id,amount,add_time,is_paid from ecs_user_account where user_id="+uid+"  order by id desc limit "+pageInfo+","+pageSize;
            db.query(huoyue_sql,function(err, rest, fie){
                if (err){
                    result={
                        'code':'140023',
                        'msg':'发生未知错误，请客服！',
                        'data':''
                    }
                    res.send(result);
                    return;
                }
                if(rest.length > 0){
                    rest.forEach(function(v,i){
                        var mtype = rest[i].is_paid;
                        rest[i].is_paid = is_paid[mtype];
                        rest[i].add_time = comm.stampToTime(rest[i].add_time);
                    })

                }else{
                    rest = '';
                }
                var ret = {
                    'totalPage':totalPage,
                    'page':page,
                    'list':rest
                }
                result = {
                    'code':'200',
                    'msg':'ok',
                    'data':ret
                };
                res.send(result);
            })

        }else{
            res.send(result);
        }

    });

});
/**
 * this function for  Ajax_profit
 * 现金流水
 *
 */

/* All users listing. */
router.all('/inOfCash', function(req, res) {// this function for  Ajax_profit

    var uid      = parseInt(req.query.uid) ||0;
    var page     =   parseInt(req.query.page) ||0;
    var pageSize =   parseInt(req.query.pageSize) ||10;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':{
                'page':page,
                'totalPage':1,
                'list':''
            }
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }
    var change_type = [];
    change_type[0] = '充值';
    change_type[9] = '推荐会员升级svip';
    change_type[10]='导入用户余额转入';
    change_type[11] = '每日签到';
    change_type[12] = '取消提现';
    change_type[13] = 'svip加成';
    change_type[15] = '修改密码';
    change_type[16] = '更新手机号';
    change_type[18] = '粉丝注册';
    change_type[23] = '发布第三方任务';
    change_type[24] = '完成第三方任务';
   	change_type[100] = '系统充值';
    var logType = '0,9,10,11,12,13,15,16,18,23,24,100';//现金来源类型
  
    var count_sql=" select count(log_id) as count from ecs_account_log where user_id="+uid+" and change_type in("+logType+")";
    db.query(count_sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0 && results[0].count >0){
            var count = results[0].count;
            var totalPage = count > 0 ? Math.ceil(count / pageSize) : 1;//总页数
            var pageInfo = page* pageSize;

            var huoyue_sql=" select log_id,user_money,change_time,change_desc,change_type from ecs_account_log where user_id="+uid+" and change_type in("+logType+")  order by log_id desc limit "+pageInfo+","+pageSize;
          
            db.query(huoyue_sql,function(err, rest, fie){
                if (err){
                    result={
                        'code':'140023',
                        'msg':'发生未知错误，请客服！',
                        'data':''
                    }
                    res.send(result);
                    return;
                }
                if(rest.length > 0){
                    rest.forEach(function(v,i){
                        var mtype = rest[i].change_type;
                        rest[i].change_desc = change_type[mtype];
                        rest[i].change_time = comm.stampToTime(rest[i].change_time);
                    })

                }else{
                    rest = '';
                }
                var ret = {
                    'totalPage':totalPage,
                    'page':page,
                    'list':rest
                }
                result = {
                    'code':'200',
                    'msg':'ok',
                    'data':ret
                };
                res.send(result);
            })

        }else{
            res.send(result);
        }

    });

});


/**
 *
 * 判断是否签到
 *
 */

/* All users listing. */
router.all('/isqiandao', function(req, res) {// this function for  Ajax_profit

    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':0
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':0
        }
        res.send(result);
        return;
    }
    var startTime = comm.dateStartStamp();
    var endTime = comm.dateEndStamp();

    var log_sql = "select user_id,user_money,change_type from ecs_account_log where user_id="+uid+" and change_type=11 and change_time >="+startTime+" and change_time <= "+endTime;
    db.query(log_sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0 ){
              let money = results[0].user_money;
                result = {
                    'code':'200',
                    'msg':'ok',
                    'data':Math.floor(money * 1000)/1000,
                };
                res.send(result);


        }else{
            res.send(result);
        }

    });

});



/**
 *
 * 用户今日活跃统计即时刷新
 *
 */

/* All users listing. */
router.all('/refreshToDay', function(req, res) {

    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':0
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':0
        }
        res.send(result);
        return;
    }
    let startTime = comm.dateStartStamp();// 今天的开始
    let endTime = comm.dateEndStamp(); // 今天的结束

    let todayInfo = {};


    //获取今天总的活跃度
    let today_points_sql = "select sum(pay_points) as today_points from ecs_account_log where user_id="+uid+" and (change_type =2 or change_type>=25) and change_time >="+startTime+" and change_time <= "+endTime;
    db.query(today_points_sql,function(error, results){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }
        if(results.length >0 ){

            if(parseInt(results[0].today_points)>0){
                todayInfo.today_points =  results[0].today_points;
            }else{
                todayInfo.today_points = 0;
            }
        }else{
            todayInfo.today_points = 0;
        }

        //每日任务
        let today_renwu_log = "select sum(pay_points) as renwu_points from ecs_account_log where user_id="+uid+" and change_type =25 and change_time >="+startTime+" and change_time <= "+endTime;
        db.query(today_renwu_log,function(error, rest){
            if (error){
                result={
                    'code':'140023',
                    'msg':'发生未知错误，请客服！',
                    'data':''
                }
                res.send(result);
                return;
            }
            if(rest.length >0 ){
                if(parseInt(rest[0].renwu_points)>0){
                    todayInfo.renwu_points =  rest[0].renwu_points;
                }else{
                    todayInfo.renwu_points = 0;
                }

            }else{
                todayInfo.renwu_points = 0;
            }


            //今日步数
            let today_bushu_log = "select bushu from ecs_user_bushu where uid="+uid+" and create_time >="+startTime+" and create_time <= "+endTime;
            db.query(today_bushu_log,function(error, rest){
                if (error){
                    result={
                        'code':'140024',
                        'msg':'发生未知错误，请客服！',
                        'data':''
                    }
                    res.send(result);
                    return;
                }
                if(rest.length >0 ){
                    if(parseInt(rest[0].bushu)>0){
                        todayInfo.bushu =  rest[0].bushu;
                    }else{
                        todayInfo.bushu = 0;
                    }

                }else{
                    todayInfo.bushu = 0;
                }

                //今日购物(包含推荐人带来的利润)
                let today_gouwu_log = "select sum(pay_points) as gouwu_points from ecs_account_log where user_id="+uid+" and (change_type =95 or change_type =96) and change_time >="+startTime+" and change_time <= "+endTime;
                db.query(today_gouwu_log,function(error, rest){
                    if (error){
                        result={
                            'code':'140025',
                            'msg':'发生未知错误，请客服！',
                            'data':''
                        }
                        res.send(result);
                        return;
                    }
                    if(rest.length >0 ){
                        if(parseInt(rest[0].gouwu_points)>0){
                            todayInfo.gouwu_points =  rest[0].gouwu_points;
                        }else{
                            todayInfo.gouwu_points = 0;
                        }

                    }else{
                        todayInfo.gouwu_points = 0;
                    }

                    //今日推广
                    let today_tuijian_log = "select sum(pay_points) as tuijian_money from ecs_account_log where user_id="+uid+" and  change_type =33 and change_time >="+startTime+" and change_time <= "+endTime;
                    db.query(today_tuijian_log,function(error, rest){
                        if (error){
                            result={
                                'code':'140026',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }
                        if(rest.length >0 ){
                            if(parseInt(rest[0].tuijian_money)>0){
                                todayInfo.tuijian_money =  rest[0].tuijian_money;
                            }else{
                                todayInfo.tuijian_money = 0;
                            }

                        }else{
                            todayInfo.tuijian_money = 0;
                        }

                        //今日第三方任务
                        let today_three_log = "select sum(user_money) as three_task_money from ecs_account_log where user_id="+uid+" and  change_type =24 and change_time >="+startTime+" and change_time <= "+endTime;
                        db.query(today_three_log,function(error, rest){
                            if (error){
                                result={
                                    'code':'140027',
                                    'msg':'发生未知错误，请客服！',
                                    'data':''
                                }
                                res.send(result);
                                return;
                            }
                            if(rest.length >0 ){
                                if(parseInt(rest[0].three_task_money)>0){
                                    todayInfo.three_task_money =  rest[0].three_task_money;
                                }else{
                                    todayInfo.three_task_money = 0;
                                }

                            }else{
                                todayInfo.three_task_money = 0;
                            }

                            //本月活跃度，余额，SVIP
                            let my_points_log = "select pay_points,user_money,svip from ecs_users where user_id="+uid;
                            db.query(my_points_log,function(error, rest){
                                if (error){
                                    result={
                                        'code':'140028',
                                        'msg':'发生未知错误，请客服！',
                                        'data':''
                                    }
                                    res.send(result);
                                    return;
                                }
                                if(rest.length >0 ){
                                    if(parseInt(rest[0].pay_points)>0){
                                        todayInfo.pay_points =  rest[0].pay_points;
                                    }else{
                                        todayInfo.pay_points = 0;
                                    }
                                  
                                   if(parseFloat(rest[0].user_money)>0){
                                        todayInfo.user_money =  rest[0].user_money;
                                    }else{
                                        todayInfo.user_money = 0;
                                    }
                                   if(parseInt(rest[0].svip)>0){
                                        todayInfo.svip =  rest[0].svip;
                                    }else{
                                        todayInfo.svip = 0;
                                    }

                                }else{
                                    todayInfo.pay_points = 0;
                                    todayInfo.user_money = 0;
                                    todayInfo.svip = 0;
                                }

                              
                                //上个月的记录
                                let user_top_sql = "select substring_index(last_moth_fenhong, '|', -1) as moth_fenhong,substring_index(last_moth_svip, '|', -1) as moth_svip from ecs_user_top";
                                db.query(user_top_sql,function(error, rest) {
                                    if (error) {
                                        result = {
                                            'code': '140022',
                                            'msg': '发生未知错误，请客服！',
                                            'data': ''
                                        }
                                        res.send(result);
                                        return;
                                    }

                                    if(rest.length>0){
                                        if(parseInt(rest[0].moth_fenhong)>0 && parseInt(rest[0].moth_svip)>0){
                                            todayInfo.last_moth_fenhong = Math.floor(parseInt(rest[0].moth_fenhong));
                                        }else{
                                            todayInfo.last_moth_fenhong = 0;
                                        }
                                    }else{
                                        todayInfo.last_moth_fenhong = 0;
                                    }
									 //svip签到加成百分比
                                    let user_svip_add_sql="select qiandao_beishu from ecs_user_svip where sivp="+todayInfo.svip;
                                    db.query(user_svip_add_sql,function (er,re) {
                                        if(er){
                                            result = {
                                                'code': '140023',
                                                'msg': '发生未知错误，请客服！',
                                                'data': user_svip_add_sql
                                            }
                                            res.send(result);
                                            return;
                                        }
                                        if(re.length>0){
                                            todayInfo.svip_add=re[0].qiandao_beishu;
                                        }else{
                                            todayInfo.svip_add=0;
                                        }
                                        result.data = todayInfo;
                                        res.send(result);//发出信息
                                    })
                                });

                            });

                        });

                    });


                });


            });

        });

    });
});


/**
 *
 * 获取上个月的平均奖金
 *
 */

/* All users listing. */
router.all('/lastJiangjin', function(req, res) {
    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':0
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':0
        }
        res.send(result);
        return;
    }

    //上个月的记录
    let user_top_sql = "select substring_index(last_moth_fenhong, '|', -1) as moth_fenhong,substring_index(last_moth_svip, '|', -1) as moth_svip from ecs_user_top";
    db.query(user_top_sql,function(error, rest) {
        if (error) {
            result = {
                'code': '140022',
                'msg': '发生未知错误，请客服！',
                'data': ''
            }
            res.send(result);
            return;
        }

        if(rest.length>0){
            if(parseInt(rest[0].moth_fenhong)>0){
                result.data = Math.floor(parseInt(rest[0].moth_fenhong));
            }else{
                result.data = 0;
            }
        }else{
            result.data = 0;
        }

        res.send(result);//发出信息

    });
});


/**
 *
 * 获取用户的活跃度
 *
 */

/* All users listing. */
router.all('/huoyuedu', function(req, res) {
    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':{
            'rank_points':0,
            'total_pay_points':0,
        }
    };
    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':0
        }
        res.send(result);
        return;
    }

    //上个月的记录
    let user_sql = "select rank_points,total_pay_points from ecs_users where user_id="+uid;
    db.query(user_sql,function(error, rest) {
        if (error) {
            result = {
                'code': '140022',
                'msg': '发生未知错误，请客服！',
                'data': 0
            }
            res.send(result);
            return;
        }

        if(rest.length>0){
            result.data.rank_points = Math.floor(parseInt(rest[0].rank_points)) || 0 ;
            result.data.total_pay_points = Math.floor(parseInt(rest[0].total_pay_points)) || 0;

        }else{
            result.data.rank_points = 0;
            result.data.total_pay_points = 0;
        }

        res.send(result);//发出信息

    });
});


/**
 *获取用户今日步数,昨日的步数活跃度
 * @type {Router|router}
 */

/* All users listing. */
router.all('/bushuToday', function(req, res) {
    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':{
            'today_bushu':0,
            'last_money':0,
        }
    };

    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':0
        }
        res.send(result);
        return;
    }

     let timeStart = comm.dateStartStamp();
     let timeNow = comm.nowToStemp();

    let today_sql = "select bushu from ecs_user_bushu where create_time >="+timeStart+" and create_time <= "+timeNow+" and uid="+uid;

    db.query(today_sql,function(error, rest) {
        if (error) {
            result = {
                'code': '140022',
                'msg': '发生未知错误，请客服！',
                'data': 0
            }
            res.send(result);
            return;
        }

        if(rest.length>0){
            result.data.today_bushu = rest[0].bushu || 0;
        }else{
            result.data.today_bushu = 0;

        }

        let lastTime = Number(timeStart)-86400;

        let last_sql = "select bushu from ecs_user_bushu where create_time >="+lastTime+" and create_time < "+timeStart+" and uid="+uid;

        db.query(last_sql,function(error, rest) {
            if (error) {
                result = {
                    'code': '140022',
                    'msg': '发生未知错误，请客服！',
                    'data': 0
                }
                res.send(result);
                return;
            }

            if(rest.length>0){
                let bushu = Number(rest[0].bushu);
                if(bushu>1000){
                    result.data.last_money = Math.floor(bushu*0.001);
                }else{
                    result.data.last_money = 0;
                }

            }else{
                result.data.last_money = 0;

            }
            res.send(result);//发出信息

        });

    });
});


/**
 *今日朋友步数排行榜
 * @type {Router|router}
 */

/* All users listing. */
router.all('/bushuTop', function(req, res) {
    var uid      = parseInt(req.query.uid) ||0;
    var result = {
        'code':'200',
        'msg':'ok',
        'data':''
    };

    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }


    let user_sql = "SELECT  user_id, nickname as user_name, headimgurl ,0 as bushu FROM  ecs_users where user_id="+uid;
    db.query(user_sql,function(error, re) {
        if (error) {
            result = {
                'code': '140022',
                'msg': '发生未知错误，请客服！',
                'data': ''
            }
            res.send(result);
            return;
        }

        if(re.length>0){
            let users = re[0];

            let today_sql = "SELECT fid as user_id,fid_name as user_name,fid_photo as headimgurl ,0 as bushu FROM  ecs_user_friends where uid="+uid;

            db.query(today_sql,function(error, rest) {
                if (error) {
                    result = {
                        'code': '140022',
                        'msg': '发生未知错误，请客服！',
                        'data': ''
                    }
                    res.send(result);
                    return;
                }

                if(rest.length>0){
                    let fids = "";

                    rest.forEach(function (v,i) {
                        if(fids){
                            fids += ","+ v.user_id;
                        }else {
                            fids +=  v.user_id;
                        }

                    });
                    fids +=','+uid;
                    rest.push(users);//添加自己到top队列中
                    result.data = rest;

                    let timeStart = comm.dateStartStamp();
                    //获取今天的步数记录
                    let last_sql = "select uid,bushu from ecs_user_bushu where uid in("+fids+") and create_time >="+timeStart+" order by bushu desc limit 0,20";

                    db.query(last_sql,function(error, rests) {
                        if (error) {
                            result = {
                                'code': '140022',
                                'msg': '发生未知错误，请客服！',
                                'data': 0
                            }
                            res.send(result);
                            return;
                        }

                        let lst = [];
                        rest.forEach(function (item,index) {
                            rests.forEach(function (v,i) {
                                if(item.user_id==v.uid){
                                    rest[index].bushu = rests[i].bushu;//获取今日步数
                                }
                            });

                        });
                        rest = rest.sort(comm.descSort("bushu"));//步数排序
                        for(let i=0;i<20;i++){//就获取前面二十个
                            if(rest[i]){
                                lst.push(rest[i]);
                            }

                        }
                        result.data = lst;
                        res.send(result);//发出信息

                    });

                }else{
                    res.send(result);//发出信息
                }


            });
        }else{
            result={
                'code':'140021',
                'msg':'非法访问',
                'data':''
            }

        }
    });

});

/**
 *获取历史步数
 * @type {Router|router}
 */

/* All users listing. */
router.all('/bushulog', function(req, res) {
    var uid = parseInt(req.query.uid) || 0;
    var result = {
        'code': '200',
        'msg': 'ok',
        'data': ''
    };

    if (uid == 0) {
        result = {
            'code': '140021',
            'msg': '非法访问',
            'data': ''
        }
        res.send(result);
        return;
    }
    let last_sql = "select  bushu,create_time from  ecs_user_bushu where uid="+uid+" order by id desc limit 20";

    db.query(last_sql,function(error, rests) {
        if (error) {
            result = {
                'code': '140022',
                'msg': '发生未知错误，请客服！',
                'data': 0
            }
            res.send(result);
            return;
        }
        if(rests.length>0){
            result.data = rests;
        }
        res.send(result);//发出信息

    });

});



module.exports = router;
