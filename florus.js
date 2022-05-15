;// florus.js v5.8.1 by Tingyu

// 设置区开始
const lat=31.223502, lon=121.44532, // 用于显示天气的位置，lat为纬度，北正南负，lon为经度，东正西负
EM=0, // 提醒事项模式 -> 0:自编提醒事项 1:从日历中读取事项（需授权）
Events=[
	// 自编提醒事项，可按样例格式添加任意多条，无需按时间顺序，将会自动排序，并根据不同尺寸，显示未来最近几项
	['端午','2022-06-03'],
	['国庆','2022-10-01'],
	['新年','2023-01-01'],
],
FF=0, // 基金功能开关 -> 0:关闭（正常显示提醒事项） 1:基金模式 2:股票模式（中小尺寸在交易时段内用基金估值/股票行情替代提醒事项，大尺寸同时显示提醒事项和基金估值/股票行情）
Fcodes='300750,002594,002241', // 请设置基金或股票代码，用英文半角逗号隔开
cs=2; // 配色方案 -> 0:黑色调 1:白色调 2:自动切换色调
// 设置区结束

const CD=new Date(), tz=CD.getTimezoneOffset(), wd=CD.getDay(), dm=CD.getHours()*100+CD.getMinutes(), ly=CD.getFullYear()%4?0:1, D=getD(), loc=lat+','+lon, ST=getST(), tt=wd>0&&wd<6&&(dm>910&&dm<1135||dm>1255&&dm<1505), size=getSize(), sep=size?' · ':' ', CS=[{b:'#1d1d1d',d:'#fff',w:'#fff59d',e:'#b3e5fc',f:['#b3e5fc','#ffccbc','#c8e6c9'],m:'#fff'},{b:'#f9f9f9',d:'#1d1d1d',w:'#353535',e:'#4778a9',f:['#4778a9','#ff5722','#4caf50'],m:'#424242'}];
CS.push(dm>ST[0]-1&&dm<ST[1]?CS[1]:CS[0]);
const yolanda=await createWidget();
Script.setWidget(yolanda);
Script.complete();
// Functions
function getD () {const a=new Date(CD.getFullYear(),CD.getMonth(),CD.getDate()), b=new Date(CD.getFullYear(),0,0); return (a-b)/86400000;}
function getST () {
	const fi=Math.asin(Math.sin((D-ly-80)*2*Math.PI/(ly+365))*0.397682), th=Math.asin(Math.tan(lat*Math.PI/180)*Math.tan(fi)), a=th*12/Math.PI, b=(lon+tz/4)/15;
	return [Math.trunc(6-a-b)*100+Math.round((6-a-b)%1*60), Math.trunc(18+a-b)*100+Math.round((18+a-b)%1*60)];
}
function getSize () {const wf=config.widgetFamily; return wf=='large'?2:wf=='medium'?1:0;}
async function createWidget() {
	const w=new ListWidget();
	w.backgroundColor=new Color(CS[cs].b,0.95);
	// Date
	const date=w.addText(getDateText());
	date.font=Font.boldSystemFont(14), date.textColor=new Color(CS[cs].d);
	// Weather
	w.addSpacer(6);
	let wtext='';
	try {wtext=await getWeather(loc);} catch (e) {wtext='暂时与气象卫星失去了联系';}
	const weather=w.addText(wtext);
	weather.font=Font.lightSystemFont(12), weather.textColor=new Color(CS[cs].w,0.81);
	// Events
	if (FF==0||size>1||!tt) {
		w.addSpacer(2);
		const Ev=EM?await procCal():procEvents(Events);
		for (let o of Ev) {
			w.addSpacer(4);
			const event=w.addText(o);
			event.font=Font.lightSystemFont(11), event.textColor=new Color(CS[cs].e,0.72);
		}
	}
	// Funds
	if (FF==1&&(tt||size>1)) {
		w.addSpacer(2);
		const Fu=await getFunds(Fcodes);
		for (let o of Fu) {
			w.addSpacer(4);
			const fund=w.addText(o[0]);
			fund.font=Font.lightSystemFont(11), fund.textColor=new Color(CS[cs].f[o[1]],0.72);
		}
	}
	// Stock
	else if (FF==2&&(tt||size>1)) {
		w.addSpacer(2);
		const St=await getStocks(Fcodes), l=St.length;
		if (size==1&&l>3) {
			let i=0;
			while (i<l) {
				w.addSpacer(4);
				const stack=w.addStack();
				for (let j=0; j<2; j++) {
					if (St[i]) {
						const stock=stack.addText(St[i][0]);
						stock.font=Font.lightSystemFont(11), stock.textColor=new Color(CS[cs].f[St[i][1]],0.72);
						if (i%2==0) {stack.addSpacer();}
						i++;
					} else {break;}
				}
			}
		} else {
			for (let o of St) {
				w.addSpacer(4);
				const stock=w.addText(o[0]);
				stock.font=Font.lightSystemFont(11), stock.textColor=new Color(CS[cs].f[o[1]],0.72);
			}
		}
	}
	// Motto
	if (size) {
		w.addSpacer(6);
		let y='';
		try {y=await getMotto();} catch (e) {y='“此时无声胜有声。” -- 在那个没有互联网的远古时代';}
		const motto=w.addText(y);
		motto.font=Font.lightSystemFont(10), motto.textColor=new Color(CS[cs].m,0.72);
	}
	// return widget
	return w;
}
function getDateText () {
	const DF=new DateFormatter();
	DF.dateFormat='M月d日'; 
	let d=DF.string(CD)+' · 周'+['日','一','二','三','四','五','六'][wd];
	if (size) {d+=sep+lunar(D)+sep+'全年'+Math.floor(D/(365+ly)*100)+'%';}
	return d;
}
function lunar (D) {
	// 农历已支持到2023年底，2024年之前我再更新一下
	const y=CD.getFullYear(), L={'2022': [-28,2,31,61,90,120,149,179,209,238,268,297,327,356], '2023': [-9,21,50,80,109,138,168,198,227,257,287,316,346],}, Lx={'2022': ['冬','腊','正','二','三','四','五','六','七','八','九','十','冬','腊'], '2023': ['腊','正','二','闰二','三','四','五','六','七','八','九','十','冬'],};
	let i=L[y].length-1;
	while (D<L[y][i]+1) {i--;}
	return Lx[y][i]+'月'+zh(D-L[y][i]);
}
function zh (x) {
	const Z=['','一','二','三','四','五','六','七','八','九','十'];
	return x<11?'初'+Z[x]:x<20?'十'+Z[x-10]:x==20?'二十':x<30?'廿'+Z[x-20]:'三十';
}
async function getWeather (loc) {
	const req=new Request('http://wttr.in/'+loc+'?format=j1&lang=zh'), du=size?'° ':'°', dux=size?'°':'';
	req.allowInsecureRequest=true;
	const res=await req.loadJSON()||null, CC=res.current_condition[0]||null, W=res.weather[0]||null, cv=CC['lang_zh'][0].value||'', n=Math.ceil((CD.getHours()+1)/3), fv=n<8?W.hourly[n]['lang_zh'][0].value||'':res.weather[1].hourly[0]['lang_zh'][0].value||'';
	const t=+CC.temp_C, l=+W.mintempC, h=+W.maxtempC, ll=t<l?t:l, hh=t>h?t:h;
	return cv+sep+t+du+' ('+(size?'低':'')+ll+dux+'/'+(size?'高':'')+hh+dux+rainsnow(fv)+')';
}
function rainsnow (x) {
	if (x.includes('雪')) {return size?' · 3小时内或有❄️':'❄️';}
	else if (x.includes('雨')) {return size?' · 3小时内或有🌧️':'🌧️';}
	else {return '';}
}
async function procCal () {
	const ED=new Date(), max=size>1?6:size?3:4, xday=' · '+(size?'还有':''), tomo=' · '+(size?'就是明天':'明天'), today=' · '+(size?'就是今天':'今天');
	ED.setDate(ED.getDate()+90);
	const Ev=[], E=await CalendarEvent.between(CD,ED,[]);
	for (let o of E) {
		if (!o.title.startsWith('Canceled:')) {
			const t=new Date(o.startDate).getTime(), diff=Math.ceil((t-(t-tz*60000)%86400000-CD.getTime())/86400000);
			Ev.push(o.title+(diff>1?xday+diff+'天':diff>0?tomo:today)); if (Ev.length==max) {break;}
		}
	}
	return Ev;
}
function procEvents (E) {
	const max=size>1?6:size?3:4, xday=' · '+(size?'还有':''), tomo=' · '+(size?'就是明天':'明天'), today=' · '+(size?'就是今天':'今天'), Ev=[];
	E.sort((a,b)=>new Date(a[1]).getTime()-new Date(b[1]).getTime());
	for (let o of E) {
		const diff=Math.ceil((new Date(o[1]).getTime()+tz*60000-CD.getTime())/86400000);
		if (diff>-1) {Ev.push(o[0]+(diff>1?xday+diff+'天':diff>0?tomo:today)); if (Ev.length==max) {break;}}
	}
	return Ev;
}
async function getFunds (Fc) {
	const max=size>1?6:size?3:4;
	let Fu=[];
	try {
		const req=new Request('https://api.doctorxiong.club/v1/fund?code='+Fc), res=await req.loadJSON()||{}, F=res.data||[];
		if (F.length>max) {F.length=max;}
		for (let o of F) {
			const g=o.expectGrowth;
			Fu.push([(size?o.name:o.code)+' · '+o.expectWorth+(size?' ('+(g>0?'+':'')+g+'%)':''), g>0?1:g<0?2:0]);
		}
	} catch (e) {Fu=[['暂时与交易所失去了联系',0]];}
	return Fu;
}
async function getStocks (Fc) {
	const max=size?6:4;
	let St=[];
	try {
		const req=new Request('https://qt.gtimg.cn/q='+procStocks(Fc)), res=await req.loadString()||'';
		if (res=='v_pv_none_match="1";') {St=[['无效的股票代码',0]];}
		else {
			let S=res.match(/="[^"]+";/g).map(x=>x.split('~'));
			if (S.length>max) {S.length=max;}
			for (let o of S) {
				const g=+o[5];
				St.push([(size?o[1]:o[1].substr(0,2))+' '+o[3]+' ('+(g>0?'+':'')+g+'%)', g>0?1:g<0?2:0]);
			}
		}
	} catch (e) {St=[['暂时与交易所失去了联系',0]];}
	return St;
}
function procStocks(x) {return x.split(',').map(s=>/(60[013]|688)\d{3}/.test(s)?'s_sh'+s:/(00[023]|300)\d{3}/.test(s)?'s_sz'+s:'').join(',');}
async function getMotto () {
	const req=new Request('https://v1.hitokoto.cn/?encode=json'), res=await req.loadJSON()||null;
	return `“${res.hitokoto}” -- ${res.from}`;
}