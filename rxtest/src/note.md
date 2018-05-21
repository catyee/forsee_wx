<!--  -->

1. es6相关知识点  es7 es8
    - let和var
        - 所声明的变量只在let命令所在的代码块有效 {let a = 10; var b = 1;} a // ReferenceError: a is not defined. b // 1
        - var a = 2; 首先声明一个变量a，然后初始化a为undefined，然后a赋值为2
        - let a = 2;  声明 不进行初始化
        - let适合for循环的计数器
        - let不存在变量提升 var命令会发生变量提升的现象，即变量可以在声明之前使用，值为undefined，let必须在声明之后使用否则会报错
        - let 暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。
        - let不允许在相同作用域内，重复声明同一个变量。
    - 箭头函数 
        - 箭头函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。
        - 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。
        - 不可以使用arguments对象，该对象在函数体内不存在，如果要用，可以用rest参数代替。
        - 不可以使用yield命令，因此箭头函数不能用作Generator函数。
        - 箭头函数没有自己的this，而是引用外层的this，不能用call(),apply(),bind()这些方法改变this的指向
    - promise 三种状态
        - promise对象的状态不受外界影响，promise对象代表一个异步操作，有三种状态 pending(进行中)，fulfilled（已成功）和rejected（已失败），只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
        - 一旦状态改变，就不会再变，任何时候都可以得到这个结果，Promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected。只要这两种情况发生，状态就凝固了，不会再变了。
        - promise也有一些缺点，首先，无法取消promise，一旦新建它就会立即执行，无法中途取消，其次，如果不设置回调函数，Promise内部抛出的错误，不会反应到外部，第三，当处于pending状态时，无法得知目前发展到哪一个阶段（刚刚开始还是即将完成）。
    - generator
        - Generator函数是一个状态机，封装了多个内部状态，执行Genrator函数会返回一个遍历器对象，也就是说，Generator函数除了状态机，还是一个遍历器对象生成函数，返回的遍历器对象，可以一次Generator函数内部的每一个状态。
        - 特征：function关键字与函数名之间有一个星号；函数体内部使用yield表达式，定义不同的内部状态
    - 变量提升
2. ajax
    - jquery ajax参数 跨域走哪个函数
    - ajax缺点 
3. http
    - http请求方式
        - GET(URL),POST(data body),PUT(data body),DELETE(url),OPTIONS,HEAD,TRACE
        - get和post区别
            - GET和POST本质上就是TCP链接，并无差别。但是由于HTTP的规定和浏览器/服务器的限制，导致他们在应用过程中体现出一些不同。
            - GET产生一个TCP数据包；POST产生两个TCP数据包。
            - GET请求在浏览器回退时是无害的，POST请求会再次提交请求
            - GET产生的URL可以被当作书签，GET不可以
            - GET请求会被浏览器主动cache，而POST不会，除非手动设置。
            - GET请求只能进行url编码，而POST支持多种编码方式。
            - GET请求参数会被完整保留在浏览器历史记录里，而POST中的参数不会被保留。
            - GET请求在URL中传送的参数是有长度限制的，而POST么有。
            - 对参数的数据类型，GET只接受ASCII字符，而POST没有限制。
            - GET比POST更不安全，因为参数直接暴露在URL上，所以不能用来传递敏感信息。
            - GET参数通过URL传递，POST放在Request body中。

    - 请求头
        - headers: {'Content-Type': 'application/json'}
    - 如何跨域
        - jsonp跨域 script标签允许跨域请求  只允许GET
        - CORS跨域 后端设置header Access-Control-Allow-Origin
    - 状态码 重定向
        - 200 请求成功
        - 301永久重定向
        - 302临时重定向
        - 404
        - 500
    - Content-Type字段的值：   MIME类型
        - text/plain,text/html,text/css,image/jpeg,image/png,image.svg+xml,audio/mp4,video/mp4,application/javascript,application/pdf,application/zip,application/atom+xml,application/x-www-form-urlencoded, application/json
             - HTTP/1.0的缺点是每个TCP连接只能发送一个请求，发送数据完毕，连接就关闭，如果还要请求其他资源，就必须再建一个连接。为了解决这个问题，有些浏览器请求时用了一个非标准的Connection字段 Connection: keep-alive;这个字段要求服务器不要关闭TCP连接，以便其他请求复用，服务器同样回应这个字段，一个可以复用的TCP连接就建立了，直到客户端或服务器主动关闭连接，但这不是标准字段。
             - HTTP/1.1的最大变化就是引入了持久连接，即TCP连接默认不关闭，可以被多个请求复用，不用声明 Connection: keep/alive,还引入了管道机制，即在同一个TCP连接里面，客户端可以同时发送多个请求，Content-length字段，分块传输编码
             - HTTP/2 二进制协议 多工 数据流 客户端可以指定优先级 头信息压缩 服务端推送 只有在HTTPS环境才会生效
    
4. 闭包理解 数据类型判断及转换
    - 
5. 事件循环机制 settimeout原理   
6. storage和cookie
7. 移动端调试
8. 抓包工具 自动化工具
9. 数组排序
10. 数组常用方法 map和foreach 具体实现及区别
11. 数组去重 
12. split是把字符串切割成数组， join将数组结合成一个字符串
13. 跨域的方式 jsonp的原理
14. 模块化的理解
15. 函数式编程理解
16. rxjs用法 理解
17. 继承方式 面向对象 预解释题目
18. 浏览器兼容
19. 手机端兼容
20. rem适配js
21. pc端优化
22. call，apply，bind
23. 微信支付
24. 小程序
25. 火狐和谷歌区别 浏览器内核
26. 对象都是大括号吗 大括号都是对象吗
27. svg，canvas，webgl，threejs
28. 懒加载实现 不用插件
29. 懒加载和延迟加载是一回事吗
30. 获取屏幕宽高 移动端
31. 盒子模型属性
32. jq封装一个插件
33. 怎么用$或是jq传入实参形参能够接受呢，一般怎么写，为何实参传入jq形参能够用$，或是相反;为何jq可以实现链式写法
34. zepto和jq区别
35. vue服务端渲染配置，vue服务端渲染怎么做
36. 数组没有第三个索引，一共两个索引，长度为三，直接给第四个赋值，第三个值为多少？
37. 刷新页面时候form表单重复提交
38. 数组查取重复项
39. 后台语言
40. 数据结构二叉树，
41. 深度和浅拷贝
42. submit重复提交
43. 文本对比，怎么把一个元素转化为一个文本内容
44. 设置滚动条样式
45. 登陆做法
46. angular, node, phonegrap,type.js
47. 类型检测
48. 性能优化
49. git merge和git rebase区别
50. css 像素单位 解释及应用
51. line-height参数
52. margin padding
53. 清除浮动
54. 拖拽原生，jq拖拽
55. 动画jq,js,css, 混合开发
56. 外边距塌陷问题
57. 外边距塌陷问题 垂直居中 水平居中 块级元素 行内元素 区别
58. BFC
59. 100% 相对于谁来说
60. angular双向绑定实现原理
61. box-sizing
62. css3相关问题 动画
63. proxy
64. vue


