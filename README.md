
# 封装 WebSocket

## 功能

- 保证客户端 `WebScket` 与服务端连接状态
- 自动重连
- 心跳检测

## 使用方法

```js
import Websocket from './webSocket.js';

// 实例化ws
const ws1 = new Websocket({
  url: 'localhost:8080',
  pingMsg: 'ping1',
  onmessage: (data) => { console.log(data); }
});

// 开始连接ws
ws1.init();

// 手动断开连接，注：手动断开的话不会再进行重连和心跳检测
setTimeout(() => {
  ws1.close();
}, 10000);
```

## 参数设置

参数 | 描述 | 类型 | 默认值
---|---|---|---
url | 请求接口路径（无需写wss://或ws://），必填 | string | -
reconnectLimit | 重连次数限制（-1为无限制） | number | 10
reconnectionTimeout | 重连时间间隔（毫秒） | nunmber | 3000
pingMsg | 心跳发送给服务端的数据 | stirng | -
pingTimeout | 心跳时间间隔（毫秒） | number | 3000
onmessage | 收到服务端消息后的回调 | func | -
