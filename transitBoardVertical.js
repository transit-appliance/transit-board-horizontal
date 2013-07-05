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

var transitBoardVertical = {}; // keep state

// constants

transitBoardVertical.APP_NAME 		= "Transit Board Vertical";
transitBoardVertical.APP_VERSION 	= "1.00";
transitBoardVertical.APP_ID 			= "tbdvertical";

// assess environment

transitBoardVertical.is_development = (document.domain == "dev.transitboard.com");
transitBoardVertical.isChumby = navigator.userAgent.match(/QtEmb/) != null;

var orig_query_string = window.location.search;
var app_query_string = orig_query_string.replace(/option\[(top|left|right|bottom)\]=[0-9]*(&|$)/g,"");
var app_url = "/apps/transitBoardByLine/transitBoardByLine.html"+app_query_string;


/**
 * Loosely modeled on jquery.parsequery.js by Michael Manning (http://actingthemaggot.com)
 **/
trArrParseQuery = function(qs) {
	var q = (typeof qs === 'string'?qs:window.location.search);
	var params = {};
	jQuery.each(q.match(/^\??(.*)$/)[1].split('&'),function(i,p){
		p = unescape(p).replace(/\+/g,' ').replace(/\]/g,'');
		p = p.split('=');
		var keys = p[0].split('[');
		var value = p[1];
		var depth = keys.length;
		if (depth == 1) {
			// actually shouldn't happen, should always have at least two levels
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			params[keys[0]][value] = true;
		}
		if (depth == 2) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			params[keys[0]][keys[1]][value] = true;
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
			params[keys[0]][keys[1]][keys[2]][value] = true;
		}
	});
	return params;
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
	suppl_url = "http://transitappliance.com/size_info.html";
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

var top_height = Math.floor(effective_height * split_pct/100);
var bottom_height = effective_height - top_height;

	
// populate html

var html = '<div id="tb_frames" style="width: ' + effective_width + 'px; height: ' + effective_height + 'px"><iframe id="app_frame" src="'+app_url+'" scrolling="no" style="border:none; margin: 0; float: left; width: ' + effective_width + 'px; height: ' + top_height + 'px; clear: both"></iframe>';
if (bottom_height > 1) {
	html += '</iframe><iframe id="suppl_frame" src="' + suppl_url + '" scrolling="no" style="border: none; margin: 0; width: ' + effective_width + 'px; height: ' + bottom_height+'px"></iframe>';
}
html += '</div>';
	
jQuery('body').html(html);

	


