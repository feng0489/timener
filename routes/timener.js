let express = require('express');
let router = express.Router();
let request = require('request');
let comm = require('./common.js');
let jison = require('./jsonlint.js');
let db = require('./mysql.js');

let schedule = require('node-schedule');

let appkey = 'efce71f086c34f6da60220d31de0bb19';

const log4js = require('./log4');
const errlogger = log4js.getLogger('err');
const othlogger = log4js.getLogger('oth');


function scheduleCronstyle() {
    var rule2 = new schedule.RecurrenceRule();
    var times2 = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
    rule2.second = times2;
    schedule.scheduleJob(rule2, function () {
        // console.log("times2->date:"+ new Date())
        //test();
    });

    var rule1 = new schedule.RecurrenceRule();
    var times1 = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59];
    rule1.minute = times1;
    schedule.scheduleJob(rule1, function () {

        console.log("times1->date:" + new Date())
        //getorders()
        //orderList1();
    });

    schedule.scheduleJob('0 0 1 * * *', function () {

        orderReCheck()
    });
}

scheduleCronstyle();


//let ApiClient = require('./ali/index.js').ApiClient;

/**
 * 检验订单是否退货
 */
function orderReCheck() {

    let every_times = 3 * 60 * 60;//三个钟的时间
    let tree_day_ago = comm.dateStartStamp() - 86400 * 3;//获取3天前的时间
    let ten_day_ago = comm.dateStartStamp() - 86400 * 10;//获取10天前的时间

    let num = 1;
    while (tree_day_ago >= ten_day_ago) {

        othlogger.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>num :" + num, "   time:" + tree_day_ago);
        let eng_time = tree_day_ago - every_times;

        let all_sid_sql = "select sid from ecs_tbke where unix_timestamp(now())<expire_time";
        db.query(all_sid_sql, function (e, r) {
            if (e) {
                errlogger.error("timener=>orderReCheck=>all_sid_sql ERROR:", "error:" + JSON.stringify(e) + "\n" + "sql" + all_sid_sql);
            }


            if (r.length > 0) {

                r.forEach(function (v, i) {
                    let start_time = encodeURIComponent(comm.stampToTime(tree_day_ago));
                    let end_time = encodeURIComponent(comm.stampToTime(eng_time));
                    let sid = r[i].sid;
                    let req_url = "https://api.zhetaoke.com:10001/api/open_dingdanchaxun2.ashx?appkey=" + appkey + "&sid=" + sid + "&start_time=" + start_time + "&end_time=" + end_time + "&signurl=1&tk_status=13";
                    request({
                        url: req_url,
                        method: "GET",
                        json: true,
                        headers: {
                            //"content-type": "text/html; charset=utf-8",
                            "content-type": "application/json",
                        },

                    }, function (error, response, body) {
                        if (body) {
                            let url = body.url || "";
                            if (url) {
                                request({
                                    url: url,
                                    method: "GET",
                                    json: false,
                                    headers: {
                                        "content-type": "text/html; charset=utf-8",

                                    },

                                }, function (error, response, body) {
                                    if (body) {
                                        let data = jison.parse(body);
                                        if (data) {
                                            let results = data.tbk_sc_order_get_response.results;
                                            if (results) {
                                                let orders = results.n_tbk_order ? results.n_tbk_order : [];
                                                if (orders.length > 0) {
                                                    let orderStatus = [];
                                                    orderStatus[3] = 2;//订单结算
                                                    orderStatus[12] = 1;//订单付款;
                                                    orderStatus[13] = 3;//订单失效;
                                                    orderStatus[14] = 2;//订单成功;

                                                    orders.forEach(function (v, i) {
                                                        var order_status = orders[i].tk_status ? orderStatus[orders[i].tk_status] : 0;
                                                        checkOrder(orders[i].trade_id, order_status)

                                                    });
                                                }
                                            }

                                        }
                                    }
                                })
                            }

                        }
                    })


                })
            }
        });


        sleep(1000 * 90);
        num++;
        tree_day_ago = tree_day_ago - every_times;
    }

}


/**
 * 获取订单信息
 */
function orderList() {

    let twentyAgo = encodeURIComponent(comm.twentyAgo());
    let url = 'http://apiorder.vephp.com/order?vekey=V00001480Y07670769&start_time=' + twentyAgo;
    //let url = 'http://apiorder.vephp.com/order?vekey=V00001480Y07670769&start_time=2019-03-13%2009:16:21';
    // let url = 'http://apiorder.vephp.com/order?vekey=V00001480Y07670769&start_time=2019-03-04%2014:57:21';
    // console.log("url"+JSON.stringify(url))return;
    request({
        url: url,
        method: "GET",
        json: false,
        headers: {
            "content-type": "text/html; charset=utf-8",
        },
        //body: JSON.stringify(requestData)
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            var parser = jison.parse(body);
            let orders = parser.data;
            if (orders) {
                if (orders.length > 0) {

                    let orderStatus = [];
                    orderStatus[3] = 2;//订单结算
                    orderStatus[12] = 1;//订单付款;
                    orderStatus[13] = 3;//订单失效;
                    orderStatus[14] = 2;//订单成功;


                    let addSql = 'insert IGNORE into ecs_alimama_order (create_time,click_time,title,shop_id,shop_master,shop_name,`count`,total_price,order_status,order_type,real_price,jiesuan_price,jiesuan_time,yugu_yongjin,yongjin,yongjin_price,`order`,meiti_id,guanggao_id) values';

                    var orderCount = 0;
                    orders.forEach(function (v, i) {
                        var order_status = orders[i].tk_status ? orderStatus[orders[i].tk_status] : 0;
                        var create_time = orders[i].create_time ? comm.timeToStmp(orders[i].create_time) : 0;
                        var click_time = orders[i].click_time ? comm.timeToStmp(orders[i].click_time) : 0;
                        var jiesuan_time = orders[i].earning_time ? comm.timeToStmp(orders[i].earning_time) : 0;
                        var yongjin = orders[i].total_commission_rate ? orders[i].total_commission_rate : 0;
                        if (checkOrder(orders[i].trade_id, order_status)) {
                            return;
                        } else {

                            yongjin = Math.floor(Number(yongjin) * 1000) / 10;
                            addSql += "(" + create_time + "," + click_time + ",'" + orders[i].item_title + "','" + orders[i].num_iid + "','" + orders[i].seller_nick + "','" + orders[i].seller_shop_title + "'," + orders[i].item_num + "," + orders[i].price + "," + order_status + ",'" + orders[i].order_type + "'," + orders[i].alipay_total_price + ",0," + jiesuan_time + "," + orders[i].commission + "," + yongjin + "," + orders[i].pub_share_pre_fee + ",'" + orders[i].trade_id + "'," + orders[i].site_id + ",'" + orders[i].adzone_id + "'),";
                            orderCount++;
                        }

                    });

                    addSql = addSql.substring(0, addSql.lastIndexOf(','));//去掉最后一个逗号
                    db.query(addSql, function (error, results, fields) {
                        if (error) {
                            console.log("error:" + JSON.stringify(error));
                            return;
                        }
                    })

                }
            } else {
                console.log('empty' + JSON.stringify(body))
            }

        }

    })
}

/**
 * 获取订单信息
 */
function orderList1() {
    othlogger.info("getOrderStart", "=========================>")
    let all_sid_sql = "select sid from ecs_tbke where unix_timestamp(now())<expire_time";
    db.query(all_sid_sql, function (e, r) {
        if (e) {
            errlogger.error("timener=>all_sid_sql ERROR:", "error:" + JSON.stringify(e) + "\n" + "sql" + all_sid_sql);
        }
        if (r.length > 0) {
            r.forEach(function (v, i) {
                let twentyAgo = encodeURIComponent(comm.twentyAgo());
                let sid = r[i].sid;
                let zetaoke_url = "https://api.zhetaoke.com:10001/api/open_dingdanchaxun.ashx?appkey=" + appkey + "&sid=" + sid + "&start_time=" + twentyAgo + "&span=1200&signurl=1";

                request({
                    url: zetaoke_url,
                    method: "GET",
                    json: true,
                    headers: {
                        //"content-type": "text/html; charset=utf-8",
                        "content-type": "application/json",
                    },

                }, function (error, response, body) {

                    if (body) {
                        let url = body.url || "";
                        if (url) {
                            request({
                                url: url,
                                method: "GET",
                                json: false,
                                headers: {
                                    "content-type": "text/html; charset=utf-8",

                                },

                            }, function (error, response, body) {
                                if (body) {
                                    let data = jison.parse(body);
                                    if (data) {
                                        let results = data.tbk_sc_order_get_response.results;
                                        if (results) {
                                            let orders = results.n_tbk_order ? results.n_tbk_order : [];
                                            if (orders.length > 0) {
                                                let orderStatus = [];
                                                orderStatus[3] = 2;//订单结算
                                                orderStatus[12] = 1;//订单付款;
                                                orderStatus[13] = 3;//订单失效;
                                                orderStatus[14] = 2;//订单成功;

                                                let addSql = 'insert IGNORE into ecs_alimama_order (create_time,click_time,title,shop_id,shop_master,shop_name,`count`,total_price,order_status,order_type,real_price,jiesuan_price,jiesuan_time,yugu_yongjin,yongjin,yongjin_price,`order`,meiti_id,guanggao_id) values';

                                                var orderCount = 0;
                                                orders.forEach(function (v, i) {
                                                    var order_status = orders[i].tk_status ? orderStatus[orders[i].tk_status] : 0;
                                                    var create_time = orders[i].create_time ? comm.timeToStmp(orders[i].create_time) : 0;
                                                    var click_time = orders[i].click_time ? comm.timeToStmp(orders[i].click_time) : 0;
                                                    var jiesuan_time = orders[i].earning_time ? comm.timeToStmp(orders[i].earning_time) : 0;
                                                    var yongjin = orders[i].total_commission_rate ? orders[i].total_commission_rate : 0;
                                                    if (checkOrder(orders[i].trade_id, order_status)) {
                                                        return;
                                                    } else {

                                                        yongjin = Math.floor(Number(yongjin) * 1000) / 10;
                                                        addSql += "(" + create_time + "," + click_time + ",'" + orders[i].item_title + "','" + orders[i].num_iid + "','" + orders[i].seller_nick + "','" + orders[i].seller_shop_title + "'," + orders[i].item_num + "," + orders[i].price + "," + order_status + ",'" + orders[i].order_type + "'," + orders[i].alipay_total_price + ",0," + jiesuan_time + "," + orders[i].commission + "," + yongjin + "," + orders[i].pub_share_pre_fee + ",'" + orders[i].trade_id + "'," + orders[i].site_id + ",'" + orders[i].adzone_id + "'),";
                                                        orderCount++;
                                                    }

                                                });
                                                addSql = addSql.substring(0, addSql.lastIndexOf(','));//去掉最后一个逗号
                                                db.query(addSql, function (error, results) {
                                                    if (error) {
                                                        errlogger.error("timener=>addSql ERROR:", "error:" + JSON.stringify(error) + "\n" + "sql:" + addSql);
                                                        return;
                                                    }
                                                })


                                            }
                                        }

                                    }
                                }
                            })
                        }
                    } else {
                        errlogger.error("timener=>zetaoke_url", "url" + zetaoke_url + "\n" + JSON.stringify(body));
                    }
                })

            });
        }

    })

}


/**
 * 检查订单是否记录过，根据返回的订单状态修改数据库的订单状态
 * @param orderNumber  订单编号
 * @param orderStatus   订单状态
 * @returns {boolean}  返回boolean
 */

function checkOrder(orderNumber, orderStatus) {

    if (orderStatus > 1) {
        let order_sql = "select order_status,`status` from ecs_alimama_order where `order`= '" + orderNumber + "'";

        db.query(order_sql, function (error, results, fields) {
            if (error) {
                return false;
            }
            if (results.length > 0) {

                if (orderStatus == results[0].order_status) {
                    return true
                } else {
                    if (orderStatus == 2 && results[0].status == 2) {
                        db.query("update ecs_alimama_order set order_status=2,status=4 where `order`= '" + orderNumber + "'", function (error, results, fields) {
                            if (error) {
                                return false;
                            } else {
                                return true;
                            }
                        })

                        db.query("update ecs_order_info set order_status=102 where order_sn= '" + orderNumber + "'", function (error, results, fields) {
                            if (error) {
                                return false;
                            } else {
                                return true;
                            }
                        })

                        db.query("update ecs_user_order set status= 4 where ali_order= '" + orderNumber + "'", function (error, results, fields) {
                            if (error) {
                                return false;
                            } else {
                                return true;
                            }
                        })

                    } else if (orderStatus == 3 && results[0].status == 2) {
                        db.query("update ecs_alimama_order set order_status=3 where `order`= '" + orderNumber + "'", function (error, results, fields) {
                            if (error) {
                                return false;
                            } else {
                                return true;
                            }
                        })
                    } else {
                        return false
                    }

                }
            } else {
                return false;
            }

        })


        return false;

    } else {
        return false;
    }

}


//自己写的一个延迟函数
function sleep(milliSeconds) {
    var StartTime = new Date().getTime();
    let i = 0;
    while (new Date().getTime() < StartTime + milliSeconds) ;

}


module.exports = router;
