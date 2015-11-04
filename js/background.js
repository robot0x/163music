$(function(){var e=Settings.getValue("ver");if(e!="2.0"){Settings.setValue("ver","2.0");chrome.tabs.create({url:"options.html"})}var t={};var i=new backgroundConnector;var n=null;t.list=null;t.listCount=0;t.listPage=1;t.songs=new Array;t.index=0;t.type=Settings.getValue("type","list");t.error=0;t.fav="0";t.errorTime=new Date;t.options=function(){return Settings.getObject("options")||{list:1,radio:1,rank:1,mine:1,lyric:1,notify:1,cover:"album"}};t.init=function(){$("body").append("<audio id='player' autoplay></audio>");n=document.getElementById("player");n.volume=Settings.getValue("volume",1);n.addEventListener("error",function(e){t.errorTime=new Date;var i=new Date-t.errorTime;if(i>6e4)t.error=0;if(t.error<100){t.playNext()}t.error++});n.addEventListener("timeupdate",function(e){var t=Math.round(n.currentTime/n.duration*100);var a={act:"timeupdate",time:n.currentTime,percent:t,duration:n.duration};i.send(a)});n.addEventListener("ended",function(e){t.playNext()});t.listCount=parseInt(Settings.getValue("count","0"));t.index=parseInt(Settings.getValue("index","0"));t.listPage=parseInt(Settings.getValue("page","1"));var e=Settings.getObject("list");if(e)t.list=e;var a=Settings.getObject("songs");if(a){t.songs=a}};t.getAndPlay=function(e){i.send({act:"loading"});switch(t.type){case"dj":t.getAndPlayDj();break;case"singer":t.getAndPlayRadio(true);break;case"album":t.getAndPlayAlbum();break;default:t.getAndPlayList(e);break}};t.getAndPlayList=function(e){t.index=0;if(e)t.index=e;t.listPage=1;Settings.setValue("page",t.listPage);Settings.setValue("type","list");Settings.setObject("list",t.list);var i=t.list.id;var n="http://music.163.com/api/playlist/detail?id="+i;n+="&csrf_token="+Settings.getValue("lckey","");$.get(n,function(e){if(e.code==200){t.listCount=e.result.trackCount;Settings.setValue("count",t.listCount);t.songs=e.result.tracks;if(t.fav=="1"){for(var i=0;i<t.songs.length;i++){t.songs[i].isfaved="1"}}Settings.setObject("songs",t.songs);t.play()}})};t.getAndPlayAlbum=function(){t.index=0;t.listPage=1;Settings.setValue("page",t.listPage);Settings.setValue("type","album");var e=(new Date).getTime();var i={};i.id=t.list.id;i.coverurl=t.list.cover;i.name=t.list.name;if(t.list.artists.length>0){i.creator={nick_name:t.list.artists[0].name,portrait:t.list.artists[0].portrait}}Settings.setObject("list",i);var n=t.list.id;var a=Settings.getValue("lckey","");var s="http://v5.pc.duomi.com/singer-ajaxsinger-albumsongs?id="+n+"&pi=1&pz=50&_="+e+"&lckey="+a;$.getJSON(s,function(e){if(e.dm_error==0){t.listCount=e.total;Settings.setValue("count",t.listCount);var i=new Array;for(var n=0;n<e.tracks.length;n++){i.push({track:e.tracks[n],album:e.tracks[n].album})}t.songs=i;Settings.setObject("songs",t.songs);t.play()}})};t.getAndPlayDj=function(e){t.index=0;if(e)t.index=e;t.listPage=1;Settings.setValue("page",t.listPage);var i=(new Date).getTime();var n=t.list.id;var a="http://music.163.com/api/dj/program/detail?id="+n+"&ids=%5B"+n+"%5D";a+="&csrf_token="+Settings.getValue("lckey","");$.getJSON(a,function(e){if(e.program&&e.program.songs&&e.program.songs.length>0){t.songs=e.program.songs;t.listCount=e.program.songs.length;Settings.setValue("count",t.listCount);Settings.setObject("songs",t.songs);e.program.songs=null;t.list=e.program;Settings.setObject("list",t.list);t.playDj()}})};t.getAndPlayRadio=function(e){t.index=0;t.listPage=1;Settings.setValue("page",t.listPage);var i=(new Date).getTime();var n=t.list.id;var a="http://search.pc.duomi.com/search?t=getrndlistsong&plid="+n+"&pi=50&mz";var s={};s.id=t.list.id;s.creator={nick_name:"网易云音乐",portrait:"img/logo.png"};if(e){a="http://v5.pc.duomi.com/singer-ajaxsinger-radio?id="+n;s.coverurl=t.list.portrait;s.name=t.list.name+"电台";Settings.setValue("type","singer")}else{Settings.setValue("type","radio");s.coverurl=t.list.treenode.url;s.name=t.list.treenode.name}Settings.setObject("list",s);$.getJSON(a,function(e){if(e.item){t.listCount=e.head.hit;Settings.setValue("count",t.listCount);t.songs=new Array;for(var i=0;i<e.item.length;i++){var n=e.item[i];var a={};a.id=n.sid;a.name=n.sname;a.singer=n.sartist;if(n.alid!=""){a.pic="http://imgv5.duomiyy.com/album/l"+n.alid+".jpg"}else{a.pic="img/cover.png"}t.songs.push(a)}Settings.setObject("songs",t.songs);t.playRadio()}})};t.playPrev=function(){t.pause();t.index-=1;t.play()};t.playNext=function(){t.index+=1;t.play()};t.volumeUp=function(){var e=document.getElementById("player");if(e.volume+.1<=1){e.volume+=.1}else{e.volume=1}Settings.setValue("volume",e.volume.toFixed(2))},t.volumeDown=function(){var e=document.getElementById("player");if(e.volume-.1>0){e.volume-=.1}else{e.volume=0}Settings.setValue("volume",e.volume.toFixed(2))},t.pause=function(){n.pause()};t.replay=function(){if(n.currentTime>0){n.play()}else{n.src="";t.play()}};t.play=function(){if(Settings.getValue("cycle",0)==1){if(n.currentTime>0){n.play()}else{n.src="";if(t.type=="radio"||t.type=="singer"){t.playRadio()}else{t.playTo()}}}else{if(t.type=="radio"||t.type=="singer"){t.playRadio()}else{t.playTo()}}};t.playTo=function(){if(t.index<0){t.index=0}if(t.index>=t.listCount){t.index=0}else{var e=t.songs[t.index];Settings.setObject("song",e);Settings.setValue("index",t.index);i.send({act:"play"});n.setAttribute("src",e.mp3Url);n.play();i.send({act:"loaded"})}if(t.options().notify==1){var a=new notify;a.show()}};t.playDj=function(){if(t.index<0){t.index=0}if(t.index>=t.listCount){t.getAndPlayDj()}else{var e=t.songs[t.index];Settings.setObject("song",e);Settings.setValue("index",t.index);i.send({act:"play"});n.setAttribute("src",e.mp3Url);n.play();i.send({act:"loaded"})}if(t.options().notify==1){var a=new notify;a.show()}};t.playRadio=function(){if(t.index<0){t.index=0}if(t.index>=t.listCount){t.getAndPlayRadio()}else{var e=t.songs[t.index];Settings.setObject("song",e);Settings.setValue("index",t.index);i.send({act:"play"});n.setAttribute("src",t.url(e.id));n.load();i.send({act:"loaded"})}if(t.options().notify==1){var a=new notify;a.show()}};t.url=function(e){return"http://www.duomi.com/third-getfile?id="+e};window.notify=function(){var e,t=false,i=null,n=this;return{show:function(){if(window.webkitNotifications){var i=Settings.getObject("song");var n="";var a=i.artists[0].name;var s=i.name;var r="";r="<"+i.album.name+"> ";n=i.album.picUrl+"?param=60y60";var l=r+s;e=webkitNotifications.createNotification(n,a,l);e.show();t=true;this.timer()}},hide:function(){e.cancel();t=false},timer:function(){i=setTimeout(function(){this.hide();i=null}.bind(this),3e3)},clear:function(){clearTimeout(i);i=null},isVisible:function(){return t}}};var a={};a.init=function(){i.name="163music";i.onConnect=function(e){};i.onDisConnect=function(e){};i.init(function(e){switch(e.act){case"playlist":t.list=e.data;t.type="list";t.fav=e.fav;t.songs=new Array;t.getAndPlay(e.idx);break;case"playdj":t.list=e.data;t.songs=new Array;t.type="dj";t.getAndPlayDj(e.idx);break;case"playradio":t.list=e.data;t.songs=new Array;t.type="radio";t.getAndPlay();break;case"playalbum":t.list=e.data;t.type="album";t.songs=new Array;t.getAndPlay();break;case"playsinger":t.list=e.data;t.type="singer";t.songs=new Array;t.getAndPlay();break;case"pause":t.pause();break;case"play":t.replay();break;case"next":t.playNext();break;case"prev":t.playPrev();break;case"up":t.volumeUp();break;case"down":t.volumeDown();break}});t.init()};a.init()});chrome.webRequest.onBeforeSendHeaders.addListener(function(e){if(e.type==="xmlhttprequest"||e.type==="other"){var t=false;for(var i=0;i<e.requestHeaders.length;++i){if(e.requestHeaders[i].name==="Referer"){t=true;e.requestHeaders[i].value="http://music.163.com";break}}if(!t){e.requestHeaders.push({name:"Referer",value:"http://music.163.com"})}return{requestHeaders:e.requestHeaders}}},{urls:["http://music.163.com/api/*","http://*.music.126.net/*"]},["blocking","requestHeaders"]);