<div align="center">

<img src="readme-hero.svg" width="100%" alt="Super JinX · Marzban on Railway"/>

[فارسی](README.md) | [English](README.en.md) | [Русский](README.ru_RU.md) | **中文**

<br/>

<img src="readme-tag-marzban.svg" alt="Marzban latest"/>
<img src="readme-tag-railway.svg" alt="Railway ready"/>
<img src="readme-tag-xray.svg" alt="Xray WS, HU, XHTTP, Reality"/>
<img src="readme-tag-region.svg" alt="Region Amsterdam"/>
<img src="readme-tag-lang.svg" alt="UI FA EN RU ZH"/>
<img src="readme-tag-license.svg" alt="License AGPL-3.0"/>

<br/><br/>

**免费、一键部署到 Railway 的 Marzban VPN 面板。**<br/>
无需 VPS、无需域名、无需证书。五分钟完成部署,即可分享第一个订阅链接。

<br/>

<a href="https://t.me/Super_Jinx"><img src="readme-badge-telegram.svg" height="40" alt="Telegram @Super_Jinx"/></a>
<a href="https://github.com/x4gpanell"><img src="readme-badge-github.svg" height="40" alt="GitHub x4gpanell"/></a>
<img src="readme-badge-free.svg" height="40" alt="100% Free"/>

<br/><br/>

<img src="readme-stats.svg" width="100%" alt="12 methods · 5 minutes · 15s self-heal · 4 languages"/>

</div>

## 简介

**Super JinX** 将官方 [Marzban](https://github.com/Gozargah/Marzban) 面板、nginx 和 [Xray-core](https://github.com/XTLS/Xray-core) 打包为一个 Railway 服务。所有流量通过同一个端口,TLS 由 Railway 在 443 端口处理,通常需要终端完成的设置都已预先配置好。

在 Marzban 之上,它增加了 12 种现成的连接方式、带服务端限制的代理商面板、专属订阅页面、自愈守护程序、无法从面板破坏的锁定入站,以及完整翻译的界面。

## 目录

- [功能](#功能)
- [截图](#截图)
- [快速开始](#快速开始)
- [工作原理](#工作原理)
- [连接方式](#连接方式)
- [代理商面板](#代理商面板)
- [订阅页面](#订阅页面)
- [自愈](#自愈)
- [安全](#安全)
- [可选线路](#可选线路)
- [环境变量](#环境变量)
- [区域](#区域)
- [推荐客户端](#推荐客户端)
- [故障排除](#故障排除)
- [赞助](#赞助)
- [社区](#社区)

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 功能

<img src="readme-features.svg" width="100%" alt="Features"/>

- **一键部署**到 Railway,首次登录 `admin / admin`,可在面板菜单中修改
- **12 种直连方式**,覆盖 VLESS、VMess、Trojan、WebSocket 和 HTTPUpgrade,各自使用不同的 TLS 指纹和分片配置
- 通过 Railway TCP Proxy 提供可选的 **Reality**,以及额外域名上的 **Mirror** 配置
- **速度优化**:BBR、心跳、Early Data（`ed=2560`）、屏蔽 QUIC，以及适用于所有客户端的普通链接
- **代理商面板**:创建向导、现成套餐和服务端限制
- **JinX Pass** 订阅页面:电脑与手机分别布局,实时延迟与二维码
- **自愈守护**:每 15 秒检查所有组件,每日自动备份
- **锁定入站**、10 次密码错误后锁定登录、服务端广告拦截
- Super JinX 新增的所有内容都支持**四种语言**:波斯语、英语、俄语和中文

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 截图

<table>
<tr>
<td width="70%"><img src="readme-shot-sub.jpg" alt="电脑端订阅页面"/></td>
<td width="30%"><img src="readme-shot-sub-mobile.jpg" alt="手机端订阅页面"/></td>
</tr>
<tr>
<td align="center"><sub>JinX Pass · 电脑</sub></td>
<td align="center"><sub>JinX Pass · 手机</sub></td>
</tr>
<tr>
<td><img src="readme-shot-donate.jpg" alt="电脑端赞助页面"/></td>
<td><img src="readme-shot-donate-mobile.jpg" alt="手机端赞助页面"/></td>
</tr>
<tr>
<td align="center"><sub>赞助页面 · 电脑</sub></td>
<td align="center"><sub>赞助页面 · 手机</sub></td>
</tr>
</table>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 快速开始

<img src="readme-deploy.svg" width="100%" alt="Fork, Railway, Amsterdam, Volume, Port 8080, No sleep, Deploy"/>

| 步骤 | 操作 |
|:--:|---|
| 1 | 为本仓库点 **Star** 并 **Fork** |
| 2 | 在 [Railway](https://railway.com) 中选择 `New Project` → `Deploy from GitHub repo`,选中你的 Fork |
| 3 | `Settings` → `Deploy` → `Regions` → **EU West (Amsterdam)** |
| 4 | `Attach Volume`,挂载路径 **`/var/lib/marzban`** |
| 5 | `Settings` → `Networking` → `Generate Domain`,端口 **`8080`** |
| 6 | 确认 **Serverless / App Sleeping 已关闭** |
| 7 | **Redeploy** |

<div align="center">

| 面板 | 用户名 | 密码 |
|:--:|:--:|:--:|
| `https://<域名>.up.railway.app/dashboard/` | `admin` | `admin` |

</div>

> [!IMPORTANT]
> 首次登录后,请在菜单中选择**修改用户名和密码**。修改立即生效,重新部署后依然保留。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 工作原理

<img src="readme-flow.svg" width="100%" alt="Phone, Railway Edge, nginx, Xray, Internet"/>

Railway 在 443 端口处理 TLS,并将所有流量转发到 **8080** 端口的 nginx。nginx 通过这一个端口提供面板、订阅页面和全部 Xray 传输。**JinX Doctor** 守护程序每 15 秒检查一次各个组件。无需证书,也永不过期。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 连接方式

<img src="readme-methods.svg" width="100%" alt="12 connection methods"/>

每个配置名称都以 **جینکس | 𝗝𝗶𝗻𝗫** 开头,后面是方式名称和协议。

| # | 方式 | 协议 | 指纹 | 说明 |
|:--:|---|---|:--:|---|
| 1 | **Amsterdam Rocket** | JinX Core | ios | 直连,全速。名称随区域变化 |
| 2 | **Ghost Anti-Filter** | JinX Core | chrome | 强分片,应对被过滤的 SNI |
| 3 | **Hyper Drive** | VLESS WS | firefox | — |
| 4 | **Swift Shield** | VLESS WS | chrome | 轻分片 |
| 5 | **Vortex** | VMess WS | safari | 全速 |
| 6 | **Trident** | Trojan WS | edge | — |
| 7 | **Ninja Stealth** | Trojan WS | random | 强分片 |
| 8 | **Lightning** | HTTPUpgrade | chrome | 最轻量的传输,全速 |
| 9 | **Meteor** | HTTPUpgrade | ios | 轻分片 |
| 10 | **Warp Speed** | XHTTP packet-up | chrome | 短请求,可穿过任何网络 |
| 11 | **Nebula** | HTTPUpgrade | firefox | — |
| 12 | **Quantum** | XHTTP stream-up | edge | 单一持续数据流,速度高 |
| + | **Reality Pulse**、**Dark Matter** | Reality | chrome、firefox | 开启 TCP Proxy 后可用 |
| + | **Mirror** | JinX Core、HTTPUpgrade | chrome | 同一服务的额外域名 |

两个 XHTTP 配置(与 Vodiwalker 面板相同)使用 `alpn=h2,http/1.1`;`JINX_XHTTP=0` 可关闭。若某种传输不可用，同名配置会改用下一种（HTTPUpgrade，然后 WebSocket），始终保持 12 个且不重名。

### 速度优化

以下功能全部自动开启。

| 功能 | 效果 |
|---|---|
| **1.6 万连接** | nginx 每个 worker 可接受 16384 个连接,繁忙时依然流畅 |
| **不使用 Mux** | Hiddify、Clash 和 sing-box 都能正常连接 |
| **BBR** | 在移动网络上速度更稳定(需主机内核支持) |
| **心跳** | 每 30 秒发送一个小包,防止运营商断开空闲连接 |
| **Early Data** | 每个新连接少一次往返 |
| **屏蔽 QUIC** | 浏览器和 YouTube 改走 TCP,在隧道内更流畅 |
| **HTTP 延迟测试** | sing-box 和 Clash 客户端测试少一次往返 |
| **所有客户端使用普通链接** | 每个客户端自行生成配置；可通过变量开启完整 JSON |

> [!TIP]
> 只显示真实延迟,绝无虚假数字。在 v2rayNG 或 V2Box 中将测试地址设为 `http://cp.cloudflare.com/` 并进行批量测试。

### Reality

1. `Settings` → `Networking` → **TCP Proxy**,应用端口 **`2010`**
2. **Redeploy**。**Reality Pulse** 和 **Dark Matter** 两个配置会自动加入每个订阅。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 代理商面板

打开菜单并选择**代理商面板**。只有主管理员可以看到此选项。

| 选项 | 说明 |
|---|---|
| **套餐** | 青铜 `10 · 100 GB · 30 天`、白银 `50 · 500 GB · 30 天`、黄金 `100 · 1 TB · 30 天`、钻石 `500 · 5 TB · 90 天`、自定义 |
| **实时校验** | 用户名重复或限制无效会立即提示 |
| **强密码** | 14 位密码生成器,附强度指示 |
| **预览与交付** | 实时卡片、逐项复制、全部复制和分享 |
| **充值与续期** | 一步完成流量、天数和用户名额 |
| **历史记录** | 代理商的所有操作及时间 |
| **服务端限制** | 用户数、流量和到期时间无法绕过 |

代理商通过 **`https://<域名>/agent/`** 登录,并看到专属欢迎语。删除代理商时其用户会保留并转给主管理员。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 订阅页面

- 发光的会员卡,显示流量、到期时间和状态
- **电脑**与**手机**分别布局
- 每个配置旁显示实时延迟,并给出推荐配置
- Android、iOS 和 Windows 一键导入
- 可靠复制、内置二维码、全部复制和下载配置文件
- **JinX Care** 助手检查手机时间、网络、服务器和延迟
- 深色与浅色主题,波斯语与英语
- 不发起任何外部请求

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 自愈

| 出现问题 | JinX Doctor 的处理 |
|---|---|
| nginx | 重新启动 |
| Xray 核心 | 每 60 秒测试一次真实连接,必要时重启核心 |
| 面板无响应 | 干净地重启整个服务 |
| Xray 配置损坏 | 备份后重新生成 |
| 订阅链接 | 每 20 秒保持主机信息正确 |
| 订阅页面或赞助页面 | 从完好副本恢复 |
| 数据库 | 每日备份,保留最近 7 份 |

> 设置 `DOCTOR_TG_TOKEN` 和 `DOCTOR_TG_CHAT` 即可在 Telegram 接收提醒。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 安全

| | |
|---|---|
| **账号密码** | 在菜单中修改,立即生效且重新部署后保留 |
| **登录锁定** | 10 次密码错误后登录关闭 5 分钟,在服务端按 IP 和用户名执行 |
| **锁定入站** | Core settings 只读,每次启动重建 Xray 配置,主机信息 20 秒内恢复 |
| **数据持久化** | 数据库、用户和代理商保存在 Railway 卷上 |

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 可选线路

<details>
<summary><b>伊朗中转服务器</b></summary>

<br/>

```
Client  ──►  Iran VPS :443  ══ TLS passthrough ══►  Railway
```

```bash
sudo bash iran-relay.sh xxxx.up.railway.app
```

然后在 Railway 中设置 `IRAN_RELAY_IP=<服务器 IP>` 并重新部署。

</details>

<details>
<summary><b>Cloudflare Tunnel</b></summary>

<br/>

1. 将域名接入 Cloudflare。
2. `Zero Trust` → `Networks` → `Tunnels` → `Create a tunnel`(Cloudflared),复制令牌。
3. 添加 public hostname,服务为 `HTTP` → `127.0.0.1:8080`。
4. 设置以下变量并重新部署:

```env
CF_TUNNEL_TOKEN=<令牌>
CF_TUNNEL_HOSTNAME=jinx.example.com
CF_CLEAN_IP=<可选的优选 IP>
```

</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 环境变量

所有变量均为可选。

<details>
<summary><b>完整列表</b></summary>

<br/>

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PANEL_DOMAIN` | | 自定义域名 |
| `RESET_ADMIN_PASSWORD` | | `1` 将登录重置为 `admin / admin`,之后请删除 |
| `SUB_UPDATE_INTERVAL` | `6` | 订阅自动更新间隔(小时) |
| `DOCTOR_TG_TOKEN`、`DOCTOR_TG_CHAT` | | Telegram 提醒 |
| `TELEGRAM_API_TOKEN`、`TELEGRAM_ADMIN_ID` | | Marzban 自带的 Telegram 机器人 |
| `CF_TUNNEL_TOKEN`、`CF_TUNNEL_HOSTNAME` | | Cloudflare Tunnel |
| `CF_CLEAN_IP`、`CF_PORTS` | `443,2053,8443` | 优选 IP 和端口 |
| `IRAN_RELAY_IP`、`IRAN_RELAY_PORT` | `443` | 伊朗中转 |
| `JINX_EXTRA_DOMAINS` | | 额外域名,每个生成一个 Mirror 配置 |
| `JINX_REALITY_SNI` | `www.speedtest.net` | Reality 伪装站点 |
| `JINX_FRAGMENT` | `10-20,10-20,tlshello` | 强分片,留空即关闭 |
| `JINX_FRAGMENT_LIGHT` | `100-200,1-3,tlshello` | 轻分片 |
| `JINX_MUX` | `0` | `1` = 开启（仅适用于使用 JSON 的 v2rayNG） |
| `JINX_BBR`、`JINX_ADBLOCK`、`JINX_FAST`、`JINX_REALITY` | `1` | `0` 关闭该功能 |
| `JINX_HEARTBEAT` | `30` | 秒,`0` 关闭 |
| `USE_CUSTOM_JSON_FOR_V2RAYNG` | `False` | `True` = 为 v2rayNG、v2rayN、Streisand 和 Happ 提供完整 JSON |

</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 区域

| Railway 区域 | 状态 |
|---|:--:|
| **EU West · Amsterdam** | 推荐 |
| US East · Virginia | 支持 |
| US West · California | 支持 |
| Southeast Asia · Singapore | 支持 |

## 推荐客户端

| Android | iOS | Windows / macOS |
|:--:|:--:|:--:|
| v2rayNG · Hiddify · NekoBox | Streisand · V2Box · Hiddify | v2rayN · Hiddify · Clash Verge |

请不要在客户端中开启 Mux（Xray 服务器不支持 Hiddify 等客户端的 Mux）。每次修改后请点击 **Update subscription**。

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 故障排除

<details><summary><b>配置过一段时间后断开</b></summary><br/>在服务设置中关闭 Serverless / App Sleeping。</details>

<details><summary><b>部署在健康检查时失败</b></summary><br/>域名端口必须是 <code>8080</code>。请查看 <code>alembic</code> 和 <code>main.py</code> 日志。</details>

<details><summary><b>忘记密码</b></summary><br/>添加 <code>RESET_ADMIN_PASSWORD=1</code> 并重新部署,用 <code>admin / admin</code> 登录后删除该变量。</details>

<details><summary><b>重新部署后用户丢失</b></summary><br/>卷没有挂载到 <code>/var/lib/marzban</code>。</details>

<details><summary><b>直连配置无法连接</b></summary><br/>尝试 Ghost Anti-Filter、Ninja Stealth 或 Swift Shield,仍不行请使用 Reality 或 Cloudflare Tunnel。</details>

<details><summary><b>延迟较高</b></summary><br/>选择 Amsterdam 区域,将测试地址设为 <code>http://cp.cloudflare.com/</code>,并使用 Lightning 或 Reality。</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## 赞助

面板底部角落的**赞助**按钮会打开 `https://<域名>/donate/`。每个地址在显示前都会用其网络校验和验证,二维码在设备上生成,页面不发起任何外部请求。如需使用自己的地址,只需编辑 `donate-config.js`。

## 社区

<div align="center">

<a href="https://t.me/Super_Jinx"><img src="readme-badge-telegram.svg" height="40" alt="Telegram @Super_Jinx"/></a>
<a href="https://github.com/x4gpanell"><img src="readme-badge-github.svg" height="40" alt="GitHub x4gpanell"/></a>

<br/><br/>

如果 Super JinX 对你有帮助,请点一个 Star。

<sub>基于 <a href="https://github.com/Gozargah/Marzban">Marzban</a>(AGPL-3.0)和 <a href="https://github.com/XTLS/Xray-core">Xray-core</a>。</sub>

<img src="readme-footer.svg" width="100%" alt="Super JinX · free forever"/>

</div>
