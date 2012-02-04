/**
 * Countries liveSearch plugin
 *
 * @version 0.2
 * @author Sergey Sidorovich mailto: sergey.sidorovich@gmail.com
 * 
 */
var liveSearch = {
	//defaults do not reassign this rules in childs	
	defaults: {
		searchButtonText: 'search',
		oneSessionCahce: false, //work only if localStorage supported
		actionFile: 'search.php',
		searchScriptPath: '/jstraning/countries.php?q='		
	},
	options: {
		wrapperId: 'livesearchWrap',
		searchFormId: 'searchForm',
		inputId: 'search',
		resultId: 'res'
	},
	
	init: function() {
		//creating search form
		var searchWrapper = document.getElementById(this.options.wrapperId);
		searchWrapper.innerHTML = '<form id="'+ this.options.searchFormId +'" class="livesearch form" action="'+ this.defaults.actionFile +'"><input id="'+ this.options.inputId +'" type="text" class="livesearch input" autocomplete="off"/><input type="submit" value="'+ this.defaults.searchButtonText +'" /><select id="'+ this.options.resultId +'" class="livesearch results"></select></form>';
		var input = document.getElementById(this.options.inputId);
		var result = document.getElementById(this.options.resultId);
		var cache = new Object;
		var UP = 38;
		var DOWN = 40;
		var LEFT = 37;
		var RIGHT = 39;
		var ENTERKEY = 13;
		var request;
		var oneSessionCahce = this.defaults.oneSessionCahce;
		var searchScriptPath = this.defaults.searchScriptPath;
		if(typeof(QUOTA_EXCEEDED_ERR) == 'undefined') {
			var QUOTA_EXCEEDED_ERR;
		}
		
		// trim() for IE
		if(typeof String.prototype.trim !== 'function') {
			String.prototype.trim = function() {
				return this.replace(/^\s+|\s+$/g, '');
			}
		}
		
		
		//XmlHttpRequest for all browsers
		var getXmlHttp = function() {
			var xmlhttp;
			try {
				xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
			} catch (e) {
				try {
					xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
				} catch (E) {
					xmlhttp = false;
				}
			}
	
			if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
				xmlhttp = new XMLHttpRequest();
			}
			return xmlhttp;
		}
		var xmlHttp = getXmlHttp();
	
		//check if Enter pressed
		var checkEnter = function(e) {
			if (!e) e = window.event;
			if (!e.which) e.which = e.keyCode;
			if(e.which == ENTERKEY) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
				this.selectedIndex = -1;
				this.style.display = 'none';
				input.focus();
			}
		}
		
		// put result value to input field on mouse pres or navigating across results 
		var resultToInput = function(e) {
			if (!e) e = window.event;
			if (!e.which) e.which = e.keyCode;
			input.value = this[this.selectedIndex].text;
			if ( e.which == 1 || e.which == 0) {// 0 and 1 it's left mouse key in THE BEST BROWSER and another browsers  
				this.selectedIndex = -1;
				this.style.display = 'none';
				input.focus();
			}
			else if (this.selectedIndex==0 && this.options[0].id != 'first') {
				this.options[0].id = 'first';
			}
			else if(this.selectedIndex!=0 && this.options[0].id == 'first') {
				this.options[0].id = '';
			}
			else if (e.which == UP && result.selectedIndex==0 && result.options[0] == document.getElementById('first')) {
				input.focus();
				this.selectedIndex = -1;
			}
		};

		// scan keys pressed in input field
		var keys = function(e) {
			if (!e) e = window.event;
			if (!e.which) e.which = e.keyCode;
			if(e.which == DOWN && result.style.display == 'block') {
				result.focus();
				result.selectedIndex=0;
				this.value = result[result.selectedIndex].text;
			}
			if(this.value.trim().length < 3) {
				if(result.style.display == 'block') {
					result.style.display = 'none';
				}
				return;
			} else 	response(e);
		};
		
		//making CACHE if localStorage avaible if no using old style object CACHE
		var makingCache = function(id, data) {
			if(typeof(localStorage) == 'undefined' ) {
				cache[id] = data;
			}
			else {
				try {
					localStorage.setItem(id, JSON.stringify(data));
				}
				catch (e) {
					if (e == QUOTA_EXCEEDED_ERR) {
						localStorage.clear();
						try {
							localStorage.setItem(id, data);
						} 
						catch (E) {
							if (E == QUOTA_EXCEEDED_ERR) {
								cache[id] = data;
							}
						}
					}
				}
			}	
		};
		
		//put response data to to results field
		var responseToHTML = function(json) {
			if(json == '') {
				result.style.display = 'none';
				return;
			}
			result.innerHTML = '';
			if(json.length == 1) {
				result.size = 2;
			}
			else result.size = json.length;
	
			for (var i = 0; i<json.length; i++)
			{
				var newElement = document.createElement('option');
				newElement.innerHTML =json[i].short_name + ' ( ' + json[i].long_name + ' )';
				result.appendChild(newElement);
			}
			if(result.size != '0') {
				result.style.display = 'block';
			}
		};
		
		//getting response from server or using CACHE
		var response = function(e) {
			if(e.which == LEFT || e.which == UP || e.which == RIGHT || e.which == DOWN) return;// not send request when we using arrow keys
			request = input.value;
			if (!cache[request] && !localStorage.getItem(request)) {
				xmlHttp.open('GET', searchScriptPath + request, true);
				xmlHttp.onreadystatechange = function()  {
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						if(typeof(JSON) == 'undefined') {
							var json = eval( '(' + xmlHttp.responseText + ')' );
						}
						else {
							var json = JSON.parse(xmlHttp.responseText);
						}
						json = json.countries;
						makingCache(request, json);
						responseToHTML(json);
					}
				}
				xmlHttp.send(null);
			}
			else if(cache[request]) {
				var json = cache[request];
				responseToHTML(json);
			}
			else if(localStorage.getItem(request)) {
				json = JSON.parse(localStorage.getItem(request));
				responseToHTML(json);
			}
		};
		
		var cacheClear = function() {
				localStorage.clear();
		};
		
		
		var eventHandler = function(el, type, fn){
			if (typeof el.addEventListener === 'function') {
				eventHandler = function(el, type, fn) {
					el.addEventListener(type, fn, false);
				};
			} else if (typeof el.attachEvent === 'function'){
				eventHandler = function(el, type, fn) {
					el.attachEvent('on' + type, fn);
				};
			} else {
				eventHandler = function(el, type, fn) {
					el['on' + type] = fn;
				};
			}
	
			return eventHandler(el, type, fn);
		};
	
	
		eventHandler(input, 'keyup', keys);
		eventHandler(result, 'keydown', checkEnter);
		eventHandler(result, 'keyup', resultToInput);
		eventHandler(result, 'click', resultToInput);
		if(typeof(localStorage) != 'undefined' && oneSessionCahce == true){
			eventHandler(window, 'unload', cacheClear);
		};
		
		//pluginize additional instances of live search
		aditionalLiveSearch = function() {};
		aditionalLiveSearch.prototype = this;
		
		//if you want to add additional live Search to page just make new livesearch after this plugin called
		//EXAMPLE of use:
		// HTML
		//	<div id="livesearchWrap2"></div>
		// JS
		//	var newSearch = new aditionalLiveSearch;
		//	newSearch.options = {
		//		inputId: 'search2',
		//		resultId: 'res2',
		//		wrapperId: 'livesearchWrap2',
		//		searchFormId: 'searchForm2',
		//		actionFile: 'search2.php'
		//	};
		//	newSearch.init();
		//NOTE: Don't forget to set ALL options and make new css rules for new instance of live search 

	}
}
