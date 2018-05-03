import { http } from '../utils/http.util';
import { userInfo } from '../common/service/user.info.service';

export const model = {
    startDate: null,
    endDate: null,

    endLine: null, // 被允许查询的最晚日期
}

model.getArrangeList = function () {
    return http.get('/ems/rest/xj/schedule/list',{
        employeeId: userInfo.employeeId,
        startDate: this.startDate,
        endDate: this.endDate
    }).map(res => {
        if(res.code === 200){

            return {
                success: true,
                list: res.body
            }

        }else if(res.code === 404){
            return {
                
            }
        }else{
            return {
                message: '获取失败'
            }
        }
    })
}