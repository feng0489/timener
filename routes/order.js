let express = require('express');
let router = express.Router();
let request = require('request');


let comm = require('./common.js');
let db = require('./mysql.js');


/* GET users listing. */
router.all('/', function(req, res) {

    res.send('respond with a resource');

});


/* GET users listing. */
router.all('/add', function(req, res) {
  res.send('respond with a resource');
});


router.all('/delete', function(req, res) {
    res.send('respond with a resource');
});

router.all('/list', function(req, res) {
    res.send('respond with a resource');
});
/**
 * 我的订单
 */
router.all('/myOrder', function(req, res) {


    let uid      = parseInt(req.query.uid) ||0;
    let page     = parseInt(req.query.page) ||0;
    let pageSize = parseInt(req.query.pageSize) ||10;
    let listType = parseInt(req.query.listType) ||0;

    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }


    let result = {
        'code':'200',
        'msg':'ok',
        'data':{
            'page':page,
            'totalpage':1,
            'list':'',
            'moth_total':0
        }
    };


    //我的订单
    let my_order_count_sql = "select count(order_id) as count from ecs_order_info where user_id="+uid;
    db.query(my_order_count_sql,function(error, rest){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }
        if(rest.length >0 ){
            if(parseInt(rest[0].count)>0){//如果有订单记录则 进行订单遍历
                let order_count = parseInt(rest[0].count);
                result.data.totalpage = Math.ceil(order_count/pageSize);
                let pageInfo = page * pageSize;

                //查询订单
                let my_order_sql = "select order_id,order_sn,user_id,order_status,integral,goods_amount,order_amount,add_time,postscript,goods_img,huoyuedu from ecs_order_info where user_id="+uid+" order by order_id desc limit "+pageInfo+", "+pageSize;

                db.query(my_order_sql,function(error, rest) {
                    if (error) {
                        result = {
                            'code': '140023',
                            'msg': '发生未知错误，请客服！',
                            'data': ''
                        }
                        res.send(result);
                        return;
                    }

                    if(rest.length>0){
                       let order_status = [];
                            order_status[1] = '已付款';
                            order_status[102] = '已结算';
                            order_status[3] = '已失效';

                        rest.forEach(function (v,i) {
                            rest[i].order_status = order_status[rest[i].order_status];
                            rest[i].add_time =comm.stampToTime(rest[i].add_time);

                        });
                        result.data.list = rest;
                    }

                    //获取本月的数据
                    if(listType == 0){
                        let startTime = comm.firstDayOfMonth();
                        let endTime = comm.nowToStemp();

                        let moth_order_sql = "select sum(pay_points) as gouwu_points from ecs_account_log where user_id="+uid+" and change_type in(95,96,2) and change_time >="+startTime+" and change_time <= "+endTime;
                        db.query(moth_order_sql,function(error, rest) {
                            if (error) {
                                result = {
                                    'code': '140024',
                                    'msg': '发生未知错误，请客服！',
                                    'data': ''
                                }
                                res.send(result);
                                return;
                            }

                            if (rest.length > 0) {
                                if(parseInt(rest[0].gouwu_points)>0){
                                    result.data.moth_total = rest[0].gouwu_points;
                                }
                            }

                            res.send(result);

                        })


                    }else{
                        res.send(result);
                    }

                });
            }else{
                res.send(result);
            }

        }else{
            res.send(result);
        }



    });



});

/**
 * 团队订单
 */
router.all('/teamOrder', function(req, res) {

    let uid      = parseInt(req.query.uid) ||0;
    let page     = parseInt(req.query.page) ||0;
    let pageSize = parseInt(req.query.pageSize) ||10;

    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }


    let result = {
        'code':'200',
        'msg':'ok',
        'data':{
            'page':page,
            'totalpage':1,
            'list':''
        }
    };


    //团队订单
    let my_childs_sql = "select user_id from ecs_users where parent_id="+uid;
    db.query(my_childs_sql,function(error, rest){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }
        if(rest.length >0 ){

                let childs_id = "";

                rest.forEach(function (v,i) {
                    if(childs_id){
                        childs_id += ","+ v.user_id;
                    }else {
                        childs_id +=  v.user_id;
                    }

                    
                });

                //统计订单的数量
                let childs_order_count_sql = 'select count(order_id) as count from ecs_order_info where user_id in ('+childs_id+')';

                db.query(childs_order_count_sql,function(error, rest) {
                    if (error) {
                        result = {
                            'code': '140023',
                            'msg': '发生未知错误，请客服！',
                            'data': ''
                        }
                        res.send(result);
                        return;
                    }

                    if(parseInt(rest[0].count)>0){//如果有订单记录则 进行订单遍历
                        let order_count = parseInt(rest[0].count);
                        result.data.totalpage = Math.ceil(order_count/pageSize);
                        let pageInfo = page * pageSize;
                        //查询订单
                        let childs_order_sql = "select order_id,order_sn,user_id,order_status,integral,goods_amount,order_amount,add_time,postscript,goods_img,huoyuedu from ecs_order_info where user_id in ("+childs_id+") order by order_id desc limit "+pageInfo+", "+pageSize;

                        db.query(childs_order_sql,function(error, rest) {
                            if (error) {
                                result = {
                                    'code': '140024',
                                    'msg': '发生未知错误，请客服！',
                                    'data': ''
                                }
                                res.send(result);
                                return;
                            }

                            if(rest.length>0){
                                let order_status = [];
                                order_status[1] = '已付款';
                                order_status[102] = '已结算';
                                order_status[3] = '已失效';

                                rest.forEach(function (v,i) {
                                    let order_sn = v.order_sn
                                    rest[i].order_sn = order_sn.substring(0,4)+'***'+order_sn.substring(order_sn.length-4);
                                    rest[i].order_status = order_status[rest[i].order_status];
                                   rest[i].huoyuedu =  Math.floor(rest[i].huoyuedu * 0.5);
                                    rest[i].add_time =comm.stampToTime(rest[i].add_time);
                                });

                                result.data.list = rest;

                                res.send(result);

                            }else{
                                res.send(result);
                            }
                        });

                    }else{
                        res.send(result);
                    }

                });


        }else{
            res.send(result);
        }
    });

});

module.exports = router;
