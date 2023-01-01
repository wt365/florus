;// florus.js v6.1 by Tingyu

// 设置区开始
const lat = 31.223502, lon = 121.44532, // 用于显示天气的位置，lat为纬度，北正南负，lon为经度，东正西负
EM = 0, // 提醒事项模式 -> 0:自编提醒事项 1:从日历中读取事项（需授权）
Events = [
	// 自编提醒事项，可按样例格式添加任意多条，无需按时间顺序，将会自动排序，并根据不同尺寸，显示未来最近几项
	['国庆', '2023-10-01'],
	['亚运会', '2023-09-23'],
	['新年', '2024-01-01'],
],
FF = 0, // 基金功能开关 -> 0:关闭（正常显示提醒事项） 1:基金模式 2:股票模式（中小尺寸、锁屏矩形尺寸在交易时段内用基金估值/股票行情替代提醒事项，大尺寸同时显示提醒事项和基金估值/股票行情）
Fcodes = '300750,002594,z000001', // 请设置基金或股票代码（指数请在代码前加z），用英文半角逗号隔开
cs = 2; // 配色方案 -> 0:黑色调 1:白色调 2:自动切换色调
// 设置区结束

const CD = new Date(), tz = CD.getTimezoneOffset(), wd = CD.getDay(), dm = CD.getHours() * 100 + CD.getMinutes(), ly = CD.getFullYear() % 4 ? 0 : 1, D = getD(), loc = lat + ',' + lon, ST = getST(), tt = wd > 0 && wd < 6 && (dm > 910 && dm < 1135 || dm > 1255 && dm < 1505), size = getSize(), CS = [{b: '#1d1d1d', d: '#fff', w: '#fff59d', e: '#b3e5fc', f: ['#b3e5fc', '#ffccbc', '#c8e6c9'], m: '#fff'}, {b: '#f9f9f9', d: '#1d1d1d', w: '#353535', e: '#4778a9', f: ['#4778a9', '#ff5722', '#4caf50'], m: '#424242'}];
CS.push(dm > ST[0] - 1 && dm < ST[1] ? CS[1] : CS[0]);
const yo = await createWidget();
Script.setWidget(yo);
Script.complete();
// Functions
function getD () {const a = new Date(CD.getFullYear(), CD.getMonth(), CD.getDate()), b = new Date(CD.getFullYear(),0,0); return (a - b) / 86400000;}
function getST () {
	const fi = Math.asin(Math.sin((D - ly - 80) * 2 * Math.PI / (ly + 365)) * 0.397682), th = Math.asin(Math.tan(lat * Math.PI / 180) * Math.tan(fi)), a = th * 12 / Math.PI, b = (lon + tz / 4) / 15;
	return [Math.trunc(6 - a - b) * 100 + Math.round((6 - a - b) % 1 * 60), Math.trunc(18 + a - b) * 100 + Math.round((18 + a - b) % 1 * 60)];
}
function getSize () {return ({small: 0, medium: 1, large: 2, extraLarge: 3, accessoryRectangular: 4, accessoryInline: 5, accessoryCircular: 6})[config.widgetFamily] ?? 5;}
async function createWidget() {
	const w = new ListWidget();
	w.backgroundColor = new Color(CS[cs].b, 0.95);
	// Date
	const Dates = getDates(), datext = !size ? `${Dates[0]} · ${Dates[1]}` : size < 4 ? `${Dates[0]} · ${Dates[1]} · ${Dates[2]} · 全年${Dates[3]}%` : size < 5 ? `${Dates[2]} 全年${Dates[3]}%` : size < 6 ? `${Dates[2]} ${Dates[3]}%` : Dates[2], date = w.addText(datext);
	if (size < 5) {
		date.font = Font.boldSystemFont(14);
		if (size < 4) {date.textColor = new Color(CS[cs].d);}
	} else if (size == 6) {
		date.centerAlignText(); 
		date.font = Font.systemFont(10);
		w.addSpacer(4);
		const date2 = w.addText(Dates[3] + '%'); 
		date2.centerAlignText(); 
		date2.font = Font.systemFont(9);
		w.addAccessoryWidgetBackground = true;
	}
	// Weather
	if (size < 5) {
		w.addSpacer(6);
		let wtext = '';
		try {wtext = await getWeather(loc);} catch (e) {wtext = '暂时与气象卫星失去了联系';}
		const weather = w.addText(wtext);
		weather.font = Font.systemFont(12);
		if (size < 4) {weather.textColor = new Color(CS[cs].w, 0.81);}
	}
	// Events
	if (size < 5 && (FF == 0 || size > 1 && size < 4 || !tt)) {
		w.addSpacer(6);
		const se = w.addStack(), Ev = EM ? await procCal() : procEvents(Events), l = Ev.length;
		let i = 0;
		while (i < l) {
			const stack = se.addStack();
			format(stack, l);
			for (let j = 0, m = [4, 3, 6, 6, 1][size]; j < m; j++) {
				if (Ev[i]) {
					const event = stack.addText(Ev[i]);
					event.font = Font.systemFont(11);
					if (size < 4) {event.textColor = new Color(CS[cs].e, 0.72);}
					i++;
				} else {break;}
			}
		}
	}
	// Funds
	if (FF == 1 && size < 5 && (tt || size > 1 && size < 4)) {
		w.addSpacer(6);
		const sf = w.addStack(), Fu = await getFunds(Fcodes), l = Fu.length;
		let i = 0;
		while (i < l) {
			const stack = sf.addStack();
			format(stack, l);
			for (let j = 0, m = [4, 3, 6, 6, 1][size]; j < m; j++) {
				if (Fu[i]) {
					const fund = stack.addText(Fu[i][0]);
					fund.font = Font.systemFont(11);
					if (size < 4) {fund.textColor = new Color(CS[cs].f[Fu[i][1]], 0.72);}
					i++;
				} else {break;}
			}
		}
	}
	// Stock
	else if (FF == 2 && size < 5 && (tt || size > 1 && size < 4)) {
		w.addSpacer(6);
		const ss = w.addStack(), St = await getStocks(Fcodes), l = St.length;
		let i = 0;
		while (i < l) {
			const stack = ss.addStack();
			format(stack, l);
			for (let j = 0, m = [4, 3, 6, 6, 1][size]; j < m; j++) {
				if (St[i]) {
					const stock = stack.addText(St[i][0]);
					stock.font = Font.systemFont(11);
					if (size < 4) {stock.textColor = new Color(CS[cs].f[St[i][1]], 0.72);}
					i++;
				} else {break;}
			}
		}
	}
	// Motto
	if (size && size < 4) {
		w.addSpacer(6);
		let y = '';
		try {y = await getMotto();} catch (e) {y = '“此时无声胜有声。” -- 在那个没有互联网的远古时代';}
		const motto = w.addText(y);
		motto.font = Font.systemFont(10);
		motto.textColor = new Color(CS[cs].m, 0.72);
	}
	// return widget
	return w;
}
function getDates () {
	const DF = new DateFormatter();
	DF.dateFormat = 'M月d日';
	return [DF.string(CD), `周${['日', '一', '二', '三', '四', '五', '六'][wd]}`, lunar(D), D / (365 + ly) * 100 | 0];
}
function lunar (D) {
	// 农历已支持到2024年底，2025年之前我再更新一下
	const y = CD.getFullYear(), L = {'2023': [-9, 21, 50, 80, 109, 138, 168, 198, 227, 257, 287, 316, 346], '2024': [-19, 10, 40, 69, 99, 128, 157, 187, 216, 246, 276, 305, 335, 365],}, Lx = {'2023': ['腊', '正', '二', '闰二', '三', '四', '五', '六', '七', '八', '九', '十', '冬'], '2024': ['冬', '腊', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],};
	let i = L[y].length - 1;
	while (D < L[y][i] + 1) {i--;}
	return Lx[y][i] + '月' + zh(D - L[y][i]);
}
function zh (x) {
	const Z = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
	return x < 11 ? '初' + Z[x] : x < 20 ? '十' + Z[x - 10] : x == 20 ? '二十' : x < 30 ? '廿' + Z[x - 20] : '三十';
}
async function getWeather (loc) {
	const req = new Request('http://wttr.in/' + loc + '?format=j1&lang=zh');
	req.allowInsecureRequest = true;
	const res = await req.loadJSON() || null, CC = res.current_condition[0] || null, W = res.weather[0] || null, cv = CC['lang_zh'][0].value || '', n = Math.ceil((CD.getHours() + 1) / 3), fv = n < 8 ? W.hourly[n]['lang_zh'][0].value || '' : res.weather[1].hourly[0]['lang_zh'][0].value || '', t = +CC.temp_C, l = +W.mintempC, h = +W.maxtempC, ll = t < l ? t : l, hh = t > h ? t : h;
	return size && size < 4 ? `${cv} · ${t}°  (低${ll}° / 高${hh}°${rainsnow(fv)})` : `${cv} ${t}° (${ll}/${hh}${rainsnow(fv)})`;
}
function rainsnow (x) {
	if (x.includes('雪')) {return size && size < 4 ? ' · 3小时内或有❄️' : '❄️';}
	else if (x.includes('雨')) {return size && size < 4 ? ' · 3小时内或有🌧️' : '🌧️';}
	else {return '';}
}
async function procCal () {
	const ED = new Date(), max = size > 3 ? 1 : size ? 6 : 4, xday = size > 1 && size < 4 ? '还有' : '', tomo = size > 1 && size < 4 ? '就是明天' : '明天', today = size > 1 && size < 4 ? '就是今天' : '今天';
	ED.setDate(ED.getDate() + 90);
	const Ev = [], E = await CalendarEvent.between(CD, ED, []);
	for (let o of E) {
		if (!o.title.startsWith('Canceled:')) {
			const t = new Date(o.startDate).getTime(), diff = Math.ceil((t - (t - tz * 60000) % 86400000 - CD.getTime()) / 86400000);
			Ev.push(o.title + ' · ' + (diff > 1 ? xday + diff + '天' : diff ? tomo : today));
			if (Ev.length == max) {break;}
		}
	}
	return Ev;
}
function procEvents (E) {
	const max = size > 3 ? 1 : size ? 6 : 4, xday = size > 1 && size < 4 ? '还有' : '', tomo = size > 1 && size < 4 ? '就是明天' : '明天', today = size > 1 && size < 4 ? '就是今天' : '今天', Ev = [];
	E.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());
	for (let o of E) {
		const diff = Math.ceil((new Date(o[1]).getTime() + tz * 60000 - CD.getTime()) / 86400000);
		if (diff > -1) {
			Ev.push(o[0] + ' · ' + (diff > 1 ? xday + diff + '天' : diff ? tomo : today));
			if (Ev.length == max) {break;}
		}
	}
	return Ev;
}
function format (x, n = 1) {
	x.layoutVertically();
	x.spacing = 4;
	x.size = new Size(size == 1 && n > 3 ? 150 : 0, 0);
}
async function getFunds (Fc) {
	const max = size > 3 ? 1 : size ? 6 : 4;
	let Fu = [];
	try {
		const req = new Request('https://api.doctorxiong.club/v1/fund?code=' + Fc.replace(/x20/g, '')), res = await req.loadJSON() || {}, F = res.data || [], l = F.length;
		if (l > max) {F.length = max;}
		for (let o of F) {
			const g = +o.expectGrowth;
			Fu.push([(size < 4 && (size > 1  || l < 4 && size) ? o.name : o.code) + ' · ' + o.expectWorth + (size && size < 4 ? ' (' + (g > 0 ? '+' : '') + g + '%)' : ''), g > 0 ? 1 : g < 0 ? 2 : 0]);
		}
	} catch (e) {Fu = [['暂时与交易所失去了联系', 0]];}
	return Fu;
}
async function getStocks (Fc) {
	const max = size > 3 ? 1 : size ? 6 : 4;
	let St = [];
	try {
		const req = new Request('https://qt.gtimg.cn/q=' + procStocks(Fc)), res = await req.loadString() || '';
		if (res == 'v_pv_none_match="1";') {St = [['无效的股票代码', 0]];}
		else {
			let S = res.match(/="[^"]+";/g).map(x => x.split('~'));
			if (S.length > max) {S.length = max;}
			for (let o of S) {
				const g = +o[5];
				St.push([(size && size < 4 ? o[1] : o[1].substr(0, 2)) + ' ' + o[3] + ' (' + (g > 0 ? '+' : '') + g + '%)', g > 0 ? 1 : g < 0 ? 2 : 0]);
			}
		}
	} catch (e) {St = [['暂时与交易所失去了联系', 0]];}
	return St;
}
function procStocks(x) {return x.split(/[, ]+/).map(s => /(60[013]|688|z000)\d{3}/.test(s) ? 's_sh' + s.replace(/\D/g, '') : /(00[023]|300|z399)\d{3}/.test(s) ? 's_sz' + s.replace(/\D/g, '') : '').join(',');}
async function getMotto () {
	const req = new Request('https://v1.hitokoto.cn/?encode=json'), res = await req.loadJSON() || null;
	return `“${res.hitokoto}” -- ${res.from}`;
}