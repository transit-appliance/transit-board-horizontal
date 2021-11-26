/*
   Copyright 2010-2013 Portland Transport

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var transitBoardHorizontal = {}; // keep state

// constants

transitBoardHorizontal.APP_NAME 		= "Transit Board Horizontal";
transitBoardHorizontal.APP_VERSION 	= "1.04";
transitBoardHorizontal.APP_ID 			= "tbdhorizontal";

// 1.03 - 9/22/16 - shift to jQuery 1.11.0
// 1.04 - 11/26/21 - make neutral with regard to http/https

// assess environment

transitBoardHorizontal.is_development = (document.domain == "dev.transitboard.com");
transitBoardHorizontal.isChumby = navigator.userAgent.match(/QtEmb/) != null;

//var orig_query_string = window.location.search;
//var app_query_string = orig_query_string.replace(/option\[(top|left|right|bottom)\]=[0-9]*(&|$)/g,"");
//var app_url = "/apps/transitBoardByLine/transitBoardByLine.html"+app_query_string;




/**
 * Loosely modeled on jquery.parsequery.js by Michael Manning (http://actingthemaggot.com)
 **/
trArrParseQuery = function(qs) {
	var q = (typeof qs === 'string'?qs:window.location.search);
	var params = {};
	jQuery.each(q.match(/^\??(.*)$/)[1].split('&'),function(i,p){
		p = p.replace(/\+/g,' ').replace(/\]/g,'');
		p = p.split('=');
		var keys = p[0].split('[');
		var value = p[1];
		var depth = keys.length;
		if (depth == 1) {
			// actually shouldn't happen, should always have at least two levels
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			params[keys[0]][unescape(value)] = true;
		}
		if (depth == 2) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			params[keys[0]][keys[1]][unescape(value)] = true;
		}
		if (depth == 3) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			if (params[keys[0]][keys[1]][keys[2]] == undefined) {
				params[keys[0]][keys[1]][keys[2]] = {};
			}
			params[keys[0]][keys[1]][keys[2]][unescape(value)] = true;
		}
	});
	return params;
}

function trArrSupportsCors() {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Supports CORS
    return true;
  } else if (typeof XDomainRequest != "undefined") {
    // IE
    return true;
  }
  return false;
}

var query_params = trArrParseQuery();

// turns options from objects into arrays
var options = {};
for (var option in query_params.option) {
	var opt_array = [];
	for (var value in this.query_params.option[option]) {
		opt_array.push(value);
	}
	options[option] = opt_array;
}

var appliance = {};
for (var appl in query_params.appl) {
	var opt_array = [];
	for (var value in this.query_params.appl[appl]) {
		opt_array.push(value);
	}
	appliance[appl] = opt_array;
}

var second_page = false;
if (options['second_page'] == 1) {
	second_page = true;
}

var num_pages = options['num_pages'] || 1;
if (second_page && num_pages < 2) {
	num_pages = 2;
}
num_pages = num_pages * 1;

var page_delay = options['page_delay'] || 15;
		
// initialize screen margins

var body_width 		= options.width || jQuery(window).width();
var body_height 	= options.height || jQuery(window).height();	

var left_border 	= options.left || 0;
var bottom_border = options.bottom || 0;
var top_border 		= options.top || 0;
var right_border 	= options.right || 0;

var split_pct 		= options.splitpct || 100;
var suppl_url 		= options.suppl_url;

if (suppl_url == "") {
	suppl_url = "//transitappliance.com/size_info.html";
}

var effective_width = body_width - left_border - right_border;
var effective_height = body_height - bottom_border - top_border;

jQuery("body").css("width",effective_width).css("height",effective_height);
jQuery("body").css("margin","0");

jQuery("body").css('border-left-width',left_border);
jQuery("body").css('border-top-width',top_border);
jQuery("body").css('border-right-width',right_border);
jQuery("body").css('border-bottom-width',bottom_border);
jQuery("body").css('border-color','black');
jQuery("body").css('border-style','solid');
jQuery("body").css('position','relative'); // for reasons I haven't figured out, this has to be set late

var left_width = Math.floor(effective_width * split_pct/100);
var right_width = effective_width - left_width;

var primary_id = appliance['id']+":A";
var app_url = "/apps/loader.html?"+primary_id;
	
// populate html

var html = '<div id="tb_frames" style="width: ' + effective_width + 'px; height: ' + effective_height + 'px">';
html += '<div style="position: relative; float: left; border:none; margin: 0; width: ' + left_width + 'px; height: ' + effective_height + 'px">';
html += '<iframe id="app_frame1" src="'+app_url+'" scrolling="no" style="background: white; position: absolute; border:none; margin: 0; float: left; width: ' + left_width + 'px; height: ' + effective_height + 'px"></iframe>';

if ( num_pages > 1 && appliance['id'] ) {
	for (var i=2;i<=num_pages;i++) {
		var letter = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").substr(i-1,1);
		//alert(letter);
		var id = appliance['id'];
		var alt_id = id+":"+letter;
		var app_url2 = "/apps/loader.html?"+alt_id;
		html += '<iframe id="app_frame'+i+'" src="'+app_url2+'" scrolling="no" style="background: white; position: absolute; float: left; border:none; margin: 0; width: ' + left_width + 'px; height: ' + effective_height + 'px"></iframe>';
	}
}
/*
if ( second_page && appliance['id'] ) {
	var id = appliance['id'];
	var alt_id = id+":B";
	var app_url2 = "/apps/loader.html?"+alt_id;
	html += '<iframe id="app_frame2" src="'+app_url2+'" scrolling="no" style="position: absolute; float: left; border:none; margin: 0; width: ' + left_width + 'px; height: ' + effective_height + 'px"></iframe>';
}
*/
html += '</div>';
if (right_width > 1) {
	html += '</iframe><iframe id="suppl_frame" src="' + suppl_url + '" scrolling="no" style="background: white; border: none; margin: 0; width: ' + right_width + 'px; height: ' + effective_height+'px"></iframe>';
}
html += '</div>';
	
jQuery('body').html(html);

var current_frame = 0;
function rotate_frames () {
	current_frame = current_frame + 1;
	if (current_frame > num_pages) {
		current_frame = 1;
	}
	//alert(current_frame+" out of "+num_pages);
	for (var i=1;i<=num_pages;i++) {
		if (i == current_frame) {
			var frame = document.getElementById("app_frame"+i);
			if (frame !== null) {
				frame.style.zIndex = 1000;
			}
		} else {
			var frame = document.getElementById("app_frame"+i);
			if (frame !== null) {
				frame.style.zIndex = -1000;
			}
		}
	}
	setTimeout(rotate_frames,page_delay*1000);
}

if ( num_pages > 1 && appliance['id'] ) {
	setTimeout(rotate_frames,100000); // 100 second delay to let everything load
}

/*
if ( second_page && appliance['id'] ) {
	setTimeout(function(){
		jQuery("#app_frame2").css('display','none');
		setInterval(function(){
			jQuery("#app_frame1, #app_frame2").toggle(1000);
		},15000);
	},100000);
}
*/

// set up healthcheck/restart logic

var start_time = ((new Date)).getTime();

transitBoardHorizontal.access_method = "jsonp";
if (trArrSupportsCors()) {
	transitBoardHorizontal.access_method = "json";
}

var platform = "";
if (typeof options.platform === 'object') {
	platform = options.platform[0];
}

jQuery.ajax({
		dataType: transitBoardHorizontal.access_method,
		url: "//ta-web-services.com/health_update.php",
		data: { timestamp: start_time, start_time: start_time, version: 'N/A', "id": appliance['id'], application_id: transitBoardHorizontal.APP_ID, application_name: transitBoardHorizontal.APP_NAME, application_version: transitBoardHorizontal.APP_VERSION, "height": jQuery(window).height(), "width": jQuery(window).width(), "platform": platform }
});

// logging of startup, beat every 30 min goes here
setInterval(function(){
	jQuery.ajax({
			url: "//ta-web-services.com/health_update.php",
			dataType: transitBoardHorizontal.access_method,
			cache: false,
			data: { timestamp: ((new Date)).getTime(), start_time: start_time, version: 'N/A', "id": appliance['id'], application_id: transitBoardHorizontal.APP_ID, application_name: transitBoardHorizontal.APP_NAME, application_version: transitBoardHorizontal.APP_VERSION, "height": jQuery(window).height(), "width": jQuery(window).width(), "platform": platform },
			success: function(data) {
				if( typeof data != "undefined" && data.reset == true ) {
					reset_app();
				}
			}
	});
}, 30*60*1000);


var reset_app = function() {
	if (appliance['id']) {
		if(typeof trLoader == 'function') {
			trLoader(appliance['id']);
		} else {
			window.location = "//transitappliance.com/cgi-bin/launch_by_id.pl?id="+appliance['id'];
		}
	} else {
		window.location.reload(true);
	}
}
	


