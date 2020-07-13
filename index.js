const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const app = express()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))

// session 中间件
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}))

// flash 中间件，用来显示通知
app.use(flash())


// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
  keepExtensions: true// 保留后缀
}))



// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  console.log('asd')
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 路由
routes(app)

// 监听端口，启动程序
app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`)
})


// 备注
// express：web框架
// express-session：session中间件
// connect-mongo：将session存储于MongoDB，结合express-session使用
// connect-flash：页面通知的中间件，基于session实现
// ejs：模板
// express-formidable：接收表单及文件上传的中间件
// config-lite：读取配置文件
// marked：markdown解析
// moment：时间格式化
// mongolass：mongobd驱动
// objectid-to-timestamp：根据objectId生成时间戳
// sha1：sha1加密，用于密码加密
// winston：日志
// express-winston：express的Winston日志中间件

// 1、config-lite
// config-lite 是一个轻量的读取配置文件的模块。config-lite 会根据环境变量（NODE_ENV）
// 的不同加载 config 目录下不同的配置文件。如果不设置 NODE_ENV，则读取默认的 default 
// 配置文件，如果设置了 NODE_ENV，则会合并指定的配置文件和 default 配置文件作为配置，
// config-lite 支持 .js、.json、.node、.yml、.yaml 后缀的文件。

// 2、会话
// 由于 HTTP 协议是无状态的协议，所以服务端需要记录用户的状态时，
// 就需要用某种机制来识别具体的用户，这个机制就是会话（Session）。
// app.use(session(option)) session中间件会在req上添加session对象


// 3、页面通知
// connect-flash是基于session实现的，设置初始值req.session.flash = {}
// 通过req.flash(name,value)设置这个对象下的字段和值
// 通过req.flash(name)获取这个对象下的值，同时删除这个字段

// express-session、connect-mongo和connect-flash
// express-session：会话(session)
// connect-mongo:将session存储mongodb,需结合express-session使用
// connect-flash: 基于session实现的用于通知功能的中间件，需结合express-session

// 4、权限控制



// 5、app.locals和res.locals
// 在调用 res.render 的时候，express合并（merge）了3处的结果后传入要渲染的模板，
// 优先级：res.render传入的对象> res.locals 对象 > app.locals 对象，
// app.locals和res.locals几乎没有区别，都用来渲染模板
// app.locals:通常挂载常量信息（博客名，描述，作者）
// res.locals:挂载变量信息，即每次请求可能的值都不一样

// 设置了res.render,就不用传入这四个变量了，
// express为我们自动merge并传入了模板，所以我们可以在模板中直接这些变量。

// 6、app.use 
// 在path路径上安装中间件，每当请求的路径和该path匹配时，都会导致该中间件函数被执行
