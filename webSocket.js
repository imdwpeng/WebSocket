/*
 * @Author: DWP
 * @Date: 2021-05-13 11:04:58
 * @LastEditors: DWP
 * @LastEditTime: 2021-05-13 20:10:31
 */
const readyStates = {
  0: 'CONNECTING',
  1: 'OPEN',
  2: 'CLOSING',
  3: 'CLOSED'
}

const checkPropTypes = (props, propTypes) => {
  if(!props.url) {
    throw new Error(`The \`url\` is marked as required, but its value is \`${props.url}\`.`);
  }
  for (let [key, value] of Object.entries(props)) {
    if (propTypes[key] && typeof value !== propTypes[key]) {
      throw new Error(`Invalid prop \`${key}\` of type \`${typeof value}\`, expected \`${propTypes[key]}\`.`);
    }
  }
}

class Websocket {
  constructor(params = {}) {
    // 变量类型检测
    checkPropTypes(params, Websocket.propTypes);

    this.options = Object.assign({}, Websocket.defaultProps, params);

    this.ws = null; // ws实例
    this.reconnectCount = 0; // 重连次数
    this.lockReconnect = false; // 锁定重连，连接成功时不需要重连
    this.fobidReconnect = false; // 手动关闭ws时，禁止重连
    this.pingTimeout = null; // 心跳检测定时器
  }

  // 创建ws
  init() {
    try {
      if(!window.WebSocket) return console.error('当前版本浏览器不支持WebSocket，请升级浏览器版本');
      const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
      const { url } = this.options;
      this.ws = new WebSocket(`${protocol}://${url}`);

      this.initEventHandle();
    } catch (error) {
      this.reconnect();
    }
  }

  // 监听ws事件
  initEventHandle() {
    // 打开连接
    this.ws.onopen = () => {
      // 连接成功
      if(readyStates[this.ws.readyState] === 'OPEN') {
        // 锁定重连，即不需要再重连
        this.lockReconnect = true;
        // 开启心跳检测
        this.heartbeat();
      }
    }

    // 收到服务端消息
    this.ws.onmessage = (evt) => {
      const { data } = evt;
      if (this.options.onmessage) {
        this.options.onmessage(data);
      }
      // 重新开始心跳
      this.heartbeat();
      // 此处需要事件
    }

    // 连接报错
    this.ws.onerror = () => {
      console.error('websocket is error');
      this.lockReconnect = false;
      this.reconnect();
    }

    // 连接关闭
    this.ws.onclose = () => {
      console.warn('websocket is close');
      this.reconnect();
    }
  }

  // 重连
  reconnect() {
    // 重连次数限制，-1 无限制
    if (this.options.reconnectLimit !== -1 && this.reconnectCount >= this.options.reconnectLimit) return;
    // 重连中，或者手动断开的连接，不需要重连
    if (this.lockReconnect || this.fobidReconnect) return;

    this.lockReconnect = true;

    // 重连频率：网络离线时，适当缩短请求间隔，便于在网络恢复时及时重连
    const delay = navigator.onLine ? this.options.reconnectionTimeout : 2000;

    setTimeout(() => {
      this.lockReconnect = false;
      this.reconnectCount ++;
      this.init();
    }, delay);
  } 

  // 心跳检测
  heartbeat() {
    if(this.pingTimeout) {
      clearInterval(this.pingTimeout);
    }

    this.pingTimeout = setInterval(() => {
      // 手动断开，则不再需要心跳检测
      if (this.fobidReconnect) return clearInterval(this.pingTimeout);

      // 连接断开，清除心跳检测
      if (readyStates[this.ws.readyState] !== 'OPEN') {
        this.ws.close();
        return clearInterval(this.pingTimeout);
      } 
      this.ws.send(this.options.pingMsg);
    }, this.options.pingTimeout);
  }

  // 手动关闭连接
  close() {
    // 禁止重连
    this.fobidReconnect = true;
    
    if (this.ws) {
      this.ws.close();
    }

    delete this.ws;
  }
}

Websocket.propTypes = {
  url: 'string',
  reconnectLimit: 'number',
  reconnectionTimeout: 'number',
  pingTimeout: 'number',
  pingMsg: 'string',
  onmessage: 'function'
}

Websocket.defaultProps = {
  url: null,
  reconnectLimit: 10,
  reconnectionTimeout: 3000,
  pingTimeout: 3000,
  pingMsg: ''
}

export default Websocket;