# Florus

Florus is a piece of Javascript code applied to the *Scriptable* App, displaying date, lunar date, weekday, year progress, weather information, events reminder, realtime funds valuation, as well as random motto, via widget in iOS 14.

![](https://wt365.github.io/lib/florus/screenshot1.jpg)
![](https://wt365.github.io/lib/florus/screenshot2.jpg)

Florus是一则应用于*Scriptable* App的Javascript脚本，它可以在iOS14小组件中实现：

* 显示日期、星期、农历、全年进度
* 显示指定位置的即时天气状况、温度、三小时内降雨/降雪提醒
* 显示预设事项的倒数天数
* 显示指定基金的实时估值
* 从一言数据库中随机显示一句话及出处
* 支持小、中、大三种尺寸，不同尺寸显示合适的内容容量
* 支持黑色调与白色调两种配色方案，亦可自动切换

### 食用方法

1. 将florus.js（手机视图中或需点击`View code`展开后可见）中的全部代码复制。
2. iOS14用户安装**Scriptable** App。打开App，点击右上角 `+号` 新建脚本，将已复制的代码粘贴入。
3. 将代码中设置区内的**位置纬度经度**、**提醒事项**、**基金功能开关及基金代码**、**配色方案**改成自己需要的。
4. 点击左上角 `Done` ，保存脚本后可长按对其重命名（比如*Florus*）。
5. 长按iOS14桌面空白处，点击左上角 `+号` 添加小组件，选择Scriptable。建议中尺寸，其它尺寸亦可。
6. 长按刚才添加的组件，点击**编辑小组件**，Script处选择*Florus*即可。

### 注意事项

* 请自行修改**纬度和经度**设置，用于显示天气。（更换了新的天气API，无需任何Key。）
* **提醒事项**请手动在脚本里添加，可添加任意多行，无需按时间顺序，会自动排序后显示未来最近的3项（中尺寸）、4项（小尺寸）或5项（大尺寸）。
* 如果需要显示**基金实时估值**，请将基金功能开关*FF*设为*1*，并设置一组**基金代码**。开启基金功能时，中小尺寸将不显示提醒事项，显示最多3项（中尺寸）或4项（小尺寸）实时估值，大尺寸将同时显示最多6项提醒事项和最多6项实时估值。
* 默认**配色方案** *cs=0* 为黑色调，可更改为 *cs=1* 白色调或 *cs=2* 自动切换色调。
* 推荐使用**中尺寸**组件，但小尺寸和大尺寸也同样支持。另外，作者机型为iPhoneXS，其他设备可自行适当调整字号大小。
* 农历已经支持到2021年底了，2022年之前我会再更新一下。
* 作者比较懒，更多好玩的功能我想到了再慢慢加……

*designed and coded with love by Tingyu.*
