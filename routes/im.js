var express = require('express');
var router = express.Router();



var db = require('./mysql.js');


/* GET users listing. */
router.all('/', function(req, res) {
    res.send("No Message !");

});

/* GET users listing. */
router.all('/list', function(req, res) {//this function for Ajax_getImMsg

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

    //最近联系人聊天信息
    var sql = "select *,msg_time as sort_time from ecs_user_friends where (uid="+uid +" or fid ="+uid+") and msg_time>0 order by msg_time desc  limit 0,60";

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
            var talk = [];
            results.forEach(function(v,i,a){
                var iid =  results[i].fid +results[i].uid;
                talk[iid] = results[i];
            })
            var k=0;
            var arr = [];
            talk.forEach(function(item,index,input){
                arr[k] = talk[index];
                k ++;
            });

            result = {
                'code':'200',
                'msg':'ok',
                'data':arr
            };

            res.send(result);
        }else{

            res.send(result);
        }

    })

});


/* GET users listing. */
router.all('/listNew', function(req, res) {// this function for Ajax_getImOneMsg

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

  
    //最近联系人聊天信息
    var sql =  "select *,msg_time as sort_time from ecs_user_friends where fid ="+uid+" and msg_count >0 order by msg_time desc limit 0,20";

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
            // var talk = [];
            // results.forEach(function(v,i,a){
            //     var iid =  results[i].fid +results[i].uid;
            //     talk[iid] = results[i];
            // })
            // var k=0;
            // var arr = [];
            // talk.forEach(function(item,index,input){
            //     arr[k] = talk[index];
            //     k ++;
            // });

            result = {
                'code':'200',
                'msg':'ok',
                'data':results
            };
            res.send(result);
        }else{
            res.send(result);
        }

    });

});


/* GET users listing. */
router.all('/listMsg', function(req, res) {// this function for Ajax_getMsg

    var uid = parseInt(req.query.uid) ||0;
    var fid = parseInt(req.query.fid) ||0;
    var page = parseInt(req.query.page) ||0;
    var pagesize = parseInt(req.query.pagesize) || 10;

    var result = {
        'code':'200',
        'msg':'ok',
        'data':''
    };
    if(uid==0 || fid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    var pageInfo = parseInt(page) * parseInt(pagesize);
    var user_sql = "SELECT * FROM `ecs_feedback` where (user_id = "+uid+" and `to_user_id`="+fid+") or (user_id = "+fid+" and `to_user_id`="+uid+") and status<2 ORDER BY `msg_id` desc limit "+pageInfo+","+pagesize;

    db.query(user_sql,function(error, results, fields){
        if (error){
            result={
                'code':'140022',
                'msg':'发生未知错误，请客服！',
                'data':''
            }
            res.send(result);
            return;
        }

        var firend_count_sql = "update ecs_user_friends set msg_count=0 where uid="+fid+" and fid="+uid;
        db.query(firend_count_sql,function(err, rows){
            if(err){
                result={
                    'code':'140023',
                    'msg':'发生未知错误，请客服！',
                    'data':''
                }
                res.send(result);
                return;
            }
        })

        if(results.length >0){
            var json={
                "page":page,
                "list":results,
            }
            result = {
                'code':'200',
                'msg':'ok',
                'data':json
            };
            res.send(result);
        }else{
            res.send(result);
        }

    });

});

/* GET users listing. */
router.all('/listMsgNew', function(req, res) {// this function for Ajax_getMsgone

    var uid      = parseInt(req.query.uid) || 0;
    var fid      = parseInt(req.query.fid) || 0;
    var msg_id   = parseInt(req.query.msg_id) ||0;
    var page     = parseInt(req.query.page) ||0;
    var pagesize = parseInt(req.query.pagesize) || 10;

    var result = {
        'code':'200',
        'msg':'ok',
        'data':''
    };
    if(uid==0 || fid==0){
        result={
            'code':'140021',
            'msg':'非法访问',
            'data':''
        }
        res.send(result);
        return;
    }

    if(msg_id == 0){
        var usermsg_sql = "SELECT msg_id FROM `ecs_feedback` where user_id = "+fid+" and `to_user_id`="+uid+" and status<2 ORDER BY `msg_id` desc limit 1";
        db.query(usermsg_sql,function(error, results, fields){
            if (error){
                result={
                    'code':'140022',
                    'msg':'发生未知错误，请客服！',
                    'data':''
                }
                res.send(result);
                return;
            }
            msg_id = results.length >0 ? results[0].msg_id : 0 ;
            if(msg_id == 0){
                res.send(result);
                return;
            }

            //uid发送的信息
            var pageInfo = parseInt(page) * parseInt(pagesize);
            var user_sql = "SELECT * FROM `ecs_feedback` where user_id = "+fid+" and `to_user_id`="+uid+" and msg_id>"+msg_id+"  and status<2  ORDER BY `msg_id` desc limit "+pageInfo+","+pagesize;
            db.query(user_sql,function(errors, resultss, fieldss){
                if (errors){
                    result={
                        'code':'140023',
                        'msg':'发生未知错误，请客服！',
                        'data':''
                    }
                    res.send(result);
                    return;
                }

                if(resultss.length >0){
                    var fids = '';
                    resultss.forEach(function(v,i,a){
                        if(fids === ''){
                            fids += resultss[i].msg_id
                        }else{
                            fids += ','+resultss[i].msg_id
                        }
                    })

                    var one_sql = "update ecs_feedback set is_read=1 where msg_id in ("+fids+")";
                    db.query(one_sql,function(err, rows){
                        if(err){
                            result={
                                'code':'140024',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }
                    })

                    var firend_count_sql = "update ecs_user_friends set msg_count=0 where uid="+fid+" and fid="+uid;
                    db.query(firend_count_sql,function(err, rows){
                        if(err){
                            result={
                                'code':'140025',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }
                    })

                    result = {
                        'code':'200',
                        'msg':'ok',
                        'data':resultss
                    };
                    res.send(result);
                }else{

                    var firend_count_sql = "update ecs_user_friends set msg_count=0 where uid="+fid+" and fid="+uid;
                    db.query(firend_count_sql,function(err, rows){
                        if(err){
                            result={
                                'code':'140026',
                                'msg':'发生未知错误，请客服！',
                                'data':''
                            }
                            res.send(result);
                            return;
                        }
                    })
                    res.send(result);
                }

            });


        });

    }else{
        //uid发送的信息
        var pageInfo = parseInt(page) * parseInt(pagesize);
        var user_sql = "SELECT * FROM `ecs_feedback` where user_id = "+fid+" and `to_user_id`="+uid+" and msg_id>"+msg_id+"  and status<2  ORDER BY `msg_id` desc limit "+pageInfo+","+pagesize;
        db.query(user_sql,function(errors, resultss, fieldss){
            if (errors){
                result={
                    'code':'140027',
                    'msg':'发生未知错误，请客服！',
                    'data':''
                }
                res.send(result);
                return;
            }

            if(resultss.length >0){
                var fids = '';
                resultss.forEach(function(v,i,a){
                    if(fids === ''){
                        fids += resultss[i].msg_id;
                    }else{
                        fids += ','+resultss[i].msg_id;
                    }
                })

                var one_sql = "update ecs_feedback set is_read=1 where msg_id in ("+fids+")";
                db.query(one_sql,function(err, rows){
                    if(err){
                        result={
                            'code':'140028',
                            'msg':'发生未知错误，请客服！',
                            'data':''
                        }
                        res.send(result);
                        return;
                    }
                })

                var firend_count_sql = "update ecs_user_friends set msg_count=0 where uid="+fid+" and fid="+uid;
                db.query(firend_count_sql,function(err, rows){
                    if(err){
                        result={
                            'code':'140029',
                            'msg':'发生未知错误，请客服！',
                            'data':''
                        }
                        res.send(result);
                        return;
                    }
                })

                result = {
                    'code':'200',
                    'msg':'ok',
                    'data':resultss
                };
                res.send(result);
            }else{
                var firend_count_sql = "update ecs_user_friends set msg_count=0 where uid="+fid+" and fid="+uid;
                db.query(firend_count_sql,function(err, rows){
                    if(err){
                        result={
                            'code':'140030',
                            'msg':'发生未知错误，请客服！',
                            'data':''
                        }
                        res.send(result);
                        return;
                    }
                })

                res.send(result);
            }

        });
    }


});


module.exports = router;
