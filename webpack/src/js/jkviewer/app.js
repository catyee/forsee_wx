import { appUtil } from '../utils/app.util';
import { appModel } from '../common/app-model';

var prId = appUtil.getParameter('prid');
appModel.getPowerRoomById(prId).subscribe(function (res) {

    try {
        var powerRoom = res.entity;
        var server = powerRoom.server;
 
        var ax = new ActiveXObject("WEBVIEWX.WebViewXCtrl.1");
        document.write('<OBJECT ID="webX" height=100% width=100% CLASSID="CLSID:EE1272EB-144F-485B-9A1B-DC2FE6B07AA3" codebase="../resource/fmWebPackage.CAB#version=7,6,0,49"> </OBJECT>');
        webX.browserLang=navigator.browserLanguage;
        webX.SrvName= server.serverAddress
        webX.SrvParam="user="+server.userName+",password="+server.password
        webX.SrvPort=5008
        webX.SrvTimeout=5
        webX.UpdateTime=300
        webX.FirstFile=powerRoom.mainStartScreen
        webX.AutoFitScreen=0
        webX.FullScreen=0
        webX.DisplayLogInfo=0
        webX.OcxBackColor=16776187
        webX.AutoLogoffIdleMinute=0
    } catch(e) {
        document.write('您尚未安装控件，请<a href="../resource/fmWebPackage.exe" download="fmWebPackage.exe">下载安装</a>');
    }
})
