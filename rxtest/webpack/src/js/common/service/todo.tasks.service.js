import { http } from '../../utils/http.util';
import { userInfo } from './user.info.service';
import { dateUtil } from '../../utils/date.util';
import { ROLES } from '../app-enum';
let $ = require('jquery');

const service = {
    initerval: 30000,
    timer: null,
    start: function () {

        // 只有组团长 巡检组长 抢修组长才可以使用
        if (userInfo.roleId === ROLES.ZTZ || userInfo.roleId === ROLES.XJZZ || userInfo.roleId === ROLES.QXZZ) {

            if (this.timer) {
                clearInterval(this.timer);
            }

            this.getTasks();
            this.timer = setInterval(() => {
                this.getTasks();
            }, this.initerval);
        }

    },
    getTasks: function () {
        const data = {
            employeeId: userInfo.employeeId,
            roleId: userInfo.roleId
        }
        http.get('/ems/rest/common/statistics/home/ems', data).subscribe(res => {
            if (res.code === 200) {
                this.render(res.body);
            }
        })
    },
    render: function (data) {
        let prTask = (data.tfCount + data.fjCount);
        // 配电室任务
        if (prTask) {
            $("#power-room-badge").text(prTask);
            $("#power-room-badge").show();
        } else {
            $("#power-room-badge").text(0);
            $("#power-room-badge").hide();
        }

        // 报警数量
        if (data.alarmCount) {
            $("#alarm-badge").text(data.alarmCount);
            $("#alarm-badge").show();
        } else {
            $("#alarm-badge").text(0);
            $("#alarm-badge").hide();
        }

        // 巡检问题数量
        if (data.xjProblemCount) {
            $("#inspection-bug-badge").text(data.xjProblemCount);
            $("#inspection-bug-badge").show();
        } else {
            $("#inspection-bug-badge").text(0);
            $("#inspection-bug-badge").hide();
        }

        // 操作票数量
        if (data.czpCount) {
            $("#operation-ticket-badge").text(data.czpCount);
            $("#operation-ticket-badge").show();
        } else {
            $("#operation-ticket-badge").text(0);
            $("#operation-ticket-badge").hide();
        }

        // 工作票数量
        if (data.gzpCount) {
            $("#work-ticket-badge").text(data.qxCount);
            $("#work-ticket-badge").show();
        } else {
            $("#work-ticket-badge").text(0);
            $("#work-ticket-badge").hide();
        }

        //　抢修单数量
        if (data.qxCount) {
            $("#repair-order-badge").text(data.qxCount);
            $("#repair-order-badge").show();
        } else {
            $("#repair-order-badge").text(0);
            $("#repair-order-badge").hide();
        }

        // 配电室列表页面的任务
        $("#task-alarm-count").text(data.alarmCount);
        $("#task-repair-order-count").text(data.qxCount);
        $("#task-inspection-bug-count").text(data.xjProblemCount);

        let arrangeDate = '';
        let distance = dateUtil.getDateDistance(data.arrangedDate);
        if (distance <= 0) {
            arrangeDate = '今日未安排';
        } else if (distance == 1) {
            arrangeDate = '明日未安排';
        } else {
            arrangeDate = '已安排到' + data.arrangedDate;
        }

        $("#task-inspection-arrange-date").text(arrangeDate)

    }
}

exports.TodoTasksService = service;