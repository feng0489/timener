let express = require('express');
let request = require('request');
let router = express.Router();

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

    let url = `http://ai.taobao.com/search/getItem.htm?_tb_token_=4fx6Pb6Bvqn&__ajax__=1&pid=mm_275260180_338750239_96315850258&unid=1&key=%27%27&page=1&pageSize=60&ppage=0&maxPageSize=200&neednav=1&npx=100&pageNav=true&sourceId=search&specialCount=6&target=item`;
    request({
        url: url,
        method: "GET",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        //body: JSON.stringify(requestData)
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            res.send(body);
            return ;
        }
    });
});


router.all('/index', function(req, res) {

    let uid      = parseInt(req.query.uid) ||0;
    let result = {
        'code':'200',
        'msg':'ok',
        'data':'',
    }

    if(uid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    //获取用户的基本信息
    let user_sql = 'select user_id,user_name,pid from ecs_users where user_id='+uid;
    db.query(user_sql,function(errors, results, fields){
        if (errors){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        if(results.length >0 ){
            let user = results[0];

            if(user.pid){//已经存在pid
                let url = 'http://ai.taobao.com/search/getItem.htm?_tb_token_=4fx6Pb6Bvqn&__ajax__=1&pid='+user.pid+'&unid=1&key=%27%27&page=1&pageSize=60&ppage=0&maxPageSize=200&neednav=1&npx=100&pageNav=true&sourceId=search&specialCount=6&target=item';
                request({
                    url: url,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    //body: JSON.stringify(requestData)
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if((body.result.auction).length > 0){
                            result.data = body;
                            let goods =body.result.auction;
                            goods = goods.sort(comm.descSort('couponAmount'));
                            let list = [];
                            for(let i=0;i<60;i++){
                                let entity = {}
                                entity.title = goods[i].description;
                                entity.pic_url = 'http:' + goods[i].originalPicUrl;
                                entity.shop_id = goods[i].itemId;
                                entity.saleCount = parseInt(goods[i].saleCount)>10000 ? parseInt(goods[i].saleCount)/10000 +'万':parseInt(goods[i].saleCount);
                                entity.city = goods[i].itemLocation;
                                entity.realPrice = goods[i].realPrice;
                                entity.price = goods[i].price;
                                entity.nick = goods[i].nick;
                                entity.click_url = 'http:' + goods[i].clickUrl;
                                entity.shop_type = parseInt(goods[i].userType) || 0;
                                entity.couponAmount = parseInt(goods[i].couponAmount)>0 ? parseInt(goods[i].couponAmount) * 0.01 : 0;
                                if( entity.couponAmount>0){
                                    list.push(entity)
                                }
                            }
                            result.data = list;
                            res.send(result);
                        }else{
                            res.send(result);
                        }

                    }else{
                        result.code = '404';
                        result.msg = '网络异常';
                        res.send(result);
                    }

                });
            }else{//不存在pid
             let pid_sql = 'select id,pid from ecs_pid  where `status` =0 order by use_count asc,id asc limit 1';

                db.query(pid_sql,function(errs, rest, fiel){
                    if (errs){
                        result={
                            'code':'140023',
                            'msg':'发生未知错误，请客服！',
                            'data':''
                        }
                        res.send(result);
                        return;
                    }
                    let pids = rest[0];
                    let updateuser_sql = "update ecs_users set pid='"+pids.pid+"' where user_id="+uid;
                    db.query(updateuser_sql,function(ers, rests, field){
                        if (errs){
                            result={
                                'code':'140024',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }

                    });

                    let updatepid_sql = "update ecs_pid set use_count=use_count+1 where id="+pids.id;
                    db.query(updatepid_sql,function(ers, rests, field){
                        if (errs){
                            result={
                                'code':'140024',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }

                    });

                    let url = 'http://ai.taobao.com/search/getItem.htm?_tb_token_=4fx6Pb6Bvqn&__ajax__=1&pid='+pids.pid+'&unid=1&key=%27%27&page=1&pageSize=60&ppage=0&maxPageSize=200&neednav=1&npx=100&pageNav=true&sourceId=search&specialCount=6&target=item';
                    request({
                        url: url,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        //body: JSON.stringify(requestData)
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            if((body.result.auction).length > 0){
                                let goods =body.result.auction;
                                goods = goods.sort(comm.descSort('couponAmount'));
                                let list = [];
                                for(let i=0;i<60;i++){
                                    let entity = {}
                                    entity.title = goods[i].description;
                                    entity.pic_url = 'http:' + goods[i].originalPicUrl;
                                    entity.shop_id = goods[i].itemId;
                                    entity.saleCount = parseInt(goods[i].saleCount)>10000 ? parseInt(goods[i].saleCount)/10000 +'万':parseInt(goods[i].saleCount);
                                    entity.city = goods[i].itemLocation;
                                    entity.realPrice = goods[i].realPrice;
                                    entity.price = goods[i].price;
                                    entity.nick = goods[i].nick;
                                    entity.click_url = 'http:' + goods[i].clickUrl;
                                    entity.shop_type = parseInt(goods[i].userType) || 0;
                                    entity.couponAmount = parseInt(goods[i].couponAmount)>0 ? parseInt(goods[i].couponAmount) * 0.01 : 0;
                                    if( entity.couponAmount>0){
                                        list.push(entity)
                                    }

                                }
                                result.data = list;
                                res.send(result);
                            }else{
                                res.send(result);
                            }

                        }else{
                            result.code = '404';
                            result.msg = '网络异常';
                            res.send(result);
                        }

                    });


                });


            }

        }else{
            res.send(result);
        }

    });



});


module.exports = router;
