;// florus.js v5.3 by Tingyu

// 设置区开始
const loc='31.223502,121.44532'; // 请设置用于显示天气的位置 // 先纬度，后经度
const Events=[
	// 提醒事项，可添加任意多条，无需按时间顺序，将会自动排序
	// 中尺寸显示未来最近三项，小尺寸（不显示一言）显示未来最近四项，大尺寸显示未来最近六项
	['参加比赛','2020-12-06'],
	['新年','2021-01-01'],
	['东京奥运会','2021-07-23'],
];
const FF=0; // 基金功能开关 -> 0:关闭（正常显示提醒事项） 1:基金模式 2:股票模式（中小尺寸用基金估值/股票行情替代提醒事项，大尺寸同时显示提醒事项和基金估值/股票行情）
const Fcodes='000333,300750,600276'; // 请设置基金或股票代码，用英文半角逗号隔开 // 小尺寸（不显示一言）显示不超过四个，中尺寸股票显示不超过六个、基金显示不超过三个，大尺寸显示不超过六个
const cs=2; // 配色方案 -> 0:黑色调 1:白色调 2:自动切换色调
// 设置区结束

const CD=new Date(), dh=CD.getHours(), size=getSize(), sep=size?' · ':' ';
let CS=[{b:'#1d1d1d',d:'#fff',w:'#fff59d',e:'#b3e5fc',f:['#b3e5fc','#ffccbc','#c8e6c9'],m:'#fff'},{b:'#f9f9f9',d:'#1d1d1d',w:'#353535',e:'#4778a9',f:['#4778a9','#ff5722','#4caf50'],m:'#424242'}];
CS.push(dh>5&&dh<18?CS[1]:CS[0]);
const yola=await createWidget();
Script.setWidget(yola);
Script.complete();
// Functions
function getSize () {return config.widgetFamily=='large'?2:config.widgetFamily=='medium'?1:0;}
async function createWidget() {
	let w= new ListWidget()
	w.backgroundColor=new Color(CS[cs].b,0.9);
	// Date
	let date=w.addText(getDatext());
	date.font=Font.boldSystemFont(14), date.textColor=new Color(CS[cs].d);
	// Weather
	w.addSpacer(6);
	let wtext='';
	try {wtext=await getWeather(loc);} catch (e) {wtext='暂时与气象卫星失去了联系';}
	let weather=w.addText(wtext);
	weather.font=Font.lightSystemFont(12), weather.textColor=new Color(CS[cs].w,0.81);
	// Events
	if (FF==0||size>1) {
		w.addSpacer(2);
		const Ev=procEvents(Events);
		for (let o of Ev) {
			w.addSpacer(4);
			let event=w.addText(o);
			event.font=Font.lightSystemFont(11), event.textColor=new Color(CS[cs].e,0.72);
		}
	}
	// Funds
	if (FF==1) {
		w.addSpacer(2);
		const Fu=await getFunds();
		for (let o of Fu) {
			w.addSpacer(4);
			let fund=w.addText(o[0]);
			fund.font=Font.lightSystemFont(11), fund.textColor=new Color(CS[cs].f[o[1]],0.72);
		}
	}
	// Stock
	else if (FF==2) {
		w.addSpacer(2);
		const St=await getStocks();
		if (size==1&&St.length>3) {
			let i=0;
			while (i<St.length) {
				w.addSpacer(4);
				let stack=w.addStack();
				for (let j=0; j<2; j++) {
					if (St[i]) {
						let stock=stack.addText(St[i][0]);
						stock.font=Font.lightSystemFont(11), stock.textColor=new Color(CS[cs].f[St[i][1]],0.72);
						if (i%2==0) {stack.addSpacer();}
						i++;
					} else {break;}
				}
			}
		} else {
			for (let o of St) {
				w.addSpacer(4);
				let stock=w.addText(o[0]);
				stock.font=Font.lightSystemFont(11), stock.textColor=new Color(CS[cs].f[o[1]],0.72);
			}
		}
		
	}
	// Motto
	if (size) {
		w.addSpacer(6);
		let y='';
		try {y=await getMotto();} catch (e) {y='“此时无声胜有声。” -- 在那个没有互联网的远古时代';}
		let motto=w.addText(y);
		motto.font=Font.lightSystemFont(10), motto.textColor=new Color(CS[cs].m,0.72);
	}
	// return widget
	return w;
}
function getDatext () {
	let DF=new DateFormatter();
	DF.dateFormat='M月d日'; 
	let da=DF.string(CD)+sep+'周'+['日','一','二','三','四','五','六'][CD.getDay()];
	DF.dateFormat='D';
	if (size) {da+=sep+lunar(DF.string(CD))+sep+'全年'+Math.floor(DF.string(CD)/(365+(CD.getYear()%4?0:1))*100)+'%';}
	return da;
}
async function getWeather (loc) {
	const req=new Request('http://wttr.in/'+loc+'?format=j1&lang=zh'), du=size?'° ':'°', dux=size?'°':'';
	req.allowInsecureRequest=true;
	const res=await req.loadJSON()||null, CC=res.current_condition[0]||null, W=res.weather[0]||null, cv=CC['lang_zh'][0].value||'', n=Math.ceil((dh+1)/3), fv=n<8?W.hourly[n]['lang_zh'][0].value||'':res.weather[1].hourly[0]['lang_zh'][0].value||'';
	const t=+CC.temp_C, l=+W.mintempC, h=+W.maxtempC, ll=t<l?t:l, hh=t>h?t:h;
	return cv+sep+t+du+' ('+(size?'低':'')+ll+dux+'/'+(size?'高':'')+hh+dux+rainsnow(fv)+')';
}
function rainsnow (x) {
	if (x.indexOf('雪')>-1) {return size?' · 3小时内或有❄️':'❄️';}
	else if (x.indexOf('雨')>-1) {return size?' · 3小时内或有🌧️':'🌧️';}
	else {return '';}
}
function procEvents (E) {
	const max=size>1?6:size?3:4, xday=size?' · 还有':' ', today=size?' · 就是今天':'今天';
	E.sort((a,b)=>{return new Date(a[1]).getTime()-new Date(b[1]).getTime();});
	let Ex=[];
	for (let o of E) {
		let diff=Math.ceil((new Date(o[1]).getTime()-28800000-CD.getTime())/86400000);
		if (diff>-1) {Ex.push(o[0]+(diff>0?xday+diff+'天':today)); if (Ex.length==max) {break;}}
	}
	return Ex;
}
async function getFunds () {
	const max=size>1?6:size?3:4;
	let Fx=[];
	try {
		const req=new Request('https://api.doctorxiong.club/v1/fund?code='+Fcodes), res=await req.loadJSON()||{};
		let F=res.data||[];
		if (F.length>max) {F.length=max;}
		for (let o of F) {
			let g=o.expectGrowth;
			Fx.push([(size?o.name:o.code)+' · '+o.expectWorth+(size?' ('+(g>0?'+':'')+g+'%)':''), g>0?1:g<0?2:0]);
		}
	} catch (e) {Fx=[['暂时与交易所失去了联系',0]];}
	return Fx;
}
async function getStocks () {
	const max=size?6:4;
	let Sx=[];
	try {
		const req=new Request('https://qt.gtimg.cn/q='+procStocks(Fcodes)), res=await req.loadString()||'';
		if (res=='v_pv_none_match="1";') {Sx=[['无效的股票代码',0]];}
		else {
			let S=res.match(/="[^"]+";/g).map(x=>x.split('~'));
			if (S.length>max) {S.length=max;}
			for (let o of S) {
				let g=o[5];
				Sx.push([(size?o[1]:o[1].substr(0,2))+' '+o[3]+' ('+(g>0?'+':'')+g+'%)', g>0?1:g<0?2:0]);
			}
		}
	} catch (e) {Sx=[['暂时与交易所失去了联系',0]];}
	return Sx;
}
function procStocks(x) {
	return x.split(',').map(s=>/(60[013]|688)\d{3}/.test(s)?'s_sh'+s:/(00[023]|300)\d{3}/.test(s)?'s_sz'+s:'').join(',');
}
async function getMotto () {
	const req=new Request('https://v1.hitokoto.cn/?encode=json'), res=await req.loadJSON()||null;
	return '“'+res.hitokoto+'” -- '+res.from;
} 
function lunar (D) {
	// 农历已支持到2021年，到了2022年我再更新
	const y=CD.getFullYear(), L={'2020': [-6,24,53,83,113,143,172,202,231,260,290,319,349], '2021': [-17,12,42,71,101,131,160,190,219,249,278,308,337]}, Lx={'2020': ['腊','正','二','三','四','闰四','五','六','七','八','九','十','冬'], '2021': ['冬','腊','正','二','三','四','五','六','七','八','九','十','冬']};
	let i=12;
	while (D<L[y][i]+1) {i--;}
	return Lx[y][i]+'月'+zh(D-L[y][i]);
}
function zh(x) {
	const Z=['','一','二','三','四','五','六','七','八','九','十'];
	return x<11?'初'+Z[x]:x<20?'十'+Z[x-10]:x==20?'二十':x<30?'廿'+Z[x-20]:'三十';
}