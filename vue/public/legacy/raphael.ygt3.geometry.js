 //var userAgent = window.navigator.userAgent.toLowerCase();     $.browser.msie10 = $.browser.msie && /msie 10\.0/i.test(userAgent);  $.browser.msie9 = $.browser.msie && /msie 9\.0/i.test(userAgent);   $.browser.msie8 = $.browser.msie && /msie 8\.0/i.test(userAgent);  $.browser.msie7 = $.browser.msie && /msie 7\.0/i.test(userAgent);  $.browser.msie6 = !$.browser.msie8 && !$.browser.msie7 && $.browser.msie && /msie 6\.0/i.test(userAgent);  
 // write by mojiaoyang 2015.10

    function draw_ygt3(datas, panel, title, a_ygtstyle, showsave, leaftype, onSave) {
 
        var g_middle_line_width="1";
      var  g_stroke_width =  "1";
      var  g_stroke = "#333333";
      var  g_fill =  "#333333";
      var  g_bg_color="#FFFF99";  //黄色
      var  g_text_color="#333333";   //黑色
      var g_bg_color_important="#FF5733";  
      var g_text_color_important = g_fin_color;   
      var g_stroker_important = "#FF5733";
      var g_spine_color = "#333333";
      var g_fin_color = "#333333";
      var g_fin_bg_color = "#333333";
      var startwidth_head = 0;
      var startwidth_head_toleft = 0;
      var startwidth = 80;
      var g_max_top = 50;
      var g_height=50;
      var g_add_foot_width= 100;
      var fish_head_x = 186;
      var fish_head_y = 248;
      var fish_tail_w = 155;
      var fish_tail_h = 310; 
      var start_middle = 0;
      var start_middle_child = 0;
      var g_arrow_size = 5;
  
      var startwidth_pyl = 0;
      var startwidth_head=0;

    var g_cqi_flag = "0";
    var g_fish_preset = "";
    var g_font_size = "16px";
    var g_group_spacing = 30; // 组间距（鱼刺组之间的水平间距，单位px）

    // 一级鱼刺独立样式属性
    var g_fin_color_1 = g_fin_color;
    var g_stroke_width_1 = "2";
    var g_arrow_size_1 = 8;
    var g_text_color_1 = "#fff";
    var g_font_size_1 = "18px";
    var g_font_weight_1 = 700;
    var g_text_line_spacing_ratio_1 = 0; //一级文字线间距比例（0=不加间距，有独立边框对齐逻辑）

    // 二级鱼刺独立样式属性
    var g_fin_color_2 = g_fin_color;
    var g_stroke_width_2 = "1";
    var g_arrow_size_2 = 5;
    var g_text_color_2 = g_text_color;
    var g_font_size_2 = "14px";
    var g_font_weight_2 = 700;
    var g_text_line_spacing_ratio_2 =0; //二级文字线间距比例

    // 三级鱼刺独立样式属性
    var g_fin_color_3 = g_fin_color;
    var g_stroke_width_3 = "0.8";
    var g_arrow_size_3 = 3;
    var g_text_color_3 = g_text_color;
    var g_font_size_3 = "12px";
    var g_font_weight_3 = 400;
    var g_text_line_spacing_ratio_3 = 0; //三级文字线间距比例

    var obj_style;
      var obj_style_flag = false;
      var ygtstyle="";
      if (typeof a_ygtstyle != "" && typeof a_ygtstyle === 'string') { 
        try {
            var json_obj = JSON.parse(a_ygtstyle);
            if (typeof json_obj == "object" && json_obj) {
                obj_style =json_obj[0];
                ygtstyle = obj_style["ygtstyle"]; 
            }
            obj_style_flag = true;
        }catch(err) {
            ygtstyle=a_ygtstyle;
        }

    } 
    else if (typeof a_ygtstyle == "object" && a_ygtstyle) {
        obj_style_flag = true;
        obj_style = a_ygtstyle[0];
        ygtstyle = obj_style["ygtstyle"]; 
    }
   if (ygtstyle==undefined)
   {

       ygtstyle="";
   }
    if (obj_style_flag && obj_style) {
        if (obj_style["g_fish_preset"] !== undefined && obj_style["g_fish_preset"] !== "") {
            g_fish_preset = obj_style["g_fish_preset"];
            // 仅在 custom 模式下才用 g_fish_preset 覆盖鱼头鱼尾样式，不改变整体布局
            if (ygtstyle === "custom") {
                // 保持 ygtstyle 为 custom，只替换鱼头鱼尾
            } else {
                ygtstyle = g_fish_preset;
            }
        }
    }

  
   if (ygtstyle=="normal")
    {
        ygtstyle=""; 
    }
    else{
        if (ygtstyle=="")
        {
            ygtstyle="ygt1"; 
    
        }   
    }

        var g_fish_head_6="";
        var g_fish_tail_6="";
 
        var ygt1 =   [{"ygtstyle":"ygt1","g_fish_preset":"ygt1","g_fill":"#6EACEB","g_spine_color":"#6EACEB","g_fin_color":"#6EACEB","g_fin_bg_color":"#6EACEB","g_bg_color":"#6EACEB","g_text_color":"#6EACEB","g_bg_color_important":"#FF5733","g_text_color_important":"#6EACEB","g_arrow_size":"5","g_middle_line_width":"3","g_stroke_width":"1","g_font_size":"16px","g_fin_color_1":"#6EACEB","g_stroke_width_1":"2","g_arrow_size_1":"8","g_text_color_1":"#fff","g_font_size_1":"18px","g_fin_color_2":"#6EACEB","g_stroke_width_2":"1","g_arrow_size_2":"5","g_text_color_2":"#6EACEB","g_font_size_2":"14px","g_fin_color_3":"#6EACEB","g_stroke_width_3":"0.8","g_arrow_size_3":"3","g_text_color_3":"#6EACEB","g_font_size_3":"12px","fish_head_w":80,"fish_head_h":106,"fish_tail_w":53,"fish_tail_h":106}];
        var ygt2 =   [{"ygtstyle":"ygt2","g_fish_preset":"ygt2","g_fill":"#007ADD","g_spine_color":"#007ADD","g_fin_color":"#007ADD","g_fin_bg_color":"#007ADD","g_bg_color":"#007ADD","g_text_color":"#007ADD","g_bg_color_important":"#FF5733","g_text_color_important":"#007ADD","g_arrow_size":"5","g_middle_line_width":"3","g_stroke_width":"1","g_font_size":"16px","g_fin_color_1":"#007ADD","g_stroke_width_1":"2","g_arrow_size_1":"8","g_text_color_1":"#fff","g_font_size_1":"18px","g_fin_color_2":"#007ADD","g_stroke_width_2":"1","g_arrow_size_2":"5","g_text_color_2":"#007ADD","g_font_size_2":"14px","g_fin_color_3":"#007ADD","g_stroke_width_3":"0.8","g_arrow_size_3":"3","g_text_color_3":"#007ADD","g_font_size_3":"12px","fish_head_w":120,"fish_head_h":160,"fish_tail_w":110,"fish_tail_h":220}];
        var ygt3 =   [{"ygtstyle":"ygt3","g_fish_preset":"ygt3","g_fill":"#305496","g_spine_color":"#305496","g_fin_color":"#305496","g_fin_bg_color":"#305496","g_bg_color":"#305496","g_text_color":"#305496","g_bg_color_important":"#FF5733","g_text_color_important":"#305496","g_arrow_size":"5","g_middle_line_width":"3","g_stroke_width":"1","g_font_size":"16px","g_fin_color_1":"#305496","g_stroke_width_1":"2","g_arrow_size_1":"8","g_text_color_1":"#fff","g_font_size_1":"18px","g_fin_color_2":"#305496","g_stroke_width_2":"1","g_arrow_size_2":"5","g_text_color_2":"#305496","g_font_size_2":"14px","g_fin_color_3":"#305496","g_stroke_width_3":"0.8","g_arrow_size_3":"3","g_text_color_3":"#305496","g_font_size_3":"12px","fish_head_w":137,"fish_head_h":106,"fish_tail_w":59,"fish_tail_h":106}];
        var ygt4 =   [{"ygtstyle":"ygt4","g_fish_preset":"ygt4","g_fill":"#6EACEB","g_spine_color":"#6EACEB","g_fin_color":"#6EACEB","g_fin_bg_color":"#6EACEB","g_bg_color":"#6EACEB","g_text_color":"#6EACEB","g_bg_color_important":"#FF5733","g_text_color_important":"#6EACEB","g_arrow_size":"10","g_middle_line_width":"18","g_stroke_width":"2","g_font_size":"16px","g_fin_color_1":"#6EACEB","g_stroke_width_1":"2","g_arrow_size_1":"8","g_text_color_1":"#fff","g_font_size_1":"18px","g_fin_color_2":"#6EACEB","g_stroke_width_2":"1","g_arrow_size_2":"5","g_text_color_2":"#6EACEB","g_font_size_2":"14px","g_fin_color_3":"#6EACEB","g_stroke_width_3":"0.8","g_arrow_size_3":"3","g_text_color_3":"#6EACEB","g_font_size_3":"12px","fish_head_w":109,"fish_head_h":104,"fish_tail_w":65,"fish_tail_h":106}];
        var ygt5 =   [{"ygtstyle":"ygt5","g_fish_preset":"ygt5","g_fill":"#FF6600","g_spine_color":"#FF6600","g_fin_color":"#FF6600","g_fin_bg_color":"#FF6600","g_bg_color":"#FF6600","g_text_color":"#FF6600","g_bg_color_important":"#FF5733","g_text_color_important":"#FF6600","g_arrow_size":"5","g_middle_line_width":"3","g_stroke_width":"1","g_font_size":"16px","g_fin_color_1":"#FF6600","g_stroke_width_1":"2","g_arrow_size_1":"8","g_text_color_1":"#fff","g_font_size_1":"18px","g_fin_color_2":"#FF6600","g_stroke_width_2":"1","g_arrow_size_2":"5","g_text_color_2":"#FF6600","g_font_size_2":"14px","g_fin_color_3":"#FF6600","g_stroke_width_3":"0.8","g_arrow_size_3":"3","g_text_color_3":"#FF6600","g_font_size_3":"12px","fish_head_w":103,"fish_head_h":106,"fish_tail_w":124,"fish_tail_h":106}];
        var ygt6 =   [{"ygtstyle":"ygt6","g_fish_preset":"ygt6","g_fill":"#FF9900","g_spine_color":"#FF9900","g_fin_color":"#FF9900","g_fin_bg_color":"#FF9900","g_bg_color":"#FF9900","g_text_color":"#FF9900","g_bg_color_important":"#FF5733","g_text_color_important":"#333333","g_arrow_size":5,"g_middle_line_width":10,"g_stroke_width":"2","g_font_size":"16px","g_fin_color_1":"#FF9900","g_stroke_width_1":"3","g_arrow_size_1":10,"g_text_color_1":"#fff","g_font_size_1":"18px","g_font_weight_1":700,"g_fin_color_2":"#FF9900","g_stroke_width_2":"2","g_arrow_size_2":6,"g_text_color_2":"#333333","g_font_size_2":"14px","g_font_weight_2":700,"g_fin_color_3":"#FF9900","g_stroke_width_3":"1","g_arrow_size_3":4,"g_text_color_3":"#333333","g_font_size_3":"12px","g_font_weight_3":400,"fish_head_w":137,"fish_head_h":106,"fish_tail_w":59,"fish_tail_h":106}]
        var ygt7 =   [{
    "ygtstyle": "ygt7",
    "g_fish_preset": "",
    "g_fill": "#007ADD",
    "g_spine_color": "#007ADD",
    "g_title_color": "",
    "g_fin_color": "#FF9900",
    "g_fin_bg_color": "#FF9900",
    "g_bg_color": "#007ADD",
    "g_text_color": "#007ADD",
    "g_bg_color_important": "#FF5733",
    "g_text_color_important": "#333333",
    "g_arrow_size": 5,
    "g_middle_line_width": 10,
    "g_stroke_width": "2",
    "g_font_size": "16px",
    "g_fin_color_1": "#FF9900",
    "g_stroke_width_1": "5.5",
    "g_arrow_size_1": 15,
    "g_text_color_1": "#ffffff",
    "g_font_size_1": "22px",
    "g_font_weight_1": 700,
    "g_text_line_spacing_ratio_1": 0,
    "g_fin_color_2": "#FF9900",
    "g_stroke_width_2": "4.8",
    "g_arrow_size_2": 12,
    "g_text_color_2": "#000000",
    "g_font_size_2": "20px",
    "g_font_weight_2": 700,
    "g_text_line_spacing_ratio_2": 0,
    "g_fin_color_3": "#FF9900",
    "g_stroke_width_3": "4.8",
    "g_arrow_size_3": 12,
    "g_text_color_3": "#000000",
    "g_font_size_3": "18px",
    "g_font_weight_3": 400,
    "g_text_line_spacing_ratio_3": 0,
    "fish_head_w": 120,
    "fish_head_h": 160,
    "fish_tail_w": 110,
    "fish_tail_h": 220
}];


        var g_title_color = ""; // 鱼骨图名称颜色，为空则跟随鱼头颜色 g_fill
        var g_font_size="16px";
        if (ygtstyle=="ygt1")
        {  
            var _p = ygt1[0]; // 从 ygt1 预设定义读取
            g_stroke_width = _p.g_stroke_width || "2";
            g_stroke = _p.g_fill || "#6EACEB";
            g_fill = _p.g_fill || "#6EACEB";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || "#333333";   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 3;

            startwidth=180;
            if (leaftype=="toleft")
            { 
                g_fish_head="M72.27,52.36c-1.27,21.43 1.51,53.64 1.51,53.64c0,0 -20.82,-5.13 -35.42,-13.04c-5.42,-2.93 -11.72,-6.85 -16.31,-10.9c-7.79,-6.86 -12.45,-13.25 -12.45,-13.25l30.05,-7.48c0,0 -18.48,3.26 -30.05,0c-11.57,-3.25 -9.45,-5.77 -9.45,-5.77c0,0 3.18,-10.74 12.02,-21.15c5.53,-6.5 15.24,-12.44 21.68,-16.89c16.75,-11.55 46.15,-17.52 46.15,-17.52c0,0 -3.61,11.28 -5.8,25.43c-1.33,8.66 -1.45,18.8 -1.93,26.93zM42.22,21.8c-6.87,0 -12.45,5.55 -12.45,12.39c0,6.85 5.58,12.4 12.45,12.4c6.88,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.57,-12.39 -12.45,-12.39z";
                g_fish_tail="M51.45 79.12C50.72 75.4 49.06 70.43 46.7 66.7C44.2 62.74 40.63 59.88 38.72 57.17C36.91 54.61 36.85 52.57 36.85 52.57C36.85 52.57 37.27 50.59 39.23 48.49C41.12 46.46 44.45 44.06 46.87 40.83C48.9 38.14 50.1 34.81 51.11 31.31C54.6 19.28 51.11 0 51.11 0L0 53.6L48.06 106C48.06 106 53.69 90.51 51.45 79.12Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z";
                g_fish_tail="M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z";
            }
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 80;
            fish_head_h = _p.fish_head_h || 106;
            fish_tail_w = _p.fish_tail_w || 53;
            fish_tail_h = _p.fish_tail_h || 106; 
        } 
        else if (ygtstyle=="ygt2")
        {  
            var _p = ygt2[0]; // 从 ygt2 预设定义读取
            g_stroke_width = _p.g_stroke_width || "2";
            g_stroke = _p.g_fill || "#007ADD";
            g_fill = _p.g_fill || "#007ADD";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || "#333333";   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 3;

            startwidth=180;
            if (leaftype=="toleft")
            {

                g_fish_head="M111.31 38.39C114.59 17.02 120 0 120 0C120 0 75.9 9.01 50.78 26.45C41.12 33.16 26.55 42.12 18.26 51.94C4.99 67.65 0.23 83.87 0.23 83.87C0.23 83.87 -2.96 87.67 14.4 92.58C31.75 97.49 59.47 92.58 59.47 92.58L14.4 103.87C14.4 103.87 21.38 113.52 33.07 123.87C39.97 129.98 49.41 135.9 57.54 140.32C79.43 152.26 110.66 160 110.66 160C110.66 160 106.5 111.37 108.41 79.03C109.13 66.75 109.3 51.46 111.31 38.39ZM44.66 51.61C44.66 41.28 53.02 32.9 63.33 32.9C73.65 32.9 82.01 41.28 82.01 51.61C82.01 61.95 73.65 70.32 63.33 70.32C53.02 70.32 44.66 61.95 44.66 51.61Z";
                g_fish_tail="M107.48,164.94C105.95,157.19 102.47,146.83 97.54,139.05C92.32,130.79 84.88,124.83 80.87,119.18C77.09,113.85 76.97,109.6 76.97,109.6C76.97,109.6 77.85,105.47 81.94,101.09C85.88,96.86 92.84,91.84 97.9,85.13C102.13,79.51 104.65,72.57 106.77,65.27C114.04,40.19 106.77,0 106.77,0L0,111.73L100.38,220.98C100.38,220.98 112.16,188.68 107.48,164.94Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z";
                g_fish_tail="M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z";
            
            }
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 120;
            fish_head_h = _p.fish_head_h || 160;
            fish_tail_w = _p.fish_tail_w || 110;
            fish_tail_h = _p.fish_tail_h || 220; 
        } 
        else if (ygtstyle=="ygt7")
        {  
            var _p = ygt7[0]; // 从 ygt7 预设定义中读取，修改预设 JSON 即自动同步
            g_stroke_width =  _p.g_stroke_width || "2";
            g_stroke = _p.g_fill || "#007ADD";
            g_fill =  _p.g_fill || "#007ADD";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || "#333333";   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 10;

            g_arrow_size = _p.g_arrow_size || 10;
            startwidth=180;
            if (leaftype=="toleft")
            {
                g_fish_head="M111.31 38.39C114.59 17.02 120 0 120 0C120 0 75.9 9.01 50.78 26.45C41.12 33.16 26.55 42.12 18.26 51.94C4.99 67.65 0.23 83.87 0.23 83.87C0.23 83.87 -2.96 87.67 14.4 92.58C31.75 97.49 59.47 92.58 59.47 92.58L14.4 103.87C14.4 103.87 21.38 113.52 33.07 123.87C39.97 129.98 49.41 135.9 57.54 140.32C79.43 152.26 110.66 160 110.66 160C110.66 160 106.5 111.37 108.41 79.03C109.13 66.75 109.3 51.46 111.31 38.39ZM44.66 51.61C44.66 41.28 53.02 32.9 63.33 32.9C73.65 32.9 82.01 41.28 82.01 51.61C82.01 61.95 73.65 70.32 63.33 70.32C53.02 70.32 44.66 61.95 44.66 51.61Z";
                g_fish_tail="M107.48,164.94C105.95,157.19 102.47,146.83 97.54,139.05C92.32,130.79 84.88,124.83 80.87,119.18C77.09,113.85 76.97,109.6 76.97,109.6C76.97,109.6 77.85,105.47 81.94,101.09C85.88,96.86 92.84,91.84 97.9,85.13C102.13,79.51 104.65,72.57 106.77,65.27C114.04,40.19 106.77,0 106.77,0L0,111.73L100.38,220.98C100.38,220.98 112.16,188.68 107.48,164.94Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z";
                g_fish_tail="M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z";
            }
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            // 鱼刺样式也从预设读取
            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; 
            g_stroke_width_1 = _p.g_stroke_width_1 || "3"; 
            g_arrow_size_1 = _p.g_arrow_size_1 || 10; 
            g_text_color_1 = _p.g_text_color_1 || "#fff"; 
            g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700;
            g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            // 二级鱼刺
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; 
            g_stroke_width_2 = _p.g_stroke_width_2 || "2"; 
            g_arrow_size_2 = _p.g_arrow_size_2 || 6; 
            g_text_color_2 = _p.g_text_color_2 || "#333333"; 
            g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700;
            g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            // 三级鱼刺
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; 
            g_stroke_width_3 = _p.g_stroke_width_3 || "1"; 
            g_arrow_size_3 = _p.g_arrow_size_3 || 4; 
            g_text_color_3 = _p.g_text_color_3 || "#333333"; 
            g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400;
            g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 120;
            fish_head_h = _p.fish_head_h || 160;
            fish_tail_w = _p.fish_tail_w || 110;
            fish_tail_h = _p.fish_tail_h || 220; 
             
            start_middle = g_middle_line_width/2; //鱼干设置粗后，鱼翅节点位移量

            
        } 
        else if (ygtstyle=="ygt3")
        {  
            var _p = ygt3[0];
            g_stroke_width = _p.g_stroke_width || "1";
            g_stroke = _p.g_fill || "#305496";
            g_fill = _p.g_fill || "#305496";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || _p.g_fill;   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 3;


            startwidth=180;
            if (leaftype=="toleft")
            {

                g_fish_head="M123.67,12.56c2.26,9.22 5.28,14.86 7.61,22.49c3.77,12.38 6.13,23.45 6.13,23.45c0,0 1.19,15.97 -2.08,25.8c-3.26,9.83 -13.62,21.7 -13.62,21.7c0,0 -11.64,-8.9 -27.8799,-14.53c-16.24,-5.62 -50.25,-12.17 -50.25,-12.17c0,0 -15.94,-3.97 -25.17,-9.48c-9.24,-5.52 -18.41001,-16.03 -18.41001,-16.03c0,0 11.02001,-12.74 26.45001,-24.1c9.61,-7.09 21.63,-12.81 31.66,-17.13c26.1,-11.24 63.5999,-12.56 63.5999,-12.56c0,0 -0.3,3.34 1.96,12.56zM103.646,30.2326c0,-4.7701 -3.8701,-8.6401 -8.6401,-8.6401c-4.77,0 -8.6301,3.87 -8.6301,8.6401c0,4.77 3.8601,8.63 8.6301,8.63c4.77,0 8.6401,-3.86 8.6401,-8.63z";
                g_fish_tail="M25.9198 50.54L27.8898 106L-0.000175476 45.29L59.0698 0L25.9198 50.54Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M16.89,0c0,0 37.5,1.32 63.6,12.56c10.03,4.32 22.05,10.04 31.66,17.13c15.43,11.36 26.45,24.1 26.45,24.1c0,0 -9.17,10.51 -18.41,16.03c-9.23,5.51 -25.17,9.48 -25.17,9.48c0,0 -34.01,6.55 -50.25,12.17c-16.24,5.63 -27.88,14.53 -27.88,14.53c0,0 -10.36,-11.87 -13.62,-21.7c-3.27,-9.83 -2.08,-25.8 -2.08,-25.8c0,0 2.36,-11.07 6.13,-23.45c2.33,-7.63 5.35,-13.27 7.61,-22.49c2.26,-9.22 1.96,-12.56 1.96,-12.56zM43.5942,38.8626c4.77,0 8.6301,-3.86 8.6301,-8.63c0,-4.7701 -3.8601,-8.6401 -8.6301,-8.6401c-4.77,0 -8.6401,3.87 -8.6401,8.6401c0,4.77 3.8701,8.63 8.6401,8.63z";
                g_fish_tail="M33.15 50.54L31.18 106L59.07 45.29L0 0L33.15 50.54Z";
               
            }
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 137;
            fish_head_h = _p.fish_head_h || 106;
            fish_tail_w = _p.fish_tail_w || 59;
            fish_tail_h = _p.fish_tail_h || 106; 
        } 
        else if (ygtstyle=="ygt4")
        {  
            var _p = ygt4[0];
            g_stroke_width = _p.g_stroke_width || "2";
            g_stroke = _p.g_fill || "#6EACEB";
            g_fill = _p.g_fill || "#6EACEB";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || _p.g_fill;   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_arrow_size = _p.g_arrow_size || 10;
            g_middle_line_width = _p.g_middle_line_width || 18;

            startwidth=180;
            if (leaftype=="toleft")
            {

                g_fish_head="M94.6701,51.2193c-2.43,21.1 4.33,53.0297 4.33,53.0297c0,0 -29.3099,-4.3897 -47.1499,-13.3497c-6.67,-3.36 -14.4,-6.3101 -20.43,-11.01c-10.08,-7.86 -16.89,-17.28 -16.89,-17.28c0,0 10.36,-1.61 16.89,-3.93c6.54,-2.32 15.33,-7.46 15.33,-7.46c0,0 -21.22,-1.18 -32.22,-5.11c-11.00013,-3.93 -14.53013,-4.71 -14.53013,-4.71c0,0 8.98,-14.01 22.78013,-23.18c13.81,-9.17002 38.5,-15.32002 38.5,-15.32002c0,0 21.1799,-4.64 34.9799,-2.18c13.8099,2.47 12.9499,5.71 12.9499,5.71c0,0 -12.0999,23.69002 -14.5399,44.79002zM78.1737,25.2871c0,-4.77 -3.87,-8.64 -8.64,-8.64c-4.7799,0 -8.6499,3.87 -8.6499,8.64c0,4.78 3.87,8.65 8.6499,8.65c4.77,0 8.64,-3.87 8.64,-8.65z";
                g_fish_tail="M10.2299 36.3188C17.4099 31.0988 29.8599 15.7388 29.8599 15.7388C29.8599 15.7388 37.8599 5.87878 46.1499 2.50878C54.4399 -0.861221 65.1499 0.138779 65.1499 0.138779C65.1499 0.138779 53.5799 8.46878 46.1499 21.1688C41.7199 28.7488 40.3699 38.3088 39.3999 47.3788C36.8099 71.6888 56.6699 105.999 56.6699 105.999C56.6699 105.999 43.7699 99.2588 36.3899 93.0988C29.0099 86.9388 20.6999 76.1388 20.6999 76.1388C20.6999 76.1388 11.1999 62.2288 6.7899 59.1788C2.3799 56.1188 -9.91821e-05 56.1188 -9.91821e-05 56.1188L-9.91821e-05 41.5288C-9.91821e-05 41.5288 3.0599 41.5288 10.2299 36.3188Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M0.86,8.17c0,0 -0.86,-3.24 12.95,-5.71c13.8,-2.46 34.9799,2.18 34.9799,2.18c0,0 24.69,6.15 38.5,15.32c13.8001,9.17 22.7801,23.18 22.7801,23.18c0,0 -3.53,0.78 -14.5301,4.71c-11,3.93 -32.22,5.11 -32.22,5.11c0,0 8.79,5.14 15.33,7.46c6.53,2.32 16.89,3.93 16.89,3.93c0,0 -6.81,9.42 -16.89,17.28c-6.03,4.6999 -13.76,7.65 -20.43,11.01c-17.84,8.96 -47.1499,13.35 -47.1499,13.35c0,0 6.76,-31.93 4.33,-53.03c-2.44,-21.1 -14.54,-44.79 -14.54,-44.79zM40.5364,35.6778c4.7799,0 8.6499,-3.87 8.6499,-8.65c0,-4.77 -3.87,-8.64 -8.6499,-8.64c-4.77,0 -8.64,3.87 -8.64,8.64c0,4.78 3.87,8.65 8.64,8.65z";
                g_fish_tail="M54.92 36.32C47.74 31.1 35.29 15.74 35.29 15.74C35.29 15.74 27.29 5.88 19 2.51C10.71 -0.86 0 0.14 0 0.14C0 0.14 11.57 8.47 19 21.17C23.43 28.75 24.78 38.31 25.75 47.38C28.34 71.69 8.48 106 8.48 106C8.48 106 21.38 99.26 28.76 93.1C36.14 86.94 44.45 76.14 44.45 76.14C44.45 76.14 53.95 62.23 58.36 59.18C62.77 56.12 65.15 56.12 65.15 56.12L65.15 41.53C65.15 41.53 62.09 41.53 54.92 36.32Z";
            }
           
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 109;
            fish_head_h = _p.fish_head_h || 104;
            fish_tail_w = _p.fish_tail_w || 65;
            fish_tail_h = _p.fish_tail_h || 106; 
            
              
            g_stroke_width =  "2"; //鱼翅线的粗细
            g_middle_line_width=18;//鱼干的粗细
            start_middle = g_middle_line_width/2; //鱼干设置粗后，鱼翅节点位移量 
        } 
        else if (ygtstyle=="ygt5")
        {  
            var _p = ygt5[0];
            g_stroke_width = _p.g_stroke_width || "1";
            g_stroke = _p.g_fill || "#FF6600";
            g_fill = _p.g_fill || "#FF6600";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || _p.g_fill;   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 3;


            startwidth=180;
            if (leaftype=="toleft")
            {

                g_fish_head="M87.9998,52.6599c1.13,21.44 11.94,35.38 11.94,35.38c0,0 2.8502,5.45 2.7902,9.36c-0.07,3.9001 -2.7902,8.3301 -2.7902,8.3301c0,0 -26.1001,0.27 -43.2001,-2.88c-13.74,-2.53 -32.21,-9.2301 -38.9501,-11.7601c-1.6199,-0.53 -2.6,-0.99 -2.6,-0.99c0,0 0.9401,0.37 2.6,0.99c2.7901,0.91 7.4801,1.98 12.2101,1.06c7.45,-1.45 16.45,-9.46 16.45,-9.46c0,0 -6.68,4.89 -16.45,5.35c-9.77,0.46 -23.8601,-5.35 -23.8601,-5.35c0,0 -5.06981,-4.25 -5.9898,-9.29c-0.92,-5.03 2.69979,-12.51 2.69979,-12.51c0,0 5.76001,-17.6899 24.27011,-32.4999c18.51,-14.81 72.8201,-28.39 72.8201,-28.39c0,0 -13.06,31.21 -11.94,52.6599zM53.0364,49.7752c0,-5.45 -4.4199,-9.8699 -9.8699,-9.8699c-5.46,0 -9.8799,4.4199 -9.8799,9.8699c0,5.46 4.4199,9.88 9.8799,9.88c5.45,0 9.8699,-4.42 9.8699,-9.88z";
                g_fish_tail="M100.85 0.84C103.35 2.72 102.81 7.69 102.81 7.69C102.81 7.69 98.7304 18.35 94.9804 30.67C92.8104 37.83 89.2404 44.56 90.5804 52.69C92.0104 61.34 98.3204 69.79 104.01 77.54C112.85 89.58 121.88 99.15 121.88 99.15C121.88 99.15 123.86 100.61 123.92 102.3C123.98 103.99 121.88 106 121.88 106C121.88 106 83.9304 98.32 59.9004 89.25C35.8704 80.19 4.49041 61.98 4.49041 61.98C4.49041 61.98 0.0604095 58.44 0.000411987 54.91C-0.0595932 51.38 4.49041 47.3 4.49041 47.3C4.49041 47.3 29.0404 27.56 47.5404 17.96C66.0304 8.35 93.0204 0.84 93.0204 0.84C93.0204 0.84 98.3504 -1.05 100.85 0.84Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M2.85001,0c0,0 54.31009,13.58 72.82009,28.39c18.5101,14.81 24.2701,32.4999 24.2701,32.4999c0,0 3.6198,7.48 2.6998,12.51c-0.92,5.04 -5.9898,9.29 -5.9898,9.29c0,0 -14.0901,5.81 -23.8601,5.35c-9.77,-0.46 -16.45,-5.35 -16.45,-5.35c0,0 9,8.01 16.45,9.46c4.73,0.92 9.42,-0.15 12.2101,-1.06c1.6599,-0.62 2.6,-0.99 2.6,-0.99c0,0 -0.9801,0.46 -2.6,0.99c-6.7401,2.53 -25.2101,9.2301 -38.9501,11.7601c-17.1,3.15 -43.20009,2.88 -43.20009,2.88c0,0 -2.72001,-4.43 -2.79001,-8.3301c-0.06,-3.91 2.79001,-9.36 2.79001,-9.36c0,0 10.80999,-13.94 11.93999,-35.38c1.12,-21.4499 -11.93999,-52.6599 -11.93999,-52.6599zM59.6233,59.6552c5.46,0 9.8799,-4.42 9.8799,-9.88c0,-5.45 -4.4199,-9.8699 -9.8799,-9.8699c-5.45,0 -9.8699,4.4199 -9.8699,9.8699c0,5.46 4.4199,9.88 9.8699,9.88z";
                g_fish_tail="M23.07 0.84C20.57 2.72 21.11 7.69 21.11 7.69C21.11 7.69 25.19 18.35 28.94 30.67C31.11 37.83 34.68 44.56 33.34 52.69C31.91 61.34 25.6 69.79 19.91 77.54C11.07 89.58 2.04 99.15 2.04 99.15C2.04 99.15 0.06 100.61 0 102.3C-0.06 103.99 2.04 106 2.04 106C2.04 106 39.99 98.32 64.02 89.25C88.05 80.19 119.43 61.98 119.43 61.98C119.43 61.98 123.86 58.44 123.92 54.91C123.98 51.38 119.43 47.3 119.43 47.3C119.43 47.3 94.88 27.56 76.38 17.96C57.89 8.35 30.9 0.84 30.9 0.84C30.9 0.84 25.57 -1.05 23.07 0.84Z";
            }
           
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 80;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 103;
            fish_head_h = _p.fish_head_h || 106;
            fish_tail_w = _p.fish_tail_w || 124;
            fish_tail_h = _p.fish_tail_h || 106; 
        } 
        else if (ygtstyle=="ygt6")
        {  
            var _p = ygt6[0];
            g_stroke_width = _p.g_stroke_width || "2";
            g_stroke = _p.g_fill || "#FF9900";
            g_fill = _p.g_fill || "#FF9900";
            g_bg_color = _p.g_bg_color || _p.g_fill;  
            g_text_color = _p.g_text_color || _p.g_fill;   
      
            g_bg_color_important = _p.g_bg_color_important || "#FF5733";  
            g_stroker_important = _p.g_bg_color_important || "#FF5733";
            g_spine_color = _p.g_spine_color || _p.g_fill;
            g_fin_color = _p.g_fin_color || _p.g_fill;
            g_text_color_important = _p.g_text_color_important || "#333333";   
            g_fin_bg_color = _p.g_fin_bg_color || _p.g_fill;
            g_middle_line_width = _p.g_middle_line_width || 3;


            startwidth=180;
            // 图片提供的鱼头 SVG 路径 (含鱼眼和鱼身轮廓, x0.26缩放)
            g_fish_head="M22 50C213.16 82.3999 325.48 221.719 322.24 262.76C319.826 293.346 223.601 289.04 177.521 283.28L287.68 310.28C227.152 390.152 88.6314 447.112 43.5996 447.44C43.5996 447.44 52.2402 363.2 52.2402 248.72C52.2402 134.24 22 50 22 50ZM161.247 144.717C139.774 144.717 122.367 162.124 122.367 183.597C122.367 205.069 139.774 222.476 161.247 222.477C182.72 222.477 200.127 205.07 200.127 183.597C200.127 162.124 182.72 144.717 161.247 144.717Z";
            // 图片提供的V形鱼尾 (含中心凹槽细节, x0.26缩放)
            g_fish_tail="M48.3037 127.414L268.304 353.414L48.3037 579.414C48.3037 579.414 33.2697 509.672 42.3037 466.414C48.5785 436.368 81.8367 393.546 101.567 370.19C109.695 360.569 109.695 346.26 101.567 336.638C81.8367 313.283 48.5785 270.46 42.3037 240.414C33.2697 197.156 48.3037 127.414 48.3037 127.414Z";
             
            // ygt6 自定义鱼头/鱼尾路径(仅toleft)
             
           if (leaftype=="toleft")
            { 
                g_fish_head="M72.27,52.36c-1.27,21.43 1.51,53.64 1.51,53.64c0,0 -20.82,-5.13 -35.42,-13.04c-5.42,-2.93 -11.72,-6.85 -16.31,-10.9c-7.79,-6.86 -12.45,-13.25 -12.45,-13.25l30.05,-7.48c0,0 -18.48,3.26 -30.05,0c-11.57,-3.25 -9.45,-5.77 -9.45,-5.77c0,0 3.18,-10.74 12.02,-21.15c5.53,-6.5 15.24,-12.44 21.68,-16.89c16.75,-11.55 46.15,-17.52 46.15,-17.52c0,0 -3.61,11.28 -5.8,25.43c-1.33,8.66 -1.45,18.8 -1.93,26.93zM42.22,21.8c-6.87,0 -12.45,5.55 -12.45,12.39c0,6.85 5.58,12.4 12.45,12.4c6.88,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.57,-12.39 -12.45,-12.39z";
                g_fish_tail="M51.45 79.12C50.72 75.4 49.06 70.43 46.7 66.7C44.2 62.74 40.63 59.88 38.72 57.17C36.91 54.61 36.85 52.57 36.85 52.57C36.85 52.57 37.27 50.59 39.23 48.49C41.12 46.46 44.45 44.06 46.87 40.83C48.9 38.14 50.1 34.81 51.11 31.31C54.6 19.28 51.11 0 51.11 0L0 53.6L48.06 106C48.06 106 53.69 90.51 51.45 79.12Z";
                startwidth_head_toleft = 50;
            }
            else{
                g_fish_head="M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z";
                g_fish_tail="M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z";
            
                g_fish_head_6 = "M0 2C218 2 380 217.001 380 248C380 278.998 241 494 0 494";
                g_fish_tail_6 = "M1.41406 1.41406L229.414 229.414L369.414 154.414M1.41406 701.414L229.414 473.414L369.414 548.414";
            }
            startwidth_pyl = 60;
            g_height = 150;
            startwidth_head = 100;
            g_max_top = 50;

            g_fin_color_1 = _p.g_fin_color_1 || _p.g_fin_color || g_fin_color; g_stroke_width_1 = _p.g_stroke_width_1 || "3"; g_arrow_size_1 = _p.g_arrow_size_1 || 10; g_text_color_1 = _p.g_text_color_1 || "#fff"; g_font_size_1 = _p.g_font_size_1 || "18px";
            g_font_weight_1 = _p.g_font_weight_1 || 700; g_text_line_spacing_ratio_1 = _p.g_text_line_spacing_ratio_1 !== undefined ? _p.g_text_line_spacing_ratio_1 : 0;
            g_fin_color_2 = _p.g_fin_color_2 || _p.g_fin_color || g_fin_color; g_stroke_width_2 = _p.g_stroke_width_2 || "2"; g_arrow_size_2 = _p.g_arrow_size_2 || 6; g_text_color_2 = _p.g_text_color_2 || "#333333"; g_font_size_2 = _p.g_font_size_2 || "14px";
            g_font_weight_2 = _p.g_font_weight_2 || 700; g_text_line_spacing_ratio_2 = _p.g_text_line_spacing_ratio_2 !== undefined ? _p.g_text_line_spacing_ratio_2 : 0.4;
            g_fin_color_3 = _p.g_fin_color_3 || _p.g_fin_color || g_fin_color; g_stroke_width_3 = _p.g_stroke_width_3 || "1"; g_arrow_size_3 = _p.g_arrow_size_3 || 4; g_text_color_3 = _p.g_text_color_3 || "#333333"; g_font_size_3 = _p.g_font_size_3 || "12px";
            g_font_weight_3 = _p.g_font_weight_3 || 400; g_text_line_spacing_ratio_3 = _p.g_text_line_spacing_ratio_3 !== undefined ? _p.g_text_line_spacing_ratio_3 : 0.4;

            fish_head_w = _p.fish_head_w || 137;
            fish_head_h = _p.fish_head_h || 106;
            fish_tail_w = _p.fish_tail_w || 59;
            fish_tail_h = _p.fish_tail_h || 106; 
        } 
        else{
            startwidth_head= 200;
            startwidth = 120;
            g_max_top = 50;
            g_height=50; 

        }
 
        if (obj_style_flag) {  
                var item = obj_style;
                if (item["g_stroke_width"]!=undefined)
                {
                    g_stroke_width = item["g_stroke_width"]; 
                } 
                if (item["g_spine_color"]!=undefined && item["g_spine_color"]!="")
                {
                    g_spine_color = item["g_spine_color"]; 
                }
                if (item["g_fin_color"]!=undefined && item["g_fin_color"]!="")
                {
                    g_fin_color = item["g_fin_color"]; 
                }
                if (item["g_fin_bg_color"]!=undefined && item["g_fin_bg_color"]!="")
                {
                    g_fin_bg_color = item["g_fin_bg_color"]; 
                } 
                if (item["g_fill"]!=undefined)
                {
                    g_fill = item["g_fill"]; 
                    g_stroke = g_fill;
                }
                if (item["g_bg_color"]!=undefined)
                {
                    g_bg_color = item["g_bg_color"]; 
                }
                if (item["g_text_color"]!=undefined)
                {
                    g_text_color = item["g_text_color"]; 
                }
                if (item["g_title_color"]!=undefined)
                {
                    g_title_color = item["g_title_color"]; 
                }
                if (item["g_bg_color_important"]!=undefined)
                {
                    g_bg_color_important = item["g_bg_color_important"]; 
                    g_stroker_important = g_text_color_important;
                }
                if (item["g_text_color_important"]!=undefined)
                {
                    g_text_color_important = item["g_text_color_important"]; 
                  
                }
                
                if (item["g_stroke_width"]!=undefined)
                {
                    g_stroke_width = item["g_stroke_width"]; 
                } 
                if (item["g_spine_color"]!=undefined && item["g_spine_color"]!="")
                {
                    g_spine_color = item["g_spine_color"]; 
                }
                if (item["g_fin_color"]!=undefined && item["g_fin_color"]!="")
                {
                    g_fin_color = item["g_fin_color"]; 
                }
                if (item["g_fin_bg_color"]!=undefined && item["g_fin_bg_color"]!="")
                {
                    g_fin_bg_color = item["g_fin_bg_color"]; 
                }
                if (item["g_middle_line_width"]!=undefined)
                {
                    g_middle_line_width = item["g_middle_line_width"]; 
                    start_middle = parseFloat(g_middle_line_width)/2 ; 
                }
               
                if (item["g_arrow_size"]!=undefined)
                {
                    g_arrow_size = item["g_arrow_size"]; 
                } 
                if (item["g_font_size"]!=undefined)
                {
                    g_font_size = item["g_font_size"]; 
                } 
                if (item["g_cqi_flag"]!=undefined)
                {
                    g_cqi_flag = item["g_cqi_flag"]; 
                } 
                if (item["g_fish_preset"]!=undefined) { g_fish_preset = item["g_fish_preset"]; } 
                if (item["g_group_spacing"]!=undefined) { g_group_spacing = parseInt(item["g_group_spacing"])||30; }
                // 一级鱼刺属性
                if (item["g_fin_color_1"]!=undefined && item["g_fin_color_1"]!="") g_fin_color_1 = item["g_fin_color_1"];
                if (item["g_stroke_width_1"]!=undefined && item["g_stroke_width_1"]!="") g_stroke_width_1 = item["g_stroke_width_1"];
                if (item["g_arrow_size_1"]!=undefined) g_arrow_size_1 = item["g_arrow_size_1"];
                if (item["g_text_color_1"]!=undefined && item["g_text_color_1"]!="") g_text_color_1 = item["g_text_color_1"];
                if (item["g_font_size_1"]!=undefined && item["g_font_size_1"]!="") g_font_size_1 = item["g_font_size_1"];
                if (item["g_font_weight_1"]!=undefined && item["g_font_weight_1"]!="") g_font_weight_1 = item["g_font_weight_1"];
                if (item["g_text_line_spacing_ratio_1"]!=undefined) g_text_line_spacing_ratio_1 = parseFloat(item["g_text_line_spacing_ratio_1"]);
                // 二级鱼刺属性
                if (item["g_fin_color_2"]!=undefined && item["g_fin_color_2"]!="") g_fin_color_2 = item["g_fin_color_2"];
                if (item["g_stroke_width_2"]!=undefined && item["g_stroke_width_2"]!="") g_stroke_width_2 = item["g_stroke_width_2"];
                if (item["g_arrow_size_2"]!=undefined) g_arrow_size_2 = item["g_arrow_size_2"];
                if (item["g_text_color_2"]!=undefined && item["g_text_color_2"]!="") g_text_color_2 = item["g_text_color_2"];
                if (item["g_font_size_2"]!=undefined && item["g_font_size_2"]!="") g_font_size_2 = item["g_font_size_2"];
                if (item["g_font_weight_2"]!=undefined && item["g_font_weight_2"]!="") g_font_weight_2 = item["g_font_weight_2"];
                if (item["g_text_line_spacing_ratio_2"]!=undefined) g_text_line_spacing_ratio_2 = parseFloat(item["g_text_line_spacing_ratio_2"]);
                // 三级鱼刺属性
                if (item["g_fin_color_3"]!=undefined && item["g_fin_color_3"]!="") g_fin_color_3 = item["g_fin_color_3"];
                if (item["g_stroke_width_3"]!=undefined && item["g_stroke_width_3"]!="") g_stroke_width_3 = item["g_stroke_width_3"];
                if (item["g_arrow_size_3"]!=undefined) g_arrow_size_3 = item["g_arrow_size_3"];
                if (item["g_text_color_3"]!=undefined && item["g_text_color_3"]!="") g_text_color_3 = item["g_text_color_3"];
                if (item["g_font_size_3"]!=undefined && item["g_font_size_3"]!="") g_font_size_3 = item["g_font_size_3"];
                if (item["g_font_weight_3"]!=undefined && item["g_font_weight_3"]!="") g_font_weight_3 = item["g_font_weight_3"];
                if (item["g_text_line_spacing_ratio_3"]!=undefined) g_text_line_spacing_ratio_3 = parseFloat(item["g_text_line_spacing_ratio_3"]);
                
        }
  


        // ?????????SVG??
        if (typeof g_fish_preset !== "undefined" && g_fish_preset !== "") {
            var fp2 = g_fish_preset;
            if (fp2 === "ygt1") {
                if (leaftype == "toleft") {
                    g_fish_head="M72.27,52.36c-1.27,21.43 1.51,53.64 1.51,53.64c0,0 -20.82,-5.13 -35.42,-13.04c-5.42,-2.93 -11.72,-6.85 -16.31,-10.9c-7.79,-6.86 -12.45,-13.25 -12.45,-13.25l30.05,-7.48c0,0 -18.48,3.26 -30.05,0c-11.57,-3.25 -9.45,-5.77 -9.45,-5.77c0,0 3.18,-10.74 12.02,-21.15c5.53,-6.5 15.24,-12.44 21.68,-16.89c16.75,-11.55 46.15,-17.52 46.15,-17.52c0,0 -3.61,11.28 -5.8,25.43c-1.33,8.66 -1.45,18.8 -1.93,26.93zM42.22,21.8c-6.87,0 -12.45,5.55 -12.45,12.39c0,6.85 5.58,12.4 12.45,12.4c6.88,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.57,-12.39 -12.45,-12.39z";
                    g_fish_tail="M51.45 79.12C50.72 75.4 49.06 70.43 46.7 66.7C44.2 62.74 40.63 59.88 38.72 57.17C36.91 54.61 36.85 52.57 36.85 52.57C36.85 52.57 37.27 50.59 39.23 48.49C41.12 46.46 44.45 44.06 46.87 40.83C48.9 38.14 50.1 34.81 51.11 31.31C54.6 19.28 51.11 0 51.11 0L0 53.6L48.06 106C48.06 106 53.69 90.51 51.45 79.12Z";
                } else {
                    g_fish_head="M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z";
                    g_fish_tail="M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z";
                }
            }
            else if (fp2 === "ygt2") {
                if (leaftype == "toleft") {
                    g_fish_head="M111.31 38.39C114.59 17.02 120 0 120 0C120 0 75.9 9.01 50.78 26.45C41.12 33.16 26.55 42.12 18.26 51.94C4.99 67.65 0.23 83.87 0.23 83.87C0.23 83.87 -2.96 87.67 14.4 92.58C31.75 97.49 59.47 92.58 59.47 92.58L14.4 103.87C14.4 103.87 21.38 113.52 33.07 123.87C39.97 129.98 49.41 135.9 57.54 140.32C79.43 152.26 110.66 160 110.66 160C110.66 160 106.5 111.37 108.41 79.03C109.13 66.75 109.3 51.46 111.31 38.39ZM44.66 51.61C44.66 41.28 53.02 32.9 63.33 32.9C73.65 32.9 82.01 41.28 82.01 51.61C82.01 61.95 73.65 70.32 63.33 70.32C53.02 70.32 44.66 61.95 44.66 51.61Z";
                    g_fish_tail="M107.48,164.94C105.95,157.19 102.47,146.83 97.54,139.05C92.32,130.79 84.88,124.83 80.87,119.18C77.09,113.85 76.97,109.6 76.97,109.6C76.97,109.6 77.85,105.47 81.94,101.09C85.88,96.86 92.84,91.84 97.9,85.13C102.13,79.51 104.65,72.57 106.77,65.27C114.04,40.19 106.77,0 106.77,0L0,111.73L100.38,220.98C100.38,220.98 112.16,188.68 107.48,164.94Z";
                } else {
                    g_fish_head="M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z";
                    g_fish_tail="M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z";
                }
            }
            else if (fp2 === "ygt3") {
                if (leaftype == "toleft") {
                    g_fish_head="M123.67,12.56c2.26,9.22 5.28,14.86 7.61,22.49c3.77,12.38 6.13,23.45 6.13,23.45c0,0 1.19,15.97 -2.08,25.8c-3.26,9.83 -13.62,21.7 -13.62,21.7c0,0 -11.64,-8.9 -27.8799,-14.53c-16.24,-5.62 -50.25,-12.17 -50.25,-12.17c0,0 -15.94,-3.97 -25.17,-9.48c-9.24,-5.52 -18.41001,-16.03 -18.41001,-16.03c0,0 11.02001,-12.74 26.45001,-24.1c9.61,-7.09 21.63,-12.81 31.66,-17.13c26.1,-11.24 63.5999,-12.56 63.5999,-12.56c0,0 -0.3,3.34 1.96,12.56zM103.646,30.2326c0,-4.7701 -3.8701,-8.6401 -8.6401,-8.6401c-4.77,0 -8.6301,3.87 -8.6301,8.6401c0,4.77 3.8601,8.63 8.6301,8.63c4.77,0 8.6401,-3.86 8.6401,-8.63z";
                    g_fish_tail="M25.9198 50.54L27.8898 106L-0.000175476 45.29L59.0698 0L25.9198 50.54Z";
                } else {
                    g_fish_head="M16.89,0c0,0 37.5,1.32 63.6,12.56c10.03,4.32 22.05,10.04 31.66,17.13c15.43,11.36 26.45,24.1 26.45,24.1c0,0 -9.17,10.51 -18.41,16.03c-9.23,5.51 -25.17,9.48 -25.17,9.48c0,0 -34.01,6.55 -50.25,12.17c-16.24,5.63 -27.88,14.53 -27.88,14.53c0,0 -10.36,-11.87 -13.62,-21.7c-3.27,-9.83 -2.08,-25.8 -2.08,-25.8c0,0 2.36,-11.07 6.13,-23.45c2.33,-7.63 5.35,-13.27 7.61,-22.49c2.26,-9.22 1.96,-12.56 1.96,-12.56zM43.5942,38.8626c4.77,0 8.6301,-3.86 8.6301,-8.63c0,-4.7701 -3.8601,-8.6401 -8.6301,-8.6401c-4.77,0 -8.6401,3.87 -8.6401,8.6401c0,4.77 3.8701,8.63 8.6401,8.63z";
                    g_fish_tail="M33.15 50.54L31.18 106L59.07 45.29L0 0L33.15 50.54Z";
                }
            }
            else if (fp2 === "ygt4") {
                if (leaftype == "toleft") {
                    g_fish_head="M94.6701,51.2193c-2.43,21.1 4.33,53.0297 4.33,53.0297c0,0 -29.3099,-4.3897 -47.1499,-13.3497c-6.67,-3.36 -14.4,-6.3101 -20.43,-11.01c-10.08,-7.86 -16.89,-17.28 -16.89,-17.28c0,0 10.36,-1.61 16.89,-3.93c6.54,-2.32 15.33,-7.46 15.33,-7.46c0,0 -21.22,-1.18 -32.22,-5.11c-11.00013,-3.93 -14.53013,-4.71 -14.53013,-4.71c0,0 8.98,-14.01 22.78013,-23.18c13.81,-9.17002 38.5,-15.32002 38.5,-15.32002c0,0 21.1799,-4.64 34.9799,-2.18c13.8099,2.47 12.9499,5.71 12.9499,5.71c0,0 -12.0999,23.69002 -14.5399,44.79002zM78.1737,25.2871c0,-4.77 -3.87,-8.64 -8.64,-8.64c-4.7799,0 -8.6499,3.87 -8.6499,8.64c0,4.78 3.87,8.65 8.6499,8.65c4.77,0 8.64,-3.87 8.64,-8.65z";
                    g_fish_tail="M10.2299 36.3188C17.4099 31.0988 29.8599 15.7388 29.8599 15.7388C29.8599 15.7388 37.8599 5.87878 46.1499 2.50878C54.4399 -0.861221 65.1499 0.138779 65.1499 0.138779C65.1499 0.138779 53.5799 8.46878 46.1499 21.1688C41.7199 28.7488 40.3699 38.3088 39.3999 47.3788C36.8099 71.6888 56.6699 105.999 56.6699 105.999C56.6699 105.999 43.7699 99.2588 36.3899 93.0988C29.0099 86.9388 20.6999 76.1388 20.6999 76.1388C20.6999 76.1388 11.1999 62.2288 6.7899 59.1788C2.3799 56.1188 -9.91821e-05 56.1188 -9.91821e-05 56.1188L-9.91821e-05 41.5288C-9.91821e-05 41.5288 3.0599 41.5288 10.2299 36.3188Z";
                } else {
                    g_fish_head="M0.86,8.17c0,0 -0.86,-3.24 12.95,-5.71c13.8,-2.46 34.9799,2.18 34.9799,2.18c0,0 24.69,6.15 38.5,15.32c13.8001,9.17 22.7801,23.18 22.7801,23.18c0,0 -3.53,0.78 -14.5301,4.71c-11,3.93 -32.22,5.11 -32.22,5.11c0,0 8.79,5.14 15.33,7.46c6.53,2.32 16.89,3.93 16.89,3.93c0,0 -6.81,9.42 -16.89,17.28c-6.03,4.6999 -13.76,7.65 -20.43,11.01c-17.84,8.96 -47.1499,13.35 -47.1499,13.35c0,0 6.76,-31.93 4.33,-53.03c-2.44,-21.1 -14.54,-44.79 -14.54,-44.79zM40.5364,35.6778c4.7799,0 8.6499,-3.87 8.6499,-8.65c0,-4.77 -3.87,-8.64 -8.6499,-8.64c-4.77,0 -8.64,3.87 -8.64,8.64c0,4.78 3.87,8.65 8.64,8.65z";
                    g_fish_tail="M54.92 36.32C47.74 31.1 35.29 15.74 35.29 15.74C35.29 15.74 27.29 5.88 19 2.51C10.71 -0.86 0 0.14 0 0.14C0 0.14 11.57 8.47 19 21.17C23.43 28.75 24.78 38.31 25.75 47.38C28.34 71.69 8.48 106 8.48 106C8.48 106 21.38 99.26 28.76 93.1C36.14 86.94 44.45 76.14 44.45 76.14C44.45 76.14 53.95 62.23 58.36 59.18C62.77 56.12 65.15 56.12 65.15 56.12L65.15 41.53C65.15 41.53 62.09 41.53 54.92 36.32Z";
                }
            }
            else if (fp2 === "ygt5") {
                if (leaftype == "toleft") {
                    g_fish_head="M87.9998,52.6599c1.13,21.44 11.94,35.38 11.94,35.38c0,0 2.8502,5.45 2.7902,9.36c-0.07,3.9001 -2.7902,8.3301 -2.7902,8.3301c0,0 -26.1001,0.27 -43.2001,-2.88c-13.74,-2.53 -32.21,-9.2301 -38.9501,-11.7601c-1.6199,-0.53 -2.6,-0.99 -2.6,-0.99c0,0 0.9401,0.37 2.6,0.99c2.7901,0.91 7.4801,1.98 12.2101,1.06c7.45,-1.45 16.45,-9.46 16.45,-9.46c0,0 -6.68,4.89 -16.45,5.35c-9.77,0.46 -23.8601,-5.35 -23.8601,-5.35c0,0 -5.06981,-4.25 -5.9898,-9.29c-0.92,-5.03 2.69979,-12.51 2.69979,-12.51c0,0 5.76001,-17.6899 24.27011,-32.4999c18.51,-14.81 72.8201,-28.39 72.8201,-28.39c0,0 -13.06,31.21 -11.94,52.6599zM53.0364,49.7752c0,-5.45 -4.4199,-9.8699 -9.8699,-9.8699c-5.46,0 -9.8799,4.4199 -9.8799,9.8699c0,5.46 4.4199,9.88 9.8799,9.88c5.45,0 9.8699,-4.42 9.8699,-9.88z";
                    g_fish_tail="M100.85 0.84C103.35 2.72 102.81 7.69 102.81 7.69C102.81 7.69 98.7304 18.35 94.9804 30.67C92.8104 37.83 89.2404 44.56 90.5804 52.69C92.0104 61.34 98.3204 69.79 104.01 77.54C112.85 89.58 121.88 99.15 121.88 99.15C121.88 99.15 123.86 100.61 123.92 102.3C123.98 103.99 121.88 106 121.88 106C121.88 106 83.9304 98.32 59.9004 89.25C35.8704 80.19 4.49041 61.98 4.49041 61.98C4.49041 61.98 0.0604095 58.44 0.000411987 54.91C-0.0595932 51.38 4.49041 47.3 4.49041 47.3C4.49041 47.3 29.0404 27.56 47.5404 17.96C66.0304 8.35 93.0204 0.84 93.0204 0.84C93.0204 0.84 98.3504 -1.05 100.85 0.84Z";
                } else {
                    g_fish_head="M2.85001,0c0,0 54.31009,13.58 72.82009,28.39c18.5101,14.81 24.2701,32.4999 24.2701,32.4999c0,0 3.6198,7.48 2.6998,12.51c-0.92,5.04 -5.9898,9.29 -5.9898,9.29c0,0 -14.0901,5.81 -23.8601,5.35c-9.77,-0.46 -16.45,-5.35 -16.45,-5.35c0,0 9,8.01 16.45,9.46c4.73,0.92 9.42,-0.15 12.2101,-1.06c1.6599,-0.62 2.6,-0.99 2.6,-0.99c0,0 -0.9801,0.46 -2.6,0.99c-6.7401,2.53 -25.2101,9.2301 -38.9501,11.7601c-17.1,3.15 -43.20009,2.88 -43.20009,2.88c0,0 -2.72001,-4.43 -2.79001,-8.3301c-0.06,-3.91 2.79001,-9.36 2.79001,-9.36c0,0 10.80999,-13.94 11.93999,-35.38c1.12,-21.4499 -11.93999,-52.6599 -11.93999,-52.6599zM59.6233,59.6552c5.46,0 9.8799,-4.42 9.8799,-9.88c0,-5.45 -4.4199,-9.8699 -9.8799,-9.8699c-5.45,0 -9.8699,4.4199 -9.8699,9.8699c0,5.46 4.4199,9.88 9.8699,9.88z";
                    g_fish_tail="M23.07 0.84C20.57 2.72 21.11 7.69 21.11 7.69C21.11 7.69 25.19 18.35 28.94 30.67C31.11 37.83 34.68 44.56 33.34 52.69C31.91 61.34 25.6 69.79 19.91 77.54C11.07 89.58 2.04 99.15 2.04 99.15C2.04 99.15 0.06 100.61 0 102.3C-0.06 103.99 2.04 106 2.04 106C2.04 106 39.99 98.32 64.02 89.25C88.05 80.19 119.43 61.98 119.43 61.98C119.43 61.98 123.86 58.44 123.92 54.91C123.98 51.38 119.43 47.3 119.43 47.3C119.43 47.3 94.88 27.56 76.38 17.96C57.89 8.35 30.9 0.84 30.9 0.84C30.9 0.84 25.57 -1.05 23.07 0.84Z";
                }
            }
            else if (fp2 === "ygt6") {
                if (leaftype == "toleft") {
                    g_fish_head="M72.27,52.36c-1.27,21.43 1.51,53.64 1.51,53.64c0,0 -20.82,-5.13 -35.42,-13.04c-5.42,-2.93 -11.72,-6.85 -16.31,-10.9c-7.79,-6.86 -12.45,-13.25 -12.45,-13.25l30.05,-7.48c0,0 -18.48,3.26 -30.05,0c-11.57,-3.25 -9.45,-5.77 -9.45,-5.77c0,0 3.18,-10.74 12.02,-21.15c5.53,-6.5 15.24,-12.44 21.68,-16.89c16.75,-11.55 46.15,-17.52 46.15,-17.52c0,0 -3.61,11.28 -5.8,25.43c-1.33,8.66 -1.45,18.8 -1.93,26.93zM42.22,21.8c-6.87,0 -12.45,5.55 -12.45,12.39c0,6.85 5.58,12.4 12.45,12.4c6.88,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.57,-12.39 -12.45,-12.39z";
                    g_fish_tail="M51.45 79.12C50.72 75.4 49.06 70.43 46.7 66.7C44.2 62.74 40.63 59.88 38.72 57.17C36.91 54.61 36.85 52.57 36.85 52.57C36.85 52.57 37.27 50.59 39.23 48.49C41.12 46.46 44.45 44.06 46.87 40.83C48.9 38.14 50.1 34.81 51.11 31.31C54.6 19.28 51.11 0 51.11 0L0 53.6L48.06 106C48.06 106 53.69 90.51 51.45 79.12Z";
                } else {
                    g_fish_head="M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z";
                    g_fish_tail="M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z";
                }
            }
            else if (fp2 === "ygt7") {
                if (leaftype == "toleft") {
                    g_fish_head="M111.31 38.39C114.59 17.02 120 0 120 0C120 0 75.9 9.01 50.78 26.45C41.12 33.16 26.55 42.12 18.26 51.94C4.99 67.65 0.23 83.87 0.23 83.87C0.23 83.87 -2.96 87.67 14.4 92.58C31.75 97.49 59.47 92.58 59.47 92.58L14.4 103.87C14.4 103.87 21.38 113.52 33.07 123.87C39.97 129.98 49.41 135.9 57.54 140.32C79.43 152.26 110.66 160 110.66 160C110.66 160 106.5 111.37 108.41 79.03C109.13 66.75 109.3 51.46 111.31 38.39ZM44.66 51.61C44.66 41.28 53.02 32.9 63.33 32.9C73.65 32.9 82.01 41.28 82.01 51.61C82.01 61.95 73.65 70.32 63.33 70.32C53.02 70.32 44.66 61.95 44.66 51.61Z";
                    g_fish_tail="M107.48,164.94C105.95,157.19 102.47,146.83 97.54,139.05C92.32,130.79 84.88,124.83 80.87,119.18C77.09,113.85 76.97,109.6 76.97,109.6C76.97,109.6 77.85,105.47 81.94,101.09C85.88,96.86 92.84,91.84 97.9,85.13C102.13,79.51 104.65,72.57 106.77,65.27C114.04,40.19 106.77,0 106.77,0L0,111.73L100.38,220.98C100.38,220.98 112.16,188.68 107.48,164.94Z";
                } else {
                    g_fish_head="M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z";
                    g_fish_tail="M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z";
                }
            }
            // 仅在非 custom 模式下才用 fish_preset 覆盖 ygtstyle
            if (ygtstyle !== "custom") {
                ygtstyle = fp2;
            } else {
                // custom 模式下需要根据 fish_preset 设置鱼头鱼尾尺寸和布局参数
                if (fp2 === "ygt1" || fp2 === "ygt6") { fish_head_w = 80; fish_head_h = 106; fish_tail_w = 53; fish_tail_h = 106; }
                else if (fp2 === "ygt2") { fish_head_w = 120; fish_head_h = 160; fish_tail_w = 110; fish_tail_h = 221; }
                else if (fp2 === "ygt3") { fish_head_w = 137; fish_head_h = 106; fish_tail_w = 59; fish_tail_h = 106; }
                else if (fp2 === "ygt7") { fish_head_w = 120; fish_head_h = 160; fish_tail_w = 110; fish_tail_h = 221; }
                else if (fp2 === "ygt4") { fish_head_w = 109; fish_head_h = 104; fish_tail_w = 65; fish_tail_h = 106; }
                else if (fp2 === "ygt5") { fish_head_w = 103; fish_head_h = 104; fish_tail_w = 124; fish_tail_h = 106; }
                // custom 模式下也需要设置布局参数（参考预设风格 ygt1）
                startwidth = 180;
                startwidth_head_toleft = 50;
                startwidth_head = 100;
                startwidth_pyl = 60;
                g_height = 150;
                g_max_top = 50;
            }
        }
        if (obj_style_flag && obj_style) {
            if (obj_style["g_fill"] !== undefined && obj_style["g_fill"] !== "") { g_fill = obj_style["g_fill"]; g_stroke = g_fill; }
            if (obj_style["g_text_color"] !== undefined && obj_style["g_text_color"] !== "") g_text_color = obj_style["g_text_color"];
            if (obj_style["g_title_color"] !== undefined) g_title_color = obj_style["g_title_color"];
            if (obj_style["g_bg_color"] !== undefined && obj_style["g_bg_color"] !== "") g_bg_color = obj_style["g_bg_color"];
            if (obj_style["g_bg_color_important"] !== undefined && obj_style["g_bg_color_important"] !== "") { g_bg_color_important = obj_style["g_bg_color_important"]; g_stroker_important = g_bg_color_important; }
            if (obj_style["g_text_color_important"] !== undefined && obj_style["g_text_color_important"] !== "") g_text_color_important = obj_style["g_text_color_important"];
            if (obj_style["g_middle_line_width"] !== undefined && obj_style["g_middle_line_width"] !== "") g_middle_line_width = obj_style["g_middle_line_width"];
            if (obj_style["g_stroke_width"] !== undefined && obj_style["g_stroke_width"] !== "") g_stroke_width = obj_style["g_stroke_width"];
            if (obj_style["g_arrow_size"] !== undefined && obj_style["g_arrow_size"] !== "") g_arrow_size = obj_style["g_arrow_size"];
            if (obj_style["g_font_size"] !== undefined && obj_style["g_font_size"] !== "") g_font_size = obj_style["g_font_size"];
            if (obj_style["g_spine_color"] !== undefined && obj_style["g_spine_color"] !== "") g_spine_color = obj_style["g_spine_color"];
            if (obj_style["g_fin_color"] !== undefined && obj_style["g_fin_color"] !== "") g_fin_color = obj_style["g_fin_color"];
            if (obj_style["g_fin_bg_color"] !== undefined && obj_style["g_fin_bg_color"] !== "") g_fin_bg_color = obj_style["g_fin_bg_color"];
            // 一级鱼刺属性
            if (obj_style["g_fin_color_1"] !== undefined && obj_style["g_fin_color_1"] !== "") g_fin_color_1 = obj_style["g_fin_color_1"];
            if (obj_style["g_stroke_width_1"] !== undefined && obj_style["g_stroke_width_1"] !== "") g_stroke_width_1 = obj_style["g_stroke_width_1"];
            if (obj_style["g_arrow_size_1"] !== undefined) g_arrow_size_1 = obj_style["g_arrow_size_1"];
            if (obj_style["g_text_color_1"] !== undefined && obj_style["g_text_color_1"] !== "") g_text_color_1 = obj_style["g_text_color_1"];
            if (obj_style["g_font_size_1"] !== undefined && obj_style["g_font_size_1"] !== "") g_font_size_1 = obj_style["g_font_size_1"];
            if (obj_style["g_font_weight_1"] !== undefined && obj_style["g_font_weight_1"] !== "") g_font_weight_1 = obj_style["g_font_weight_1"];
            if (obj_style["g_text_line_spacing_ratio_1"] !== undefined) g_text_line_spacing_ratio_1 = parseFloat(obj_style["g_text_line_spacing_ratio_1"]);
            // 二级鱼刺属性
            if (obj_style["g_fin_color_2"] !== undefined && obj_style["g_fin_color_2"] !== "") g_fin_color_2 = obj_style["g_fin_color_2"];
            if (obj_style["g_stroke_width_2"] !== undefined && obj_style["g_stroke_width_2"] !== "") g_stroke_width_2 = obj_style["g_stroke_width_2"];
            if (obj_style["g_arrow_size_2"] !== undefined) g_arrow_size_2 = obj_style["g_arrow_size_2"];
            if (obj_style["g_text_color_2"] !== undefined && obj_style["g_text_color_2"] !== "") g_text_color_2 = obj_style["g_text_color_2"];
            if (obj_style["g_font_size_2"] !== undefined && obj_style["g_font_size_2"] !== "") g_font_size_2 = obj_style["g_font_size_2"];
            if (obj_style["g_font_weight_2"] !== undefined && obj_style["g_font_weight_2"] !== "") g_font_weight_2 = obj_style["g_font_weight_2"];
            if (obj_style["g_text_line_spacing_ratio_2"] !== undefined) g_text_line_spacing_ratio_2 = parseFloat(obj_style["g_text_line_spacing_ratio_2"]);
            // 三级鱼刺属性
            if (obj_style["g_fin_color_3"] !== undefined && obj_style["g_fin_color_3"] !== "") g_fin_color_3 = obj_style["g_fin_color_3"];
            if (obj_style["g_stroke_width_3"] !== undefined && obj_style["g_stroke_width_3"] !== "") g_stroke_width_3 = obj_style["g_stroke_width_3"];
            if (obj_style["g_arrow_size_3"] !== undefined) g_arrow_size_3 = obj_style["g_arrow_size_3"];
            if (obj_style["g_text_color_3"] !== undefined && obj_style["g_text_color_3"] !== "") g_text_color_3 = obj_style["g_text_color_3"];
            if (obj_style["g_font_size_3"] !== undefined && obj_style["g_font_size_3"] !== "") g_font_size_3 = obj_style["g_font_size_3"];
            if (obj_style["g_font_weight_3"] !== undefined && obj_style["g_font_weight_3"] !== "") g_font_weight_3 = obj_style["g_font_weight_3"];
            if (obj_style["g_text_line_spacing_ratio_3"] !== undefined) g_text_line_spacing_ratio_3 = parseFloat(obj_style["g_text_line_spacing_ratio_3"]);
            if (obj_style["g_group_spacing"] !== undefined) g_group_spacing = parseInt(obj_style["g_group_spacing"])||30;
        }

        if (leaftype == undefined) {
            leaftype = "toright";
        }
        if (leaftype != "toleft" && leaftype != "toright") {
            leaftype = "toright";
        }


    function drawArrow2(a_x2, a_y2, a_x1, a_y1, a_size) {
      
        var size = (typeof a_size !== "undefined") ? a_size : g_arrow_size;
        var angle = Raphael.angle(a_x1, a_y1, a_x2, a_y2); //API方法获取角度，原直线倾斜度  
        var angle_45_one = Raphael.rad(angle - 30); //API方法转变为弧度  
        var angle_45_two = Raphael.rad(angle + 30); //API方法转变为弧度  
        //arrow points求出箭头的双向点  
        var angle_x1 = a_x1 - Math.cos(angle_45_one) * size;
        var angle_y1 = a_y1 - Math.sin(angle_45_one) * size;
        var angle_x2 = a_x1 - Math.cos(angle_45_two) * size;
        var angle_y2 = a_y1 - Math.sin(angle_45_two) * size;
        //return  
        var result = ["M", angle_x1, angle_y1, "L", a_x1, a_y1, "L", angle_x2, angle_y2, "z"];
        return result;
    }




    function getTextSize(item, a_attr) {
        if (window.__YGT_LEGACY_FIXED_TEXT__ && item && Number(item.FIXED_WIDTH) > 0 && Number(item.FIXED_HEIGHT) > 0) {
            var _fw = Number(item.FIXED_WIDTH);
            var _fh = Number(item.FIXED_HEIGHT);
            return { x: -_fw / 2, y: -_fh / 2, x2: _fw / 2, y2: _fh / 2, width: _fw, height: _fh, cx: 0, cy: 0 };
        }
        var a_text = item.name;
        var _allText = a_text.replace(/\n/g, "");
        var _lineCount = (a_text.match(/\n/g) || []).length + 1;
        // 小于等于12个字的文本强制合并为一行显示
        if (_allText.length <= 12) {
            item._twoLineText = null;
            if (_allText.length < a_text.length) { item.name = _allText; a_text = _allText; }
        // 超过12个字的文本（包括原超过3行的），均匀拆分为两行显示
        } else {
            var _halfLen = Math.ceil(_allText.length / 2);
            a_text = _allText.substring(0, _halfLen) + "\n" + _allText.substring(_halfLen);
            item._twoLineText = a_text;
            item.name = a_text;
        }
        if (a_attr == undefined) {
            // 根据级别匹配字体大小，确保测量与渲染一致
            var _fsize = g_font_size;
            if (item.jb == 1 || item.jb == "1") { _fsize = g_font_size_1; }
            else if (item.jb == 2 || item.jb == "2") { _fsize = g_font_size_2; }
            else { _fsize = g_font_size_3; }
            a_attr = {
                "text-anchor": "center",
                "fill": "#333333",
                "font-family": "新宋体,SimHei,宋体,Microsoft YaHei",
                "font-size": _fsize
            };
        }

        var text = paperv.text(0, 0, a_text).attr(a_attr);
        var ret = text.getBBox();
        text.remove();
        return ret;
    }


    function getAnglePoint(a_x1, a_y1, a_height, a_angle) {
        var end_x = a_x1 + a_height * Math.cos(Raphael.rad(a_angle)); //计算线段的x轴结束点
        var end_y = a_y1 + a_height * Math.sin(Raphael.rad(a_angle)); //计算线段的y轴结束点
        return {
            x: end_x,
            y: end_y
        };
    }



    //change1
    function drawText(a_x1, a_y1, a_text,item, a_attr) { 
        important = item.important==undefined?"0":item.important; 
        // 如果文本超过3行已重排为2行，使用重排后的文本
        if (item._twoLineText) {
            a_text = item._twoLineText;
        }
        // getTextSize（动态边框内边距: 基于字体大小计算，确保重要节点文字不溢出边框）
        //  textsize {"x":74.96875,"y":144.3333282470703,"x2":125.03125,"y2":155.66666218618652,"width":50.0625,"height":11.333333969116211,"cx":100,"cy":149.99999523162842} 
        // 动态边框内边距: 基于字体大小计算，确保重要节点文字不溢出边框
        function calcImportantPad(fontPx) {
            var fs = parseFloat(fontPx) || 14;
            return Math.max(6, Math.round(fs * 0.5));  // 最小6px, 约0.5倍字号
        }
        var wh = calcImportantPad(g_font_size); 
        if (a_attr == undefined) {
            a_attr = {
                "text-anchor": "center",
                "fill": g_text_color,
                "font-family": "新宋体,SimHei,宋体,Microsoft YaHei",
                "font-size": g_font_size
            };
        }
        // 创建节点组
                const nodeGroup = paper.set();
        var isLeaf1 = (item.jb == 1 || item.jb == "1");
        if (isLeaf1) {
            var padX = 30, padY =20;
            paper.rect(a_x1 + item.textsize.x - padX, a_y1 + item.textsize.y - padY, item.textsize.width + padX * 2, item.textsize.height + padY * 2, 25).attr({ "fill": g_fin_bg_color, "stroke-width": 0 });
            var text = paper.text(a_x1, a_y1, a_text).attr({ "text-anchor": "center", "fill": g_text_color_1, "font-family": "新宋体,SimHei,宋体,Microsoft YaHei", "font-size": g_font_size_1, "font-weight": g_font_weight_1 });
        } else if (important=="1") { 
           var  a_attr2 = {
                "text-anchor": "center",
                "fill": g_text_color_important,
                "font-family": "新宋体,SimHei,宋体,Microsoft YaHei",
                "font-size": g_font_size
            };
                            paper.rect(a_x1 + item.textsize.x - wh, a_y1 + item.textsize.y - wh, item.textsize.width + wh * 2, item.textsize.height + wh * 2, 5).attr({ "fill": "transparent", "stroke": g_bg_color_important, "stroke-width": 1 });  
            //circle
            //text=paper.ellipse(a_x1 ,a_y1,item.textsize.width ,item.textsize.height+10).attr({ "fill": fillcolor,"stroke":"#000"});  
            text = paper.text(a_x1, a_y1, a_text).attr(a_attr2); 
        } else {
            // 根据级别选择文字颜色、大小和粗细
            var _txt_color = g_text_color, _txt_fsize = g_font_size, _txt_fweight = "400";
            if (item.jb == 2) { _txt_color = g_text_color_2; _txt_fsize = g_font_size_2; _txt_fweight = String(g_font_weight_2); }
            else if (item.jb == 3 || item.jb == 4) { _txt_color = g_text_color_3; _txt_fsize = g_font_size_3; _txt_fweight = String(g_font_weight_3); }
            var text = paper.text(a_x1, a_y1, a_text).attr({ "text-anchor": a_attr["text-anchor"], "fill": _txt_color, "font-family": a_attr["font-family"], "font-size": _txt_fsize, "font-weight": _txt_fweight });
        } 
        if (item.url!=undefined && item.url!="")
        {
            nodeGroup.push(text);
            var opentype = item.opentype;
            if (opentype==undefined || opentype=="")
            {
                opentype = {"width":1000,"height":1000,"title":"鱼骨图明细查看"}
            }
            var as_url = item.url;
            nodeGroup.click(function() {
                myOpenWin(as_url,opentype)
            });
            nodeGroup.hover(
                function() {
                    this.animate({ opacity: 0.7 }, 200);
                    text.animate({ r: 18 }, 200);
                },
                function() {
                    this.animate({ opacity: 1 }, 200);
                    text.animate({ r: 15 }, 200);
                }
            ); 
        } 
        return text;
       

    }

    function myOpenWin(url, parms) {
       // alert("myOpenWin:"+url)  
      // alert($.toJSON(parms))
        if  (typeof openwin!="undefined" ) {

            if  (typeof get_openWin_parms!="undefined" ) { 
                parms = get_openWin_parms();
            }
            openwin(url, $.extend(parms, {
                collapsible: false,
                modal: true,
                collapsible: false,
                minimizable: false,
                maximizable: true
            }));
        }
        else{
            window.open( url, "_blank");

        }
        
    }

    function drawLine(a_x1, a_y1, a_x2, a_y2, a_width, a_color) {
        var line = paper.path("M " + a_x1 + " " + a_y1 + " " + a_x2 + " " + a_y2 + "").attr({
            "stroke-width": a_width,
            "stroke": a_color,
            "fill": g_fill
        });
        return line;
    }



    function getAnglePoint(a_x1, a_y1, a_height, a_angle) {
        var end_x = a_x1 + a_height * Math.cos(Raphael.rad(a_angle)); //计算线段的x轴结束点
        var end_y = a_y1 + a_height * Math.sin(Raphael.rad(a_angle)); //计算线段的y轴结束点
        return {
            x: end_x,
            y: end_y
        };
    }

    function getPoint(a_x1, a_y1, a_x2, a_y2, a_height) {
        var angle = Raphael.angle(a_x1, a_y1, a_x2, a_y2); //API方法获取角度，原直线倾斜度
        var end_x = a_x1 + a_height * Math.cos(Raphael.rad(a_angle)); //计算线段的x轴结束点
        var end_y = a_y1 + a_height * Math.sin(Raphael.rad(a_angle)); //计算线段的y轴结束点
        return {
            x: end_x,
            y: end_y
        };
    }


    //chrome 支持，ie不支持
    function getLinePoint(a_line, a_height) {
        var line = a_line;
        var length = line.attrs.path.length;
        var x1 = line.attrs.path[length - 1][1]; //单线段起点  
        var y1 = line.attrs.path[length - 1][2]; //单线段起点  
        var x2 = line.attrs.path[length - 2][1]; //单线段终点  
        var y2 = line.attrs.path[length - 2][2]; //单线段终点  
        var angle = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度
        var end_x = x1 + a_height * Math.cos(Raphael.rad(angle)); //计算线段的x轴结束点
        var end_y = y1 + a_height * Math.sin(Raphael.rad(angle)); //计算线段的y轴结束点
        return {
            x: end_x,
            y: end_y
        };
    }



    //修改9月27日晚
    function strSplit(a_str, a_len) {
        if (!a_str || !a_len) {
            return '';
        }
        a_str = a_str.replace(/\\n/g, "").replace(/\\r/g, "");
        // 预期计数：中文2字节，英文1字节
        var a = 0;
        // 循环计数
        var i = 0;
        // 临时字串
        var arr_temp = [];
        var temp = '';
        for (i = 0; i < a_str.length; i++) {
            if (a >= a_len) {
                arr_temp.push(temp);
                a = 0;
                temp = "";

            }

            if (a_str.charCodeAt(i) > 255) {
                // 按照预期计数增加2
                a += 2;
            } else {
                a++;
            }


            // 将当前内容加到临时字符串
            temp += a_str.charAt(i);
        }

        if (temp != "") {
            arr_temp.push(temp);
        }

        // 如果全部是单字节字符，就直接返回源字符串
        return arr_temp.join("\n");
    }


    //修改
    function draw_head(x, y, title, as_leaftype) {

        //paper.circle(x,y,5);
        paper.setStart();
       
 
        //画鱼头
        if ((ygtstyle!="" && ygtstyle.indexOf("ygt")>=0) || (typeof g_fish_preset !== "undefined" && g_fish_preset !== ""))
        {
            var rxx = 280;
            var lxx = 230;
            // custom 模式下根据 g_fish_preset 来确定标题偏移
            var _style_for_offset = (ygtstyle === "custom" && g_fish_preset) ? g_fish_preset : ygtstyle;
            if (_style_for_offset=="ygt1")
            {
                rxx = 180; 
                lxx = 130;
            }
            else if (_style_for_offset=="ygt2")
            {
                rxx = 220; 
                lxx = 180;
            }
            else if (_style_for_offset=="ygt3")
            {
                rxx = 240; 
                lxx = 190;
            }
            else if (_style_for_offset=="ygt4")
            {
                rxx = 210; 
                lxx = 160;
            }
            else if (_style_for_offset=="ygt5")
            {
                rxx = 210; 
                lxx = 160;
            }
            else if (_style_for_offset=="ygt6")
            {
                rxx = 180; 
                lxx = 130;
            }
            else if (_style_for_offset=="ygt7")
            {
                rxx = 220; 
                lxx = 180;
            }
            else{
               

            }
            var title_split = strSplit(title, 1);
            // 计算文字位置：根据鱼头实际位置来确定
            // toright: 鱼头在 [x+fish_head_w, x+2*fish_head_w]（x 右侧），嘴在 x+fish_head_w 朝左
            //          文字放在鱼头右侧：x + 2*fish_head_w + 间距
            // toleft:  鱼头在 [x-fish_head_w, x]（x 左侧），鱼头右边对准 x，嘴在 x-fish_head_w 朝右
            //          文字放在鱼头左侧：x - fish_head_w - 间距
            var text_offset_right = fish_head_w * 2 + 30;  // toright: 鱼头右侧
            var text_offset_left = fish_head_w + 30;        // toleft: 鱼头左侧
            
            // 预设风格使用原有的固定偏移值
            if (ygtstyle !== "custom") {
                text_offset_right = rxx;
                text_offset_left = lxx;
            }
            
            var _tc = g_title_color || g_fill; // 名称颜色，默认跟随鱼头颜色
            if (as_leaftype == "toright") {
               // 文字在鱼头右侧：x + fish_head_w（鱼头起始） + fish_head_w（鱼头宽度） + 30（间距）
               var textX = x + fish_head_w + fish_head_w + 30;
               var menu_text = paper.text(textX, y, title_split).attr({
                   "text-anchor": "center",
                   "fill": _tc,
                   "stroke": g_fin_color,				
                   "font-size": "20px",
                   "font-family": "新宋体,SimHei,宋体,Microsoft YaHei"
               })
           } else {
               // toleft 向左游，鱼头 [x-fish_head_w/2, x+fish_head_w/2]，名称在鱼头左边
               var textX = x - Math.round(fish_head_w / 2) - 30;
               var menu_text = paper.text(textX, y, title_split).attr({
                   "text-anchor": "center",
                   "fill": _tc,
                   "stroke": g_fin_color,				
                   "font-size": "20px",
                   "font-family": "新宋体,SimHei,宋体,Microsoft YaHei"
               })
   
           }

           var fish_head = paper.path(g_fish_head); 
            fish_head.attr({
                "text-anchor": "center",
                "fill": g_fill, //#4c4c4c	
                "stroke": g_stroke,				
            
            }); 

             
           if (as_leaftype == "toleft") { 
                // toleft = 向左游，鱼头在左边朝左，身体末端衔接鱼干 x
                // 向左偏移 fish_head_w/2，鱼头 [x-fish_head_w/2, x+fish_head_w/2]
                var head_x = x - Math.round(fish_head_w / 2);
                var tt = "t" + head_x + "," + (y - fish_head_h / 2);
                fish_head.attr("transform", tt);
            } else {
               var tt= "t"+(x+fish_head_w)+","+( y-fish_head_h/2);
                fish_head.attr("transform",tt );
            } 
          
        }
        else{

            var title_split = strSplit(title, 1);
            if (as_leaftype == "toright") {
               var menu_text = paper.text(x + 45, y, title_split).attr({
                   "text-anchor": "center",
                   "fill": g_fill, //#4c4c4c	
                   "stroke": g_fin_color,				
                   "font-size": "16px",
                   "font-family": "新宋体,SimHei,宋体,Microsoft YaHei"
               })
           } else {
               var menu_text = paper.text(x - 45, y, title_split).attr({
                   "text-anchor": "center",
                   "fill": g_fill, //#4c4c4c	
                   "stroke": g_fin_color,				
                   "font-size": "16px",
                   "font-family": "新宋体,SimHei,宋体,Microsoft YaHei"
               })
   
           }
   
           var li_width = 20;
           var li_height = 20;
           var li_width_smooth = 15;
           var li_eye_dis = 15;

            if (as_leaftype == "toleft") {
                li_eye_dis = -15;
                li_width = -20;
                li_width_smooth = -15;
                var c = paper.path("M" + x + " " + (y - li_height) + " L " + x + " " + (y + li_height) + " S " + (x + li_width + li_width_smooth) + " , " + (y - li_width_smooth) + "  " + (x + li_width + li_width_smooth) + " , " + y + "L " + (x + li_width + li_width_smooth) + "  " + y + " S " + (x + li_width + li_width_smooth) + " , " + (y + li_width_smooth) + "  " + x + " , " + (y - li_height)).attr({ "stroke-width": 2,"stroke": g_stroke }); //line "#3d537f" back #caddfe
    
            } else {
                var c = paper.path("M" + x + " " + (y - li_height) + " L " + x + " " + (y + li_height) + " S " + (x + li_width + li_width_smooth) + " , " + (y + li_width_smooth) + "  " + (x + li_width + li_width_smooth) + " , " + y + "L " + (x + li_width + li_width_smooth) + "  " + y + " S " + (x + li_width + li_width_smooth) + " , " + (y - li_width_smooth) + "  " + x + " , " + (y - li_height)).attr({ "stroke-width": 2,"stroke": g_stroke,}); //line "#3d537f" back #caddfe
            }
    

        }
    
        //var c = paper.path("M"+x+" "+(y -45)+" L "+x+" "+(y +45)+" L "+(x + pos.width +40)+"  "+y+"" ).attr({ "stroke-width": 1, "stroke": color_back_yg  , "fill": color_back_yg }); //line "#3d537f" back #caddfe

        menu_text.toFront();

        //function btnExpClicked() {
        //ExpSvg2Png(paper.toSVG(), "ygt.svg");
        //}

        if (ygtstyle==""){

            var o = paper.circle(x + li_eye_dis, y, 3);
            o.attr({
                "stroke-width": 2,
                "stroke": g_fin_color,
                "fill": g_fill
            }); 
        }
       
        
        // , "fill": color_back_yg 
        //var l_top = $("#" + panel).parent().offset().top;
        //var l_left = $("#" + panel).parent().offset().left;


        //	var l_top = $("#"+container).parent().offset().top;
        //	var l_left = $("#"+container).parent().offset().left;

        /*	
        $("<a href='javascript:void(0)' style='position:absolute;text-decoration:none;z-index:999;background-color:white; padding:5px 10px 5px 10px; border:1px solid #ccc; top:"+l_top+"px;left:"+l_left+"px;'>保存图片</a>").on("click",function(){
            $(this).html("正在保存");
            ExpSvg2Png(paper.toSVG(), "ygt.svg");
        }).appendTo("body");
        */




        return paper.setFinish();
    }


 


    //修改
    function draw_foot(x, y, leaftype) {

        var footsize = 40;
        var footangle = 35;
        //paper.circle(x,y,5);

        var angle_45_one = Raphael.rad(footangle); //API方法转变为弧度  
        var angle_45_two = Raphael.rad(360 - footangle); //API方法转变为弧度  
        //arrow points求出箭头的双向点  
        var angle_x1 = x;
        var angle_y1 = y;
        var angle_x2 = x;
        var angle_y2 = y;

        if (leaftype == "toright") {
            angle_x1 -= Math.cos(angle_45_one) * footsize;
            angle_y1 -= Math.sin(angle_45_one) * footsize;
            angle_x2 -= Math.cos(angle_45_two) * footsize;
            angle_y2 -= Math.sin(angle_45_two) * footsize;
        } else {
            angle_x1 += Math.cos(angle_45_one) * footsize;
            angle_y1 += Math.sin(angle_45_one) * footsize;
            angle_x2 += Math.cos(angle_45_two) * footsize;
            angle_y2 += Math.sin(angle_45_two) * footsize;
        }

        //return  
        var result = ["M", angle_x1, angle_y1, "L", x, y, "L", angle_x2, angle_y2, "z"]; //


        //画鱼尾
        if ((ygtstyle!="" && ygtstyle.indexOf("ygt")>=0) || (typeof g_fish_preset !== "undefined" && g_fish_preset !== ""))
        {
            var fish_tail = paper.path(g_fish_tail); 
            fish_tail.attr({
                "text-anchor": "center",
                "fill": g_fill, //#4c4c4c	
                "stroke": g_stroke,				
            
            }); 

            if (ygtstyle=="ygt1"  )
            {
                if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-180, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-45)+","+(angle_y1-76);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-45),"y":(angle_y1-76)}) ;
                    fish_tail.attr("transform",tt) ;

                }
                else{ 
                    var tt="t"+(angle_x1-fish_tail_w+fish_tail_w)+","+(angle_y1-31);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-fish_tail_w+fish_tail_w),"y":(angle_y1-31)} ) ;
                    fish_tail.attr("transform",tt) ;
                }

            }
            else if (  ygtstyle=="ygt2")
            {
                //angle_x1-120 , angle_y1-135, fish_tail_w, fish_tail_h 
                if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-135, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-45)+","+(angle_y1-135);
                    //fish_tail.animate({transform:tt}, 100) ; 
                    //fish_tail.attr({"x":(angle_x1-45),"y":(angle_y1-135)} ) ;
                    fish_tail.attr("transform",tt) ;
                }
                else{ 
                    //angle_x1-70 , angle_y1-90, fish_tail_w, fish_tail_h
                    var tt="t"+(angle_x1-65)+","+(angle_y1-90);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-65),"y":(angle_y1-90)} ) ;
                    fish_tail.attr("transform",tt) ;


                }

            }
            else if (  ygtstyle=="ygt3")
            {
                if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-135, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-45)+","+(angle_y1-69);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-45),"y":(angle_y1-69)} ) ; 
                    fish_tail.attr("transform",tt) ;
                }
                else{ 
                    //angle_x1-70 , angle_y1-90, fish_tail_w, fish_tail_h
                    var tt="t"+(angle_x1)+","+(angle_y1-23);
                    //fish_tail.animate({transform:tt}, 100) ; 
                    //fish_tail.attr({"x":(angle_x1),"y":(angle_y1-23)} ) ;  
                    fish_tail.attr("transform",tt) ;
                }

            }
            else if (  ygtstyle=="ygt4")
            {
                if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-135, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-44)+","+(angle_y1-71);
                    //fish_tail.animate({transform:tt}, 100) ;
                   // fish_tail.attr({"x":(angle_x1-44),"y":(angle_y1-71)} ) ; 
                    
                    fish_tail.attr("transform",tt) ;
                }
                else{ 
                    //angle_x1-70 , angle_y1-90, fish_tail_w, fish_tail_h
                    var tt="t"+(angle_x1-fish_tail_w+45)+","+(angle_y1-25);
                    //fish_tail.animate({transform:tt}, 100) ;  
                    //fish_tail.attr({"x":(angle_x1-fish_tail_w+45),"y":(angle_y1-25)} ) ; 
                    
                    fish_tail.attr("transform",tt) ;
                }

            }
            else if (  ygtstyle=="ygt5")
            {
                if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-135, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-45)+","+(angle_y1-77);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-45),"y":(angle_y1-77)} ) ; 
                    fish_tail.attr("transform",tt) ;
                }
                else{ 
                    //angle_x1-70 , angle_y1-90, fish_tail_w, fish_tail_h
                    var tt="t"+(angle_x1-fish_tail_w +45)+","+(angle_y1-33);
                    //fish_tail.animate({transform:tt}, 100) ;  
                    //fish_tail.attr({"x":(angle_x1-fish_tail_w +45),"y":(angle_y1-33)} ) ; 
                    fish_tail.attr("transform",tt) ;
                }

            }
            else if (  ygtstyle=="ygt6")
            {
               if (leaftype == "toleft") {
                
                    //var i = paper.image(g_fish_tail,angle_x1-40 , angle_y1-180, fish_tail_w, fish_tail_h );//图片(src,x,y,width,height); 
                    var tt="t"+(angle_x1-45)+","+(angle_y1-76);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-45),"y":(angle_y1-76)}) ;
                    fish_tail.attr("transform",tt) ;

                }
                else{ 
                    var tt="t"+(angle_x1-fish_tail_w+fish_tail_w)+","+(angle_y1-31);
                    //fish_tail.animate({transform:tt}, 100) ;
                    //fish_tail.attr({"x":(angle_x1-fish_tail_w+fish_tail_w),"y":(angle_y1-31)} ) ;
                    fish_tail.attr("transform",tt) ;
                }
            }
            else if (  ygtstyle=="ygt7")
            {
                if (leaftype == "toleft") {
                    var tt="t"+(angle_x1-45)+","+(angle_y1-135);
                    fish_tail.attr("transform",tt) ;
                }
                else{ 
                    var tt="t"+(angle_x1-65)+","+(angle_y1-90);
                    fish_tail.attr("transform",tt) ;
                }
            }
            else{
                // custom 模式下根据 g_fish_preset 使用与预设风格完全一致的鱼尾位置
                var fp_tail = (typeof g_fish_preset !== "undefined" && g_fish_preset !== "") ? g_fish_preset : "";
                if (fp_tail === "ygt1" || fp_tail === "ygt6") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-45)+","+(angle_y1-76);
                    } else {
                        var tt="t"+(angle_x1-fish_tail_w+fish_tail_w)+","+(angle_y1-31);
                    }
                } else if (fp_tail === "ygt2") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-45)+","+(angle_y1-135);
                    } else {
                        var tt="t"+(angle_x1-65)+","+(angle_y1-90);
                    }
                } else if (fp_tail === "ygt7") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-45)+","+(angle_y1-135);
                    } else {
                        var tt="t"+(angle_x1-65)+","+(angle_y1-90);
                    }
                } else if (fp_tail === "ygt3") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-45)+","+(angle_y1-69);
                    } else {
                        var tt="t"+(angle_x1)+","+(angle_y1-23);
                    }
                } else if (fp_tail === "ygt4") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-44)+","+(angle_y1-71);
                    } else {
                        var tt="t"+(angle_x1-fish_tail_w+45)+","+(angle_y1-25);
                    }
                } else if (fp_tail === "ygt5") {
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-45)+","+(angle_y1-77);
                    } else {
                        var tt="t"+(angle_x1-fish_tail_w+45)+","+(angle_y1-33);
                    }
                } else {
                    // fallback: 使用通用公式
                    if (leaftype == "toleft") {
                        var tt="t"+(angle_x1-fish_tail_w)+","+(angle_y1-fish_tail_h/2);
                    } else {
                        var tt="t"+(angle_x1-fish_tail_w+fish_tail_w)+","+(angle_y1-fish_tail_h/2);
                    }
                }
                fish_tail.attr("transform",tt);
            }
        }
        else{
            var c = paper.path(result).attr({ "stroke-width": 2,"stroke": g_stroke });

        }
 

       

        //var c = paper.path("M" + x + " " + y + " L" + (x + Math.round(45 / Math.tan(60 * 2 * Math.PI / 360))) + " " + (y - 60) + "L" + (x + Math.round(45 / Math.tan(60 * 2 * Math.PI / 360))) + " " + (y + 60) + "z");//.attr({"transform": "r180 x y" });
        //return c;
        // var c = paper.path("M 3.7605712,7.1466862 C 7.1788716,1.4371184 42.507259,17.319853 45.205801,30.187603 42.604309,44.096565 6.037112,60.564407 3.7605712,57.539415 3.4469874,52.870253 4.2742768,41.817045 17.777711,30.187581 4.4172246,22.064357 3.3239388,11.312845 3.7605712,7.1466862 Z");
        //c.translate(x -30 ,y - 30)
        /* c.transform("T" + (x - 30) + "," + (y - 30) + "");
       c.attr({
           "stroke-width": 1,
           "stroke": color_back_yg,
           "fill": color_back_yg
       })
*/
        //var c = paper.path("M"+x+" "+(y -30)+" L "+x+" "+(y +30)+" S "+(x + 30)+" , "+(y + 15 )+"  "+(x + 30)+" , "+y+"L "+(x + 30)+"  "+y+" S " +(x + 30)+" , "+(y - 15 )+"  "+x+" , "+(y - 30) ).attr({ "stroke-width": 1, "stroke": color_back_yg  , "fill": color_back_yg }); //line "#3d537f" back #caddfe
        //   var jj = Math.round(45 / Math.tan(60 * 2 * Math.PI / 360));
        //	Math.round(45/Math.tan(60*2*Math.PI/360))
        //var c = paper.path("M"+x+" "+y+" S "+(x + jj - 15)+" , "+(y - 35 )+"  "+(x + jj - 15)+" , "+(y - 40 )+" L"+(x + jj)+" "+(y - 40)+"L"+(x + jj )+" "+(y + 40)+"Z").attr({ "stroke-width": 1, "stroke": color_back_yg, "fill": color_back_yg ,"transform":"r180 x y"});
        //    return c;


    }

    //修改

    function showInlineEditor(textElem, itemId, oldName) {
        var exist = document.getElementById("ygt_inline_edit");
        if (exist) exist.parentNode.removeChild(exist);
        var bbox = textElem.getBBox();
        var svgEl = textElem.paper.canvas;
        var rect = svgEl.getBoundingClientRect();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var ta = document.createElement("textarea");
        ta.id = "ygt_inline_edit";
        ta.value = oldName.replace(/[\r\n]+/g, "");
        ta.style.cssText = "position:absolute;left:" + (rect.left + bbox.x + sx - bbox.width/2 - 5) + "px;top:" + (rect.top + bbox.y + sy - bbox.height/2 - 3) + "px;min-width:" + (bbox.width + 10) + "px;z-index:9999;border:2px solid #007ADD;padding:2px 4px;font-size:14px;font-family:Microsoft YaHei,sans-serif;resize:both;overflow:auto;background:#fff;border-radius:3px;outline:none;";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        var done = function() {
            var nn = ta.value.trim();
            if (nn && nn !== oldName) {
                textElem.attr("text", strSplit(nn, 12));
                if (typeof onSave === "function") onSave(itemId, nn, oldName);
            }
            if (ta.parentNode) ta.parentNode.removeChild(ta);
        };
        ta.addEventListener("blur", done);
        ta.addEventListener("keydown", function(e) {
            if (e.keyCode === 13 && !e.shiftKey) { e.preventDefault(); done(); }
            else if (e.keyCode === 27) { if (ta.parentNode) ta.parentNode.removeChild(ta); }
        });
    }


    function draw_stylesetting_panel(panelId) {
        var pid = "ygt_style_panel_" + panelId;
        if (document.getElementById(pid)) return;
        if (!document.getElementById("ygt_style_css")) {
            var cs = document.createElement("style"); cs.id = "ygt_style_css";
            cs.textContent = ".ygt-pw{position:fixed;right:14px;top:50px;z-index:9999;width:280px;max-height:calc(100vh - 65px);display:flex;flex-direction:column;background:rgba(255,255,255,0.98);border:1px solid #e0e0e0;border-radius:10px;color:#333333;font-size:12px;font-family:Microsoft YaHei,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden}.ygt-ph{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #eee;cursor:move;flex-shrink:0}.ygt-pt{font-size:14px;font-weight:700;color:#1a1a2e}.ygt-pg{width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;cursor:pointer;border:none;font-size:12px;color:#666;flex-shrink:0}.ygt-pb{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 14px 14px;scroll-behavior:smooth}.ygt-pb::-webkit-scrollbar{width:5px}.ygt-pb::-webkit-scrollbar-track{background:transparent}.ygt-pb::-webkit-scrollbar-thumb{background:#d0d5dd;border-radius:3px}.ygt-pb::-webkit-scrollbar-thumb:hover{background:#b0b5bd}.ygt-ps{margin-bottom:10px}.ygt-pl{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600}.ygt-pr{display:flex;gap:3px;flex-wrap:wrap}.ygt-pk{flex:1;min-width:30px;padding:5px 2px;border:1px solid #ddd;border-radius:6px;background:#fafafa;color:#666;font-size:10px;font-weight:600;cursor:pointer;text-align:center;font-family:inherit}.ygt-pk.act{background:#e8f0fe;border-color:#4a9eff;color:#2979ff}.ygt-cr{display:flex;align-items:center;justify-content:space-between;padding:4px 4px;border-radius:4px}.ygt-cr span{font-size:11px;color:#666}.ygt-cs{position:relative;width:28px;height:16px;border-radius:13px;border:1px solid #ddd;cursor:pointer}.ygt-cs input[type=color]{position:absolute;top:-6px;left:-6px;width:40px;height:28px;border:none;padding:0;cursor:pointer;opacity:0}.ygt-sr{margin-bottom:8px}.ygt-sh{display:flex;justify-content:space-between;margin-bottom:3px;font-size:11px}.ygt-sh span:first-child{color:#666}.ygt-sh span:last-child{color:#2979ff;font-weight:600;background:#e8f0fe;padding:1px 6px;border-radius:6px}.ygt-sl{-webkit-appearance:none;width:100%;height:5px;border-radius:3px;background:#e8eaed;outline:none}.ygt-sl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#4a9eff;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(74,158,255,0.3)}.ygt-fs{width:100%;padding:6px 10px;border-radius:6px;background:#fafafa;border:1px solid #ddd;color:#333333;font-size:12px;font-family:inherit}.ygt-ab{width:100%;padding:8px;margin-top:6px;border:none;border-radius:8px;background:#4a9eff;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0}.ygt-hx{width:62px;padding:2px 4px;border:1px solid #ddd;border-radius:3px;font-size:11px;font-family:monospace;color:#333333;text-align:center;flex-shrink:0}";
            document.head.appendChild(cs);
        }
        var pe = document.getElementById(panelId);
        var P = pid + "_";
        // 预设属性查找表，用于预选联动和自定义面板填充
        var presetMap = {"ygt1":ygt1[0],"ygt2":ygt2[0],"ygt3":ygt3[0],"ygt4":ygt4[0],"ygt5":ygt5[0],"ygt6":ygt6[0],"ygt7":ygt7[0]};
        var html = '<div id="' + pid + '" class="ygt-pw"><div class="ygt-ph"><div class="ygt-pt">样式设置</div><div id="' + pid + '_tg" class="ygt-pg">-</div></div><div id="' + pid + '_bd" class="ygt-pb">';
                html += '<div class="ygt-ps"><div class="ygt-pl">鱼骨图朝向</div><select class="ygt-fs" id="' + P + 'dir"><option value="toleft"' + (leaftype=="toleft"?" selected":"") + '>向左</option><option value="toright"' + (leaftype=="toright"?" selected":"") + '>向右</option></select></div>';
html += '<div class="ygt-ps"><div class="ygt-pl">预设风格</div><div class="ygt-pr">';
        var prs = [{v:"ygt1",n:"蓝1"},{v:"ygt2",n:"蓝2"},{v:"ygt3",n:"深蓝"},{v:"ygt4",n:"浅蓝"},{v:"ygt5",n:"橙"},{v:"ygt6",n:"蓝6"},{v:"ygt7",n:"蓝7"}];
        var actP = "custom";
        for (var pi = 0; pi < prs.length; pi++) { if (ygtstyle === prs[pi].v) { actP = prs[pi].v; } }
        for (var pi = 0; pi < prs.length; pi++) { html += '<button class="ygt-pk' + (actP === prs[pi].v ? " act" : "") + '" data-preset="' + prs[pi].v + '">' + prs[pi].n + '</button>'; }
        html += '<button class="ygt-pk" data-preset="custom" id="' + P + 'custBtn">自定义</button></div></div>';
        html += '<div id="' + pid + '_cm" style="display:none">';
        // 全局颜色（不变项）
        html += '<div class="ygt-ps"><div class="ygt-pl">全局颜色</div>';
        var gcls = [{id:"g_title_color",l:"鱼骨图名称颜色",v:g_title_color||g_fill},{id:"g_fill",l:"鱼头鱼尾",v:g_fill},{id:"g_spine_color",l:"鱼骨干",v:g_spine_color},{id:"g_bg_color_important",l:"重要边框",v:g_bg_color_important},{id:"g_text_color_important",l:"重要文字",v:g_text_color_important},{id:"g_bg_color",l:"背景颜色",v:"#80BCEE"}];
        for (var gi = 0; gi < gcls.length; gi++) { html += '<div class="ygt-cr"><span>' + gcls[gi].l + '</span><div style="display:flex;align-items:center;gap:4px"><div class="ygt-cs" style="background:' + gcls[gi].v + '"><input type="color" id="' + P + gcls[gi].id + '" value="' + gcls[gi].v + '"></div><input class="ygt-hx" id="' + P + gcls[gi].id + '_hx" value="' + gcls[gi].v + '" maxlength="7"></div></div>'; }
        html += '</div>';
        // 鱼脊线宽（全局）
        html += '<div class="ygt-ps"><div class="ygt-pl">尺寸</div>';
        html += '<div class="ygt-sr"><div class="ygt-sh"><span>鱼脊线宽</span><span id="' + P + 'g_middle_line_width_v">' + (parseInt(g_middle_line_width)||3) + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_middle_line_width" min="2" max="30" value="' + (parseInt(g_middle_line_width)||3) + '"></div>';
        html += '<div class="ygt-sr"><div class="ygt-sh"><span>组间距</span><span id="' + P + 'g_group_spacing_v">' + (parseInt(g_group_spacing)||30) + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_group_spacing" min="-100" max="800" value="' + (parseInt(g_group_spacing)||30) + '"></div>';
        html += '</div>';

        // 级别切换 tabs
        html += '<div class="ygt-ps"><div class="ygt-pl">鱼刺级别设置</div><div class="ygt-pr" id="' + pid + '_lvt">';
        html += '<button class="ygt-pk act" data-lv="1">一级</button><button class="ygt-pk" data-lv="2">二级</button><button class="ygt-pk" data-lv="3">三级</button>';
        html += '</div></div>';
        // 级别-specific 面板 (由 JS 动态切换内容)
        html += '<div id="' + pid + '_lvp"></div>';

        html += '</div><button class="ygt-ab" id="' + P + 'ap">应 用 样 式</button></div></div>';
        var tmp = document.createElement("div"); tmp.innerHTML = html;
        while (tmp.firstChild) pe.appendChild(tmp.firstChild);
        document.getElementById(pid + "_tg").onclick = function() { var b = document.getElementById(pid + "_bd"); b.style.display = b.style.display === "none" ? "block" : "none"; this.innerHTML = b.style.display === "none" ? "+" : "-"; };
        // 面板拖拽（约束在视口内）
        (function() {
            var pn = document.getElementById(pid);
            var hd = pn.querySelector(".ygt-ph");
            var drag = false, sx, sy, px, py, ph;
            hd.onmousedown = function(e) {
                if (e.target === document.getElementById(pid + "_tg")) return; // 不拦截折叠按钮
                drag = true; sx = e.clientX; sy = e.clientY;
                var rect = pn.getBoundingClientRect();
                px = rect.left; py = rect.top; ph = rect.height;
                pn.style.right = "auto"; pn.style.left = px + "px";
                document.body.style.userSelect = "none";
                e.preventDefault();
            };
            document.onmousemove = function(e) {
                if (!drag) return;
                var nx = px + (e.clientX - sx);
                var ny = py + (e.clientY - sy);
                // 约束在视口范围内：上不超出顶部，下不超出底部（留10px边距）
                ny = Math.max(0, Math.min(ny, window.innerHeight - ph - 10));
                nx = Math.max(-pn.offsetWidth + 40, Math.min(nx, window.innerWidth - 40));
                pn.style.left = nx + "px"; pn.style.top = ny + "px";
            };
            document.onmouseup = function() {
                drag = false; document.body.style.userSelect = "";
            };
        })();
        // 三级编辑数据独立存储，切换级别不丢失
        var currentLv = 1;
        var levelData = {
            "1": { finColor: g_fin_color_1, sw: g_stroke_width_1, as: g_arrow_size_1, tc: g_text_color_1, fs: g_font_size_1, fw: String(g_font_weight_1), tlsr: String(g_text_line_spacing_ratio_1) },
            "2": { finColor: g_fin_color_2, sw: g_stroke_width_2, as: g_arrow_size_2, tc: g_text_color_2, fs: g_font_size_2, fw: String(g_font_weight_2), tlsr: String(g_text_line_spacing_ratio_2) },
            "3": { finColor: g_fin_color_3, sw: g_stroke_width_3, as: g_arrow_size_3, tc: g_text_color_3, fs: g_font_size_3, fw: String(g_font_weight_3), tlsr: String(g_text_line_spacing_ratio_3) },
            fbg: g_fin_bg_color
        };
        // 保存当前级别编辑值到 levelData
        function saveCurrentLevel() {
            var lv = currentLv, s = "_" + lv;
            var el;
            el = document.getElementById(P + "g_fin_color" + s); if (el) levelData["" + lv].finColor = el.value;
            el = document.getElementById(P + "g_stroke_width" + s); if (el) levelData["" + lv].sw = el.value;
            el = document.getElementById(P + "g_arrow_size" + s); if (el) levelData["" + lv].as = el.value;
            el = document.getElementById(P + "g_text_color" + s); if (el) levelData["" + lv].tc = el.value;
            el = document.getElementById(P + "g_font_size" + s); if (el) levelData["" + lv].fs = el.value;
            el = document.getElementById(P + "g_font_weight" + s); if (el) levelData["" + lv].fw = el.value;
            el = document.getElementById(P + "g_text_line_spacing_ratio" + s); if (el) levelData["" + lv].tlsr = el.value;
            if (lv == 1) { el = document.getElementById(P + "g_fin_bg_color"); if (el) levelData.fbg = el.value; }
        }

        // 根据 levelData 渲染级别面板
        function renderLevelPanel(lv) {
            var lvp = document.getElementById(pid + "_lvp");
            if (!lvp) return;
            var d = levelData["" + lv];
            var suffix = "_" + lv;
            var h = '';
            h += '<div class="ygt-pl">颜色</div>';
            h += '<div class="ygt-cr"><span>鱼刺颜色</span><div style="display:flex;align-items:center;gap:4px"><div class="ygt-cs" style="background:' + d.finColor + '"><input type="color" id="' + P + 'g_fin_color' + suffix + '" value="' + d.finColor + '"></div><input class="ygt-hx" id="' + P + 'g_fin_color' + suffix + '_hx" value="' + d.finColor + '" maxlength="7"></div></div>';
            if (lv == 1) {
                h += '<div class="ygt-cr"><span>一级鱼翅背景</span><div style="display:flex;align-items:center;gap:4px"><div class="ygt-cs" style="background:' + levelData.fbg + '"><input type="color" id="' + P + 'g_fin_bg_color" value="' + levelData.fbg + '"></div><input class="ygt-hx" id="' + P + 'g_fin_bg_color_hx" value="' + levelData.fbg + '" maxlength="7"></div></div>';
            }
            h += '<div class="ygt-cr"><span>文字颜色</span><div style="display:flex;align-items:center;gap:4px"><div class="ygt-cs" style="background:' + d.tc + '"><input type="color" id="' + P + 'g_text_color' + suffix + '" value="' + d.tc + '"></div><input class="ygt-hx" id="' + P + 'g_text_color' + suffix + '_hx" value="' + d.tc + '" maxlength="7"></div></div>';
            h += '<div class="ygt-pl" style="margin-top:6px">尺寸</div>';
            h += '<div class="ygt-sr"><div class="ygt-sh"><span>鱼刺线宽</span><span id="' + P + 'g_stroke_width' + suffix + '_v">' + d.sw + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_stroke_width' + suffix + '" min="0.5" max="8" step="0.1" value="' + d.sw + '"></div>';
            h += '<div class="ygt-sr"><div class="ygt-sh"><span>箭头大小</span><span id="' + P + 'g_arrow_size' + suffix + '_v">' + d.as + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_arrow_size' + suffix + '" min="2" max="20" value="' + d.as + '"></div>';
            h += '<div class="ygt-pl" style="margin-top:6px">文字大小</div><select class="ygt-fs" id="' + P + 'g_font_size' + suffix + '">';
            var fzs = ["12px","14px","16px","18px","20px","22px","24px","26px","28px","30px"];
            for (var fi = 0; fi < fzs.length; fi++) {
                h += '<option value="' + fzs[fi] + '"' + (d.fs===fzs[fi]?" selected":"") + '>' + fzs[fi] + '</option>';
            }
            h += '</select>';
            h += '<div class="ygt-pl" style="margin-top:6px">字体粗细</div>';
            h += '<div class="ygt-sr"><div class="ygt-sh"><span id="' + P + 'g_font_weight' + suffix + '_v">' + d.fw + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_font_weight' + suffix + '" min="100" max="900" step="100" value="' + d.fw + '"></div>';
            h += '<div class="ygt-pl" style="margin-top:6px">文字线间距</div>';
            h += '<div class="ygt-sr"><div class="ygt-sh"><span>比例</span><span id="' + P + 'g_text_line_spacing_ratio' + suffix + '_v">' + d.tlsr + '</span></div><input type="range" class="ygt-sl" id="' + P + 'g_text_line_spacing_ratio' + suffix + '" min="0" max="3" step="0.2" value="' + d.tlsr + '"></div>';
            lvp.innerHTML = h;
            bindColorSwatches();
            ['g_stroke_width','g_arrow_size','g_font_weight','g_text_line_spacing_ratio'].forEach(function(sid) {
                var sl = document.getElementById(P + sid + suffix);
                var sv = document.getElementById(P + sid + suffix + '_v');
                if (sl && sv) { sl.oninput = function() { sv.innerText = this.value; }; }
            });
            ['g_fin_color','g_text_color'].forEach(function(cid) {
                var ce = document.getElementById(P + cid + suffix);
                var he = document.getElementById(P + cid + suffix + '_hx');
                if (ce && he) {
                    ce.oninput = function() { this.parentNode.style.background = this.value; he.value = this.value; };
                    he.oninput = function() { var v = this.value; if(/^#[0-9a-fA-F]{3,6}$/.test(v)){ ce.value = v; ce.parentNode.style.background = v; } };
                }
            });
            if (lv == 1) {
                var fbg = document.getElementById(P + 'g_fin_bg_color');
                var fbh = document.getElementById(P + 'g_fin_bg_color_hx');
                if (fbg && fbh) {
                    fbg.oninput = function() { this.parentNode.style.background = this.value; fbh.value = this.value; };
                    fbh.oninput = function() { var v = this.value; if(/^#[0-9a-fA-F]{3,6}$/.test(v)){ fbg.value = v; fbg.parentNode.style.background = v; } };
                }
            }
        }

        // 级别选项卡切换：先保存当前级别数据，再渲染新级别
        var lvtabs = document.querySelectorAll("#" + pid + "_lvt .ygt-pk");
        for (var ti = 0; ti < lvtabs.length; ti++) {
            lvtabs[ti].onclick = function() {
                saveCurrentLevel(); // 保存当前编辑值
                for (var tj = 0; tj < lvtabs.length; tj++) lvtabs[tj].classList.remove("act");
                this.classList.add("act");
                currentLv = parseInt(this.getAttribute("data-lv"));
                renderLevelPanel(currentLv);
            };
        }
        // 初始化显示一级面板
        renderLevelPanel(1);

        // 辅助函数：用预设属性更新自定义面板的所有控件
        function applyPresetToPanel(pset) {
            var m = presetMap[pset] || presetMap["ygt6"];
            // 全局颜色
            var gColorIds = ["g_fill","g_spine_color","g_bg_color_important","g_text_color_important","g_bg_color","g_title_color"];
            for (var ci = 0; ci < gColorIds.length; ci++) {
                var el = document.getElementById(P + gColorIds[ci]);
                var he = document.getElementById(P + gColorIds[ci] + "_hx");
                var val = (gColorIds[ci] === "g_title_color") ? (m[gColorIds[ci]] || m["g_fill"] || "#333333") : (m[gColorIds[ci]] || "#333333");
                if (el) { el.value = val; el.parentNode.style.background = val; }
                if (he) { he.value = val; }
            }
            // 鱼脊线宽
            var ml = document.getElementById(P + "g_middle_line_width");
            var mv = document.getElementById(P + "g_middle_line_width_v");
            if (ml && mv) { ml.value = m["g_middle_line_width"] || 3; mv.innerText = m["g_middle_line_width"] || 3; }
            // 组间距
            var gs = document.getElementById(P + "g_group_spacing");
            var gsv = document.getElementById(P + "g_group_spacing_v");
            if (gs && gsv) { gs.value = m["g_group_spacing"] || 30; gsv.innerText = m["g_group_spacing"] || 30; }
            // 同步 levelData 为预设值（三个级别 + 背景）
            levelData["1"] = { finColor: m["g_fin_color_1"] || m["g_fin_color"], sw: m["g_stroke_width_1"] || "2", as: m["g_arrow_size_1"] || 8, tc: m["g_text_color_1"] || "#fff", fs: m["g_font_size_1"] || "18px", fw: m["g_font_weight_1"] || "700", tlsr: String(m["g_text_line_spacing_ratio_1"] || 0) };
            levelData["2"] = { finColor: m["g_fin_color_2"] || m["g_fin_color"], sw: m["g_stroke_width_2"] || "1", as: m["g_arrow_size_2"] || 5, tc: m["g_text_color_2"] || m["g_fin_color"], fs: m["g_font_size_2"] || "14px", fw: m["g_font_weight_2"] || "700", tlsr: String(m["g_text_line_spacing_ratio_2"] || 0.4) };
            levelData["3"] = { finColor: m["g_fin_color_3"] || m["g_fin_color"], sw: m["g_stroke_width_3"] || "0.8", as: m["g_arrow_size_3"] || 3, tc: m["g_text_color_3"] || m["g_fin_color"], fs: m["g_font_size_3"] || "12px", fw: m["g_font_weight_3"] || "400", tlsr: String(m["g_text_line_spacing_ratio_3"] || 0.4) };
            levelData.fbg = m["g_fin_bg_color"] || g_fin_bg_color;
            // 刷新当前级别面板
            renderLevelPanel(currentLv);
        }
        var custBtn = document.getElementById(P + "custBtn");
        var cmPanel = document.getElementById(pid + "_cm");
        var customPanelVisible = false;
        // 记录当前鱼头鱼尾来源（预设风格按钮决定）
        var activeFishPreset = actP !== "custom" ? actP : (g_fish_preset && presetMap[g_fish_preset] ? g_fish_preset : "ygt6");
        // "自定义"按钮：切换面板显示/隐藏
        custBtn.onclick = function() {
            customPanelVisible = !customPanelVisible;
            cmPanel.style.display = customPanelVisible ? "block" : "none";
            custBtn.textContent = customPanelVisible ? "关闭自定义" : "自定义";
            if (customPanelVisible) {
                custBtn.classList.add("act");
                // 展开时取消所有预设按钮的高亮
                var presetBtns = document.querySelectorAll("#" + pid + " .ygt-pk[data-preset]");
                for (var j = 0; j < presetBtns.length; j++) {
                    if (presetBtns[j].getAttribute("data-preset") !== "custom") presetBtns[j].classList.remove("act");
                }
            } else {
                // 关闭自定义面板：恢复到当前激活的预设风格渲染
                custBtn.classList.remove("act");
                var restorePreset = activeFishPreset;
                if (restorePreset && presetMap[restorePreset]) {
                    // 高亮当前预设按钮
                    var presetBtns2 = document.querySelectorAll("#" + pid + " .ygt-pk[data-preset]");
                    for (var k = 0; k < presetBtns2.length; k++) {
                        if (presetBtns2[k].getAttribute("data-preset") === restorePreset) {
                            presetBtns2[k].classList.add("act");
                        }
                    }
                    // 重新渲染预设风格
                    var curDir = document.getElementById(P+"dir").value;
                    pe.innerHTML = ""; draw_ygt3(datas, panelId, title, restorePreset, showsave, curDir, onSave);
                }
            }
        };
        // 预设风格按钮
        var presetBtns = document.querySelectorAll("#" + pid + " .ygt-pk[data-preset]");
        for (var bi = 0; bi < presetBtns.length; bi++) {
            var btn = presetBtns[bi];
            var pv = btn.getAttribute("data-preset");
            if (pv === "custom") continue; // 跳过自定义按钮
            btn.onclick = function() {
                var presetVal = this.getAttribute("data-preset");
                if (customPanelVisible) {
                    // 自定义面板展开时：填充预设属性到面板
                    for (var j = 0; j < presetBtns.length; j++) {
                        var bv = presetBtns[j].getAttribute("data-preset");
                        if (bv !== "custom") presetBtns[j].classList.remove("act");
                    }
                    this.classList.add("act");
                    activeFishPreset = presetVal;
                    applyPresetToPanel(presetVal);
                } else {
                    // 自定义面板隐藏时：直接渲染预设风格
                    var curDir = document.getElementById(P+"dir").value;
                    pe.innerHTML = ""; draw_ygt3(datas, panelId, title, presetVal, showsave, curDir, onSave);
                }
            };
        }
        // 鱼脊线宽全局 slider
        var mlEl = document.getElementById(P + "g_middle_line_width");
        var mlV = document.getElementById(P + "g_middle_line_width_v");
        if (mlEl && mlV) { mlEl.oninput = function() { mlV.innerText = this.value; }; }
        // 组间距 slider
        var gsEl = document.getElementById(P + "g_group_spacing");
        var gsV = document.getElementById(P + "g_group_spacing_v");
        if (gsEl && gsV) { gsEl.oninput = function() { gsV.innerText = this.value; }; }
        // 颜色色块点击事件（全局 + 级别面板通用）
        function bindColorSwatches() {
            var sws = document.querySelectorAll("#" + pid + " .ygt-cs");
            for (var swi = 0; swi < sws.length; swi++) {
                (function(sw) { sw.onclick = function(e) { var inp = this.querySelector("input"); if (inp && e.target !== inp) inp.click(); }; })(sws[swi]);
            }
            var cins = document.querySelectorAll("#" + pid + " .ygt-cs input");
            for (var cj = 0; cj < cins.length; cj++) {
                (function(inp) { inp.oninput = function() { this.parentNode.style.background = this.value; }; })(cins[cj]);
            }
        }
        bindColorSwatches();
        // 全局颜色 hex 输入同步
        ["g_fill","g_spine_color","g_title_color","g_bg_color_important","g_text_color_important","g_bg_color"].forEach(function(cid) {
            var ce = document.getElementById(P + cid), he = document.getElementById(P + cid + "_hx");
            if (ce && he) {
                ce.oninput = function() { this.parentNode.style.background = this.value; he.value = this.value; };
                he.oninput = function() { var v = this.value; if(/^#[0-9a-fA-F]{3,6}$/.test(v)){ ce.value = v; ce.parentNode.style.background = v; } };
            }
        });
        document.getElementById(P + "ap").onclick = function() {
            saveCurrentLevel(); // 保存当前级别编辑值
            function gv(id) { var el = document.getElementById(P + id); return el ? el.value : ""; }
            var so = JSON.stringify([{ ygtstyle:"custom",
                g_fill:gv("g_fill"),
                g_spine_color:gv("g_spine_color"),
                g_fin_color: g_fin_color,
                g_text_color: g_text_color,
                g_title_color:gv("g_title_color"),
                g_bg_color:gv("g_bg_color"),
                g_bg_color_important:gv("g_bg_color_important"),
                g_text_color_important:gv("g_text_color_important"),
                g_middle_line_width:gv("g_middle_line_width"),
                g_group_spacing:gv("g_group_spacing"),
                // 一级鱼刺 (来自 levelData)
                g_fin_color_1:levelData["1"].finColor,
                g_stroke_width_1:levelData["1"].sw,
                g_arrow_size_1:levelData["1"].as,
                g_text_color_1:levelData["1"].tc,
                g_font_size_1:levelData["1"].fs,
                g_font_weight_1:levelData["1"].fw,
                g_text_line_spacing_ratio_1:levelData["1"].tlsr,
                // 二级鱼刺
                g_fin_color_2:levelData["2"].finColor,
                g_stroke_width_2:levelData["2"].sw,
                g_arrow_size_2:levelData["2"].as,
                g_text_color_2:levelData["2"].tc,
                g_font_size_2:levelData["2"].fs,
                g_font_weight_2:levelData["2"].fw,
                g_text_line_spacing_ratio_2:levelData["2"].tlsr,
                // 三级鱼刺
                g_fin_color_3:levelData["3"].finColor,
                g_stroke_width_3:levelData["3"].sw,
                g_arrow_size_3:levelData["3"].as,
                g_text_color_3:levelData["3"].tc,
                g_font_size_3:levelData["3"].fs,
                g_font_weight_3:levelData["3"].fw,
                g_text_line_spacing_ratio_3:levelData["3"].tlsr,
                g_font_size_3:levelData["3"].fs,
                // 一级鱼翅背景
                g_fin_bg_color:levelData.fbg,
                g_fish_preset:activeFishPreset }]);
            var curDir2 = document.getElementById(P+"dir").value;
            // 只清除 Raphael SVG 画布，保留样式面板不关闭
            var svgs = pe.querySelectorAll("svg");
            for (var s = 0; s < svgs.length; s++) svgs[s].parentNode.removeChild(svgs[s]);
            draw_ygt3(datas, panelId, title, so, showsave, curDir2, onSave);
        };
    }
    function draw_exportmenu() {
        function getMousePos(event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            //alert('x: ' + x + '\ny: ' + y);
            return {
                'x': x,
                'y': y
            };
        }

        function createAndDownloadFile(fileName, content) {
            var aTag = document.createElement('a');
            var blob = new Blob([content]);
            aTag.download = fileName;
            aTag.href = URL.createObjectURL(blob);
            aTag.click();
            URL.revokeObjectURL(blob);
        }


        function getOffsetParent(obj) {

            var el = obj;
            // Since el might be empty we have to check el itself and
            // can not do something like el.children().first().offsetParent()
            el = el.offsetParent;
            while (el) {
                if (el.style.position === "relative" || el.style.position === "absolute" || el.style.position === "fixed")
                    return el;
                else
                    el = el.offsetParent;
            }
            return el;
        }

        if ((showsave == undefined || showsave == true) && $("#saveas_" + panel).length == 0) {

            //paper.oncontextmenu(function(){ alert(1);});


            $("<ul id='saveas_" + panel + "' class='ygtcontextmenu'><li><a class='export' href='javascript:void(0)'>导出PNG</a></li><li><a class='export' href='javascript:void(0)'>导出SVG</a></li></ul>").on("click", "a", function() {

                if ($(this).text() == "导出SVG") {
                    var svg = document.getElementById(panel).children[0];
                    createAndDownloadFile("ygt" + title + ".svg", svg.outerHTML);

                } else {
                    var svg = document.getElementById(panel).children[0];

                    if (window.navigator.userAgent.toLowerCase().indexOf("msie") != -1 && (!document.documentMode || document.documentMode < 8)) {
                        ExpSvg2Png(paper.toSVG(), "ygt" + title + ".png");
                    } else {
                        saveSvgAsPng(svg, "ygt" + title + ".png");
                    }
                }
            }).appendTo($("#" + panel)); //.appendTo($("#"+panel).parent());


            $("#" + panel).contextmenu(function(e) {
                var pos = getMousePos(e)
                    // 获取窗口尺寸
                var winWidth = $(document).width();
                var winHeight = $(document).height();

                var l_top = 0; // $("#"+panel).parent().offset().top;
                var l_left = 0; // $("#"+panel).parent().offset().left;
                var p = getOffsetParent(document.getElementById(panel));


                //debugger;
                var mouseX, mouseY;
                if (p != null) {
                    var e = e || window.event;

                    l_left = e.clientX - $("#" + panel).offset().left;
                    l_top = e.clientY - $("#" + panel).offset().top;

                    mouseX = l_left;
                    mouseY = l_top;


                } else {

                    // 鼠标点击位置坐标
                    mouseX = pos.x - l_left;
                    mouseY = pos.y - l_top;
                }
                // ul标签的宽高
                var menuWidth = $("#saveas_" + panel).width();
                var menuHeight = $("#saveas_" + panel).height();
                // 最小边缘margin(具体窗口边缘最小的距离)
                var minEdgeMargin = 10;
                // 以下判断用于检测ul标签出现的地方是否超出窗口范围
                // 第一种情况：右下角超出窗口
                if (mouseX + menuWidth + minEdgeMargin >= winWidth &&
                    mouseY + menuHeight + minEdgeMargin >= winHeight) {
                    menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
                    menuTop = mouseY - menuHeight - minEdgeMargin + "px";
                }
                // 第二种情况：右边超出窗口
                else if (mouseX + menuWidth + minEdgeMargin >= winWidth) {
                    menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
                    menuTop = mouseY + minEdgeMargin + "px";
                }
                // 第三种情况：下边超出窗口
                else if (mouseY + menuHeight + minEdgeMargin >= winHeight) {
                    menuLeft = mouseX + minEdgeMargin + "px";
                    menuTop = mouseY - menuHeight - minEdgeMargin + "px";
                }
                // 其他情况：未超出窗口
                else {
                    menuLeft = mouseX + minEdgeMargin + "px";
                    menuTop = mouseY + minEdgeMargin + "px";
                };
                // ul菜单出现
                $("#saveas_" + panel).css({
                    "left": menuLeft,
                    "top": menuTop
                }).show();
                // 阻止浏览器默认的右键菜单事件
                return false;
            });
            // 点击之后，右键菜单隐藏
            $("#" + panel).click(function() {
                $(".contextmenu").hide();
            });


        }


    }





    function myFilter(a_list, fn) {
        //新建一个数组
        var newArray = [];
        //循环判断是否符合函数fn
        var pos = 0;
        for (var i = 0; i < a_list.length; i++) {
            if (fn(a_list[i])) {
                a_list[i].pos = pos;

                a_list[i].prenode = [];
                if (newArray.length > 0) {
                    for (var j = 0; j < newArray.length; j++) {
                      
                        a_list[i].prenode.push(newArray[j]);
                        
                    }
                }

                newArray.push(a_list[i]);
                pos++;
            }
        }
        //返回新数组
        return newArray;
    }

    function list2tree(a_list, a_pid, a_pnode) {
        g_level++;
        var ret = myFilter(a_list, function(item) {
            if (item.PARENT === a_pid) {
                item.id = item.ID;
                item.name = strSplit(item.NAME, 12);
                item.title = item.NAME;
                item.sjid = item.PARENT;
                item.pnode = a_pnode;
                item.important = item.IMPORTANT == undefined ? "0" : item.IMPORTANT; 
                item.url = item.URL == undefined ? "" : item.URL; 
                item.opentype = item.OPENTYPE == undefined ? "" : item.OPENTYPE; 
                item.jb = g_level;
                item.children = list2tree(a_list, item.ID, item);
                if (item.jb==4 && item.children.length==0)
                {
                    item.last4=true;
                }
                else{

                    item.last4=false; 
                }
                return true
            }
            return false
        });
        g_level--;
        return ret;
    }


    // 最小值
    function min(arr) {
        var min = arr[0];
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            if (arr[i] < min) min = arr[i]
        }
        return min
    }
    // 最大值
    function max(arr) {
        var max = arr[0];
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            if (arr[i] > max) max = arr[i]
        }
        return max
    }

    /*  
     * 自己绘制线段箭头   //chrome 支持
     */
    function drawArrowLine(line_id, a_size) {
        //analysis line  
        var line = paper.getById(line_id);
        //get last points  
        var length = line.attrs.path.length;
        var x1 = line.attrs.path[length - 1][1]; //单线段起点  
        var y1 = line.attrs.path[length - 1][2]; //单线段起点  
        var x2 = line.attrs.path[length - 2][1]; //单线段终点  
        var y2 = line.attrs.path[length - 2][2]; //单线段终点  
        //get last angle  
        var angle = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度  
        var angle_45_one = Raphael.rad(angle - 30); //API方法转变为弧度  
        var angle_45_two = Raphael.rad(angle + 30); //API方法转变为弧度  
        //arrow points求出箭头的双向点  
        var angle_x1 = x1 - Math.cos(angle_45_one) * a_size;
        var angle_y1 = y1 - Math.sin(angle_45_one) * a_size;
        var angle_x2 = x1 - Math.cos(angle_45_two) * a_size;
        var angle_y2 = y1 - Math.sin(angle_45_two) * a_size;
        //return  
        var result = ["M", angle_x1, angle_y1, "L", x1, y1, "L", angle_x2, angle_y2, "z"];
        return result;
    }


    function clear() {
        paper.clear();
        shapes = {};
    }

    //暂时无用
    function get_Path_position(Path) {
        if (isNaN(Path)) {
            return {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            }
        }
        x1 = Path.substring(1, Path.indexOf("L")).split(" ")[0];
        y1 = Path.substring(1, Path.indexOf("L")).split(" ")[1];
        x2 = Path.substring(Path.indexOf("L") + 1).split(" ")[0];
        y2 = Path.substring(Path.indexOf("L")).split(" ")[1];
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        }
    }



    function draw_middle_line(a_x1, a_y1, a_x2, a_y2) { 
        if (ygtstyle == "ygt6") {
            // ygt6: 单线实色蓝色鱼脊
            var line_master = paper.path("M " + a_x1 + " " + a_y1 + " " + a_x2 + " " + a_y2 + "").attr({
                "stroke-width": g_middle_line_width,
                "stroke": g_spine_color
            });
            return line_master;
        }
        var line_master = drawLine(a_x1, a_y1, a_x2, a_y2, g_middle_line_width, g_spine_color);
        //line_master.attr({
        //     stroke: color_back_yg,
        //     fill: color_back_yg
        //  });
        //alert(g_head);
        //alert(g_center);
        //var line_master = paper.path("M"+x+" "+(y -45)+" L "+x+" "+(y +45)+" S "+(x + pos.width + 40)+" , "+(y + 40 )+"  "+(x + pos.width +40)+" , "+y+"L "+(x + pos.width + 40)+"  "+y+" S " +(x + pos.width + 40)+" , "+(y - 40 )+"  "+x+" , "+(y - 45) ).attr({ "stroke-width": 1, "stroke": color_back_yg  , "fill": color_back_yg });


        return line_master;
    }


    /*  
     * 自己绘制线段箭头   //ie 支持
     */
    function drawArrow(x1, y1, x2, y2, a_size) {
        //get last angle  
        var angle = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度  
        var angle_45_one = Raphael.rad(angle - 30); //API方法转变为弧度  
        var angle_45_two = Raphael.rad(angle + 30); //API方法转变为弧度  
        //arrow points求出箭头的双向点  
        var angle_x1 = x1 - Math.cos(angle_45_one) * a_size;
        var angle_y1 = y1 - Math.sin(angle_45_one) * a_size;
        var angle_x2 = x1 - Math.cos(angle_45_two) * a_size;
        var angle_y2 = y1 - Math.sin(angle_45_two) * a_size ;
        //return  
        var result = ["M", angle_x1, angle_y1, "L", x1, y1, "L", angle_x2, angle_y2, "z"];
        return result;
    }

    var g_i_pos = 1;
    //change1
    function draw_leaf_topaper(a_leaf, a_x1, a_y1) {

     
        for (var key in a_leaf.leaf) {
            var _pn = a_leaf.leaf[key];
            // 获取当前节点的级别，用于选择对应的鱼翅样式
            var jb_level = _pn.objs[1] ? _pn.objs[1].jb : 2;
            var _fin_color, _stroke_width, _arrow_size;
            if (jb_level == 1) {
                _fin_color = g_fin_color_1; _stroke_width = g_stroke_width_1; _arrow_size = g_arrow_size_1;
            } else if (jb_level == 2) {
                _fin_color = g_fin_color_2; _stroke_width = g_stroke_width_2; _arrow_size = g_arrow_size_2;
            } else {
                _fin_color = g_fin_color_3; _stroke_width = g_stroke_width_3; _arrow_size = g_arrow_size_3;
            }

            for (var i = 0; i < _pn.objs.length; i++) {
                var item = _pn.objs[i];

                if (item.type == "line") {
                    drawLine(item.x1 + a_x1, item.y1 + a_y1, item.x2 + a_x1, item.y2 + a_y1, _stroke_width, _fin_color);

                    if (window.__YGT_LEGACY_COLLECT__) {
                        var __lr = window.__YGT_LEGACY_COLLECT__.items.find(function (r) { return r.id === (_pn._legacy_id || _pn.item_id); });
                        if (!__lr) {
                            __lr = { id: (_pn._legacy_id || _pn.item_id), parentId: (_pn._legacy_parent || _pn.sjid), level: _pn.jb, order: _pn.pos, angle: _pn.angle };
                            window.__YGT_LEGACY_COLLECT__.items.push(__lr);
                        }
                        __lr.line = { x1: item.x1 + a_x1, y1: item.y1 + a_y1, x2: item.x2 + a_x1, y2: item.y2 + a_y1 };
                    }

                    var Arrow = drawArrow2(item.x2 + a_x1, item.y2 + a_y1, item.x1 + a_x1, item.y1 + a_y1, _arrow_size);

                    paper.path(Arrow).attr({ "stroke-width": 1, "stroke": _fin_color, "fill": _fin_color });
                } else {
                    //change1
                    var _pn = a_leaf.leaf[key];
                    var _txt = drawText(item.x1 + a_x1, item.y1 + a_y1, item.text, item);
                    if (window.__YGT_LEGACY_COLLECT__) {
                        var __tr = window.__YGT_LEGACY_COLLECT__.items.find(function (r) { return r.id === (_pn._legacy_id || _pn.item_id); });
                        if (!__tr) {
                            __tr = { id: (_pn._legacy_id || _pn.item_id), parentId: (_pn._legacy_parent || _pn.sjid), level: _pn.jb, order: _pn.pos, angle: _pn.angle };
                            window.__YGT_LEGACY_COLLECT__.items.push(__tr);
                        }
                        __tr.text = { x: item.x1 + a_x1, y: item.y1 + a_y1, width: item.textsize && item.textsize.width, height: item.textsize && item.textsize.height };
                    }
                    if (_pn && _pn.item_id) {
                        _txt.data("nodeId", _pn.item_id);
                        _txt.data("nodeName", item.text);
                        (function(te, nid, nnm) {
    var clickCount = 0;
    var clickTimer = null;
    te.mousedown(function(e) {
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(function() { clickCount = 0; }, 400);
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            showInlineEditor(this, nid, nnm);
        }
        // Prevent text selection
        if (e && e.preventDefault) e.preventDefault();
        return false;
    });
})(_txt, _pn.item_id, item.text);
                    }

                }

            }
        }
    }




    var g_centerX = 500;
    var g_centerY = 500;
    var g_list = [];
    var g_height1 = 60;
    var g_height2 = 10;
    var g_height3 = 140;//尾巴（原40，延长30）
    var g_deg = 60
    var g_degree = 60; //线角度定义
    var g_leaf1_offset = 15; //一级节点边框偏移量，控制鱼骨线末端与边框边缘对齐的间距

    function get_height2(pos) {
        if (pos == undefined) {
            return g_height1;

        } else {
            var hh = 0;
            for (var i = 0; i < pos; i++) {
                if (i % 2 == 1) {
                    hh += g_height2;
                } else {
                    hh += g_height1;
                }
            }
            return hh;
        }
    }

 

    function get_max_min_xy(temp) {
        var max_min_xy = temp.max_min_xy;
        max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[0].x1);
        max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[0].x2);
        max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[1].x1);

        max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[0].y1);
        max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[0].y2);
        max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[1].y1);

        max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[0].x1);
        max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[0].x2);
        max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[1].x1);

        max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[0].y1);
        max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[0].y2);
        max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[1].y1);
        temp.max_min_xy = max_min_xy;
        if (temp.children != null) {
            for (var ii = 0; ii < temp.children.length; ii++) {
                if (temp.children[ii].objs != undefined) {
                    max_min_xy.x1 = Math.min(max_min_xy.x1, temp.children[ii].objs[0].x1);
                    max_min_xy.x1 = Math.min(max_min_xy.x1, temp.children[ii].objs[0].x2);
                    max_min_xy.x1 = Math.min(max_min_xy.x1, temp.children[ii].objs[1].x1);

                    max_min_xy.y1 = Math.min(max_min_xy.y1, temp.children[ii].objs[0].y1);
                    max_min_xy.y1 = Math.min(max_min_xy.y1, temp.children[ii].objs[0].y2);
                    max_min_xy.y1 = Math.min(max_min_xy.y1, temp.children[ii].objs[1].y1);

                    max_min_xy.x2 = Math.max(max_min_xy.x2, temp.children[ii].objs[0].x1);
                    max_min_xy.x2 = Math.max(max_min_xy.x2, temp.children[ii].objs[0].x2);
                    max_min_xy.x2 = Math.max(max_min_xy.x2, temp.children[ii].objs[1].x1);

                    max_min_xy.y2 = Math.max(max_min_xy.y2, temp.children[ii].objs[0].y1);
                    max_min_xy.y2 = Math.max(max_min_xy.y2, temp.children[ii].objs[0].y2);
                    max_min_xy.y2 = Math.max(max_min_xy.y2, temp.children[ii].objs[1].y1);

                    get_max_min_xy(temp.children[ii]);
                }
            }
            temp.max_min_xy = max_min_xy;
        }
        return max_min_xy;
    }

    function update_max_min_xy(temp) {
        var max_min_xy = temp.max_min_xy;
        if (temp.objs != undefined) {
            max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[0].x1);
            max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[0].x2);
            max_min_xy.x1 = Math.min(max_min_xy.x1, temp.objs[1].x1);

            max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[0].y1);
            max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[0].y2);
            max_min_xy.y1 = Math.min(max_min_xy.y1, temp.objs[1].y1);

            max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[0].x1);
            max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[0].x2);
            max_min_xy.x2 = Math.max(max_min_xy.x2, temp.objs[1].x1);

            max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[0].y1);
            max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[0].y2);
            max_min_xy.y2 = Math.max(max_min_xy.y2, temp.objs[1].y1);
            temp.max_min_xy = max_min_xy;

        }

        if (temp.pnode != null) {
            for (var ii = 0; ii < temp.pnode.children.length; ii++) {
                if (temp.pnode.children[ii].objs != undefined && temp.pnode.max_min_xy != undefined) {
                    temp.pnode.max_min_xy.x1 = Math.min(temp.pnode.max_min_xy.x1, temp.pnode.children[ii].objs[0].x1);
                    temp.pnode.max_min_xy.x1 = Math.min(temp.pnode.max_min_xy.x1, temp.pnode.children[ii].objs[0].x2);
                    temp.pnode.max_min_xy.x1 = Math.min(temp.pnode.max_min_xy.x1, temp.pnode.children[ii].objs[1].x1);

                    temp.pnode.max_min_xy.y1 = Math.min(temp.pnode.max_min_xy.y1, temp.pnode.children[ii].objs[0].y1);
                    temp.pnode.max_min_xy.y1 = Math.min(temp.pnode.max_min_xy.y1, temp.pnode.children[ii].objs[0].y2);
                    temp.pnode.max_min_xy.y1 = Math.min(temp.pnode.max_min_xy.y1, temp.pnode.children[ii].objs[1].y1);

                    temp.pnode.max_min_xy.x2 = Math.max(temp.pnode.max_min_xy.x2, temp.pnode.children[ii].objs[0].x1);
                    temp.pnode.max_min_xy.x2 = Math.max(temp.pnode.max_min_xy.x2, temp.pnode.children[ii].objs[0].x2);
                    temp.pnode.max_min_xy.x2 = Math.max(temp.pnode.max_min_xy.x2, temp.pnode.children[ii].objs[1].x1);

                    temp.pnode.max_min_xy.y2 = Math.max(temp.pnode.max_min_xy.y2, temp.pnode.children[ii].objs[0].y1);
                    temp.pnode.max_min_xy.y2 = Math.max(temp.pnode.max_min_xy.y2, temp.pnode.children[ii].objs[0].y2);
                    temp.pnode.max_min_xy.y2 = Math.max(temp.pnode.max_min_xy.y2, temp.pnode.children[ii].objs[1].y1);

                }
            }
            update_max_min_xy(temp.pnode);
        }
        return max_min_xy;
    }


    function get_text_xy(item, objs) {
        var x = objs[1].x1;
        var y = objs[1].y1;
        var height = objs[1].textsize.height;
        var width = objs[1].textsize.width;
        var important = item.important==undefined?"0":item.important;
      
        if (item == null) {
            return { end_x: x, end_y: y };
        } else {
            var angle = Math.round(item.angle, 3);
            var isLeaf1 = (item.jb == 1 || item.jb == "1");
            var isLeaf2 = (item.jb == 2 || item.jb == "2");
            var ratio = isLeaf1 ? g_text_line_spacing_ratio_1 : (isLeaf2 ? g_text_line_spacing_ratio_2 : g_text_line_spacing_ratio_3);
            var textSpacing = Math.round(height * ratio);

            if (angle == 0 || angle == 360) {
                x = x - Math.round(width, 3) / 2 - 2 - textSpacing;
            } else if (angle == 180) {
                x = x + Math.round(width, 3) / 2 + 2 + textSpacing;
            } else if (angle > 0 && angle < 180) {
                y = y - Math.round(height / 2, 3) - textSpacing;
            } else if (angle > 180 && angle < 360) {
                y = y + Math.round(height / 2, 3) + textSpacing;
            }

            return { end_x: Math.round(x, 3), end_y: Math.round(y, 3) };
        }

    }

    function get_degree(item) { 
        var index = item.pos + 1;
        var angle = g_degree;
        if (item.jb == 1) {
            //画上鱼刺
            if (index % 2 == 1) {
                angle = angle;
            } else //画下鱼刺
            {
                angle = (360 - g_degree);
            }

        } else if (item.jb == 3 || item.jb == 5) {
            //画上鱼刺
            if (index % 2 == 1) {
                if (item.pnode.angle == 0 || item.pnode.angle == 360) {
                    angle = angle;
                } else {
                    angle = 180 - angle;
                }
            } else //画下鱼刺
            {
                if (item.pnode.angle == 180) {
                    angle = 180 + angle;
                } else {
                    angle = 360 - angle;
                }
            }
        } else if (item.jb == 2 || item.jb == 4) {

            //画左鱼刺
            if (index % 2 == 1) {
                angle = 0;
            } else //画右鱼刺
            {
                angle = 180;
            }
        }
        return angle;
    }

    //默认在坐标轴左上区域内画鱼骨图(90-180坐标轴内)，命名为1位置，顺时针依次为234
    function get_area_xy(angle) {
        if (angle > 0 && angle < 90) {
            return 1;
        } else if (angle > 90 && angle < 180) {
            return 2;
        } else if (angle > 180 && angle < 270) {
            return 3;
        } else if (angle > 270 && angle < 360) {
            return 4;
        } else if (angle == 360 || angle == 0) {
            return 0;
        } else if (angle == 180) {
            return 180;
        } else {

            return 1;
        }

    }
    //根据节点级别计算鱼刺画的方向及位置
    function get_next_point(deg, item, index, x1, y1, a_height, leaftype) {

        // 根据文字宽度调整：向右游和向左游都调a_height（都加文字宽度的一半）
        var _textSize = getTextSize(item);
        var _textW = (_textSize && _textSize.width > 0) ? Math.round(_textSize.width / 2) : 0;
        if (_textW > 0) {
            // 统一调整 a_height（局部参数），不修改全局 g_height1
            a_height = a_height + _textW;
        }
        
        if (item.pos>0)
        {
            if (item.pos%2==0)
            {
                a_height = a_height + g_height1  ; 
            }
            else{
                a_height = a_height + g_height2 ; 
            } 
        }


        //root 画时 判断上一根root的最大值
    
        var p_angle = 0;
        if (item.p_pnode != null) {
            p_angle = item.p_pnode.angle;
        }
        var area_xy = 0;
        var angle = g_degree;
        if (item.jb == 1) {
            //画上鱼刺
            if (index % 2 == 1) {
                angle = g_degree;
                area_xy = 1;
            } else //画下鱼刺
            {
                angle = 360 - g_degree;
                area_xy = 4;
            }
            end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle)) * Math.cos(Raphael.rad(p_angle)) * -1;
            end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle)) * Math.cos(Raphael.rad(p_angle)) * -1;
        } else if (item.jb == 3 || item.jb == 5) {
            var pangle = item.pnode.angle;

            //画上鱼刺
            if (index % 2 == 1) {
                if (pangle == 0 || pangle == 360) {
                    angle = angle;
                    x1 = x1 - a_height;
                    y1 = y1;
                    end_x = x1 - g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 - g_height1 * Math.sin(Raphael.rad(angle));
                    area_xy = 1;
                } else {
                    angle = angle;
                    x1 = x1 + a_height;
                    y1 = y1;
                    end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 - g_height1 * Math.sin(Raphael.rad(angle));
                    area_xy = 2;

                }
            } else //画下鱼刺
            {
                if (pangle == 0 || pangle == 360) {
                    angle = angle;
                    x1 = x1 - a_height;
                    y1 = y1;
                    end_x = x1 - g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));

                    area_xy = 4;
                } else {
                    angle = angle;
                    x1 = x1 + a_height;
                    y1 = y1;
                    end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));

                    area_xy = 3;
                }
            }

        } else if (item.jb == 2 || item.jb == 4 || item.jb == 6) {

            var pangle = item.pnode.angle;
            area_xy = get_area_xy(angle);
            if (pangle > 0 && pangle < 90) {
                //画左鱼刺
                if (index % 2 == 1) {
                    angle = 0 + deg;
                    x1 = x1 - a_height * Math.cos(Raphael.rad(pangle));
                    y1 = y1 - a_height * Math.sin(Raphael.rad(pangle));
                    end_x = x1 - g_height1;
                    end_y = y1;
                } else //画右鱼刺
                {
                    angle = 0 + deg;
                    x1 = x1 - a_height * Math.cos(Raphael.rad(pangle));
                    y1 = y1 - a_height * Math.sin(Raphael.rad(pangle));
                    end_x = x1 + g_height1;
                    end_y = y1 - g_height1 * Math.sin(Raphael.rad(angle));
                }

            } else if (pangle > 90 && pangle < 180) {
                //画左鱼刺
                if (index % 2 == 0) {
                    angle = 0 + deg;
                    x1 = x1 + a_height * Math.cos(Raphael.rad(g_degree));
                    y1 = y1 - a_height * Math.sin(Raphael.rad(g_degree));
                    end_x = x1 - g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 - g_height1 * Math.sin(Raphael.rad(angle));
                } else //画右鱼刺
                {
                    angle = 0 + deg;
                    x1 = x1 + a_height * Math.cos(Raphael.rad(g_degree));
                    y1 = y1 - a_height * Math.sin(Raphael.rad(g_degree));
                    end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));
                }

            } else if (pangle > 180 && pangle < 270) {
                //画左鱼刺
                if (index % 2 == 1) {
                    angle = 0 + deg;
                    x1 = x1 + a_height * Math.cos(Raphael.rad(pangle)) * -1;
                    y1 = y1 + a_height * Math.sin(Raphael.rad(pangle)) * -1;
                    end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));
                } else //画右鱼刺
                {
                    angle = 0 + deg;
                    x1 = x1 - a_height * Math.cos(Raphael.rad(pangle));
                    y1 = y1 + a_height * Math.sin(Raphael.rad(pangle)) * -1;
                    end_x = x1 - g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));
                }

            } else if (pangle > 270 && pangle < 360) {
                //画左鱼刺
                if (index % 2 == 1) {
                    angle = 0 + deg;
                    x1 = x1 - a_height * Math.cos(Raphael.rad(g_degree));
                    y1 = y1 + a_height * Math.sin(Raphael.rad(g_degree));
                    end_x = x1 - g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));
                } else //画右鱼刺
                {
                    angle = 0 + deg;
                    x1 = x1 - a_height * Math.cos(Raphael.rad(g_degree));
                    y1 = y1 + a_height * Math.sin(Raphael.rad(g_degree));
                    end_x = x1 + g_height1 * Math.cos(Raphael.rad(angle));
                    end_y = y1 + g_height1 * Math.sin(Raphael.rad(angle));
                }

            }

        }
        x1 = Math.round(x1,3);
        y1 = Math.round(y1,3);

        end_x = Math.round(end_x, 3);
        end_y = Math.round(end_y, 3);
        var angle = Raphael.angle(x1, y1, end_x, end_y);
        angle = Math.round(angle, 3)

        if (item.pnode != null && item.pnode["objs"] != null) {

            if (item.pnode.angle == angle || true) {
                item.pnode["objs"][0]["x2"] = x1
                item.pnode["objs"][0]["y2"] = y1;
                item.pnode["objs"][1]["x1"] = x1;
                item.pnode["objs"][1]["y1"] = y1;
                item.pnode["end_x"] = x1;
                item.pnode["end_y"] = y1;
            }
        }
        //API方法获取角度，原直线倾斜度 

        return { x1: x1, y1: y1, end_x: end_x, end_y: end_y, angle: angle };
    }

    function get_height(item) {
        
        var hh = get_height2(item.pos + 1);

        if (item.pnode == null) { 

            return { hh: hh, x: g_centerX, y: g_centerY };

        }
     
        var prenode = item.prenode;
        if (prenode.length == 0) {

            return { hh: hh, x: item.pnode.objs[0].x1, y: item.pnode.objs[0].y1 };
        }
      
        var p_angle = item.pnode.angle;
        var angle = get_degree(item);

        var p_max_min_xy = null;
        var pp_node = null;
        var pp_height= null;
        var xxx = 0;
        var yyy = 0;
        for (var i = prenode.length - 1; i >= 0 && i >= prenode.length - 2; i--) {
            var temp = prenode[i];

            var x1 = temp["objs"][0]["x1"];
            var y1 = temp["objs"][0]["y1"];
            var x2 = temp["objs"][0]["x2"];
            var y2 = temp["objs"][0]["y2"];

            var py_hh = g_height2;
            if (pp_node == null) {
                pp_node = temp;
            }
           
            var angle2 = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度
            angle2 = Math.round(angle2, 3);

            if (angle == angle2 || true) {

                var max_min_xy = get_max_min_xy(temp);
                if (p_max_min_xy == null) {
                    p_max_min_xy = max_min_xy;
                }
                if (angle == 0 || angle == 360 || angle == 180) {
                    var mm_yy = 0;
                    var mm_xx = 0;
                    var p_yy = 0;
                    var p_xx = 0;
                    if (get_area_xy(p_angle) == "1" || get_area_xy(p_angle) == "2") {
                        mm_yy = max_min_xy.y1;
                    } else {
                        mm_yy = max_min_xy.y2;
                    }
                    var temp_hh = (Math.abs(y1 - mm_yy) + py_hh) / Math.sin(Raphael.rad(p_angle)) + 15;

                    if (pp_node.id != temp.id) {

                        if (get_area_xy(p_angle) == "1" || get_area_xy(p_angle) == "2") {
                            if ((mm_yy - pp_node["objs"][0]["y1"]) < 0) {
                                //同轴鱼刺最大值小于前一节点鱼刺，则用前一鱼刺位置计算偏移量
                                hh = temp_hh;
                                xxx = x1;
                                yyy = y1;
                            }
                        } else {
                            if ((mm_yy - pp_node["objs"][0]["y2"]) > 0) {
                                //同轴鱼刺最大值小于前一节点鱼刺，则用前一鱼刺位置计算偏移量
                                hh = temp_hh;
                                xxx = x1;
                                yyy = y1;
                            }
                        }
                    } else {
                        xxx = x1;
                        yyy = y1;
                        hh = temp_hh;
                    }
                } else {
                    if (get_area_xy(angle) == "1") {
                        mm_yy = max_min_xy.y1;
                        mm_xx = max_min_xy.x1;
                        p_yy = p_max_min_xy.y1;
                        p_xx = p_max_min_xy.x1;
                    } else if (get_area_xy(angle) == "2") {
                        mm_yy = max_min_xy.y1;
                        mm_xx = max_min_xy.x2;
                        p_yy = p_max_min_xy.y1;
                        p_xx = p_max_min_xy.x2;
                    } else if (get_area_xy(angle) == "3") {
                        mm_yy = max_min_xy.y2;
                        mm_xx = max_min_xy.x2;
                        p_yy = p_max_min_xy.y2;
                        p_xx = p_max_min_xy.x1;
                    } else if (get_area_xy(angle) == "4") {
                        mm_yy = max_min_xy.y2;
                        mm_xx = max_min_xy.x1;
                        p_yy = p_max_min_xy.y2;
                        p_xx = p_max_min_xy.x1;
                    }
                    //var temp_hh = ( Math.abs(mm_yy - y1 ) + py_hh)/Math.tan(Raphael.rad(g_degree))   ;

                    var temp_hh = Math.abs(mm_xx - x1) + py_hh;

                    if (pp_node.id != temp.id) {
                        if (p_angle == "180") {
                            if (mm_xx - pp_node["objs"][0]["x1"] > 0) {
                                //同轴鱼刺最大值小于前一节点鱼刺，则用前一鱼刺位置计算偏移量
                                hh = temp_hh;
                                xxx = x1;
                                yyy = y1;
                            }
                        } else {
                            if (mm_xx - pp_node["objs"][0]["x1"] < 0) {
                                //同轴鱼刺最大值小于前一节点鱼刺，则用前一鱼刺位置计算偏移量
                                hh = temp_hh;
                                xxx = x1;
                                yyy = y1;
                            }
                        }

                    } else {
                        xxx = x1;
                        yyy = y1;
                        hh = temp_hh;
                    }
                }
                hh = Math.abs(hh);
                if (pp_height==null)
                {
                    pp_height = hh;
                }

                if (item.pos % 2 == 1 )
                {
                    hh = g_height2;
                }
                else{
                    if (pp_height > hh)
                    {
                        hh = pp_height;
                    }
                } 
            }
        }

        if (prenode.length > 0) {
            return { hh: hh, x: xxx, y: yyy };
        } else {
            return { hh: hh, x: item.pnode.objs[0].x1, y: item.pnode.objs[0].y1 };
        }


    }

    function get_fish_deep(index, item, x1, y1, deg, leaftype) {
        g_list.push(item);
        var aheight = get_height(item);

        var abc = get_leaf(index, item, aheight.x, aheight.y, deg, aheight.hh, leaftype);
        x1 = abc.end_x;
        y1 = abc.end_y;
        item["objs"] = abc.objs;
        item["end_x"] = x1;
        item["end_y"] = y1;
        item["angle"] = Math.round(abc.angle, 3);
        item["max_min_xy"] = { x1: min(item["list_x"]), y1: min(item["list_y"]), x2: max(item["list_x"]), y2: max(item["list_y"]) };
        update_max_min_xy(item);
       if ("001010015001"== item.id || "0010100130031"==item.id )
       { 

       }
        if (item.children.length > 0) {
            var temp_x = x1;
            var temp_y = y1; 
            for (var ii = 0; ii < item.children.length; ii++) {
                get_fish_deep(ii + 1, item.children[ii], temp_x, temp_y, deg, leaftype);
                //最后一根鱼刺计算，刺头
                if (ii == item.children.length - 1) {
                    if (item != null && item.objs != null) {
                        if (item.angle == 0 || item.angle == 360 || item.angle == 180) {
                            xxx = g_height3 * Math.cos(Raphael.rad(item.angle)) * -1;
                            yyy = 0;
                        } else {
                            var p_angle = 0;
                            if (item.pnode != null) {
                                p_angle = item.pnode.angle;
                            }
                            xxx = Math.round(Math.cos(Raphael.rad(item.angle)) * g_height3 * -1, 3);
                            yyy = Math.round(Math.sin(Raphael.rad(item.angle)) * g_height3 * -1, 3);

                        }
                        item["objs"][0]["x2"] = item["objs"][0]["x2"] + xxx;
                        item["objs"][0]["y2"] = item["objs"][0]["y2"] + yyy;
                        var cc = get_text_xy(item, item.objs);
                        item.objs[1].x1 = cc.end_x + xxx;
                        item.objs[1].y1 = cc.end_y + yyy;

                        item["end_x"] = item["end_x"] + xxx;
                        item["end_y"] = item["end_y"] + yyy;
                    }
                    //计算所有上级节点位移
                    calc_pnode(item.children[ii],"end"); 
                }
                else{

                    //计算所有上级节点位移
                    calc_pnode(item.children[ii]);
                }
               
            }
        }
        else{
          
 
            g_add_pyl_x=0;
            g_add_pyl_y=0; 
            calc_pnode(item,"last");
            
        }
        return item;
    }

    function get_leaf(index, item, x1, y1, deg, a_height, leaftype) {
        //drawLine( x1,y1,x2,y2,1,"#333333");

        //var angle = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度
        //var a_height = get_max_height(); 

        var aa = get_next_point(deg, item, index, x1, y1, a_height, item, leaftype);
        var end_x = aa.end_x;
        var end_y = aa.end_y;
        x1 = aa.x1;
        y1 = aa.y1;
        item.angle = aa.angle;

        //if (item.pnode.pos%2==1)

        //textsize {"x":74.96875,"y":144.3333282470703,"x2":125.03125,"y2":155.66666221618652,"width":50.0625,"height":11.333333969116211,"cx":100,"cy":149.99999523162842}
        var textsize = getTextSize(item);
        item._legacy_id = item.id;
        item._legacy_parent = item.sjid;
        // 一级鱼翅的 textsize 保持原始值，padding 由 drawText 中的 padX/padY 统一控制

        var obj = {
            angle: aa.angle,
            item_id: item.id,
            end_x: end_x,
            end_y: end_y,
            important:item.important,
            url:item.url,
            opentype:item.opentype,
            width: Math.abs(x1 - end_x),
            height: Math.abs(y1 - end_y),
            objs: [{ type: "line", x1: x1, y1: y1, x2: end_x, y2: end_y, attrs: {} },
                {opentype:item.opentype,url:item.url,important:item.important,jb:item.jb, type: "text", x1: end_x, y1: end_y, textsize: textsize, text: item.name, attrs: {} }
            ]
        };

        var cc = get_text_xy(item, obj.objs);
        obj.objs[1].x1 = cc.end_x;
        obj.objs[1].y1 = cc.end_y;
        // 一级节点：根据在鱼骨上方(pos奇数)还是下方(pos偶数)调整边框位置
        // 使鱼骨线末端对齐边框靠近鱼骨干一侧的边缘中心
        if (item.jb == 1 || item.jb == "1") {
            var pos = item.pos;
            var tsY = textsize.y;
            var tsH = textsize.height;
            if (pos % 2 == 1) {
                // 鱼骨上方(pos奇数)：向上偏移，使鱼骨线对齐边框下边缘
                obj.objs[1].y1 = cc.end_y - Math.round(tsY + tsH + g_leaf1_offset, 3);
            } else {
                // 鱼骨下方(pos偶数)：向下偏移，使鱼骨线对齐边框上边缘
                obj.objs[1].y1 = cc.end_y - Math.round(tsY - g_leaf1_offset, 3);
            }
        }
        var list_x = [];
        var list_y = [];
        if (item["list_x"] != undefined) {
            list_x = item["list_x"];
            list_y = item["list_y"];
        }
        list_x.push(obj.objs[0].x1);
        list_x.push(obj.objs[0].x2);
        list_x.push(obj.objs[1].x1);
        list_y.push(obj.objs[0].y1);
        list_y.push(obj.objs[0].y2);
        list_y.push(obj.objs[1].y1);
        item["list_x"] = list_x;
        item["list_y"] = list_y;
        return obj;
    }

    function calc_root_deg(item) {
        if (item.pnode == null) {
            if (item.angle == undefined) {
                var x1 = item["objs"][0]["x1"];
                var y1 = item["objs"][0]["y1"];
                var x2 = item["objs"][0]["x2"];
                var y2 = item["objs"][0]["y2"];
                var angle2 = Raphael.angle(x1, y1, x2, y2); //API方法获取角度，原直线倾斜度
                item.angle = Math.round(angle2, 3);
            }

            return item;
        } else {

            return calc_root_deg(item.pnode);
        }
    }

    var g_add_pyl_x=0;
    var g_add_pyl_y=0;
    //画完节点后，计算前后左右的位置适合超出允许范围，修正所有上级节点位置（待完善）
    function calc_pnode(item,l_end) {
        var xxx = 0;
        var yyy = 0;
        var pnode = item.pnode; 
        if (pnode == null) {  
            return;
        }
       
        var x1 = item["objs"][0]["x1"];
        var y1 = item["objs"][0]["y1"];
        var x2 = item["objs"][0]["x2"];
        var y2 = item["objs"][0]["y2"];
        var max_y = item.max_min_xy.y2;
        var max_x = item.max_min_xy.x2; 
        var height = item.objs[1].textsize.height;
        var width = item.objs[1].textsize.width;

        //向下画 和向右画，出发修正节点算法
        item.angle = Math.round(item.angle,3);
 
      

        var a_area = get_area_xy(item.angle);
        //向下画
        if (a_area == "3" || a_area == "4") {
            max_y = item.max_min_xy.y2 + height/2;
            max_x = item.max_min_xy.x2; 
            if (item.pnode != null)
            { 
                if ( (item.pnode.angle== 180 || item.pnode.angle== 0 || item.pnode.angle== 360 ) &&  (item.jb=="3"  ) )
                {
                    var ppp_node =null;
                   if (item.pnode.prenode.length > 1 )
                   {
                       ppp_node = item.pnode.prenode[item.pnode.prenode.length - 2]; 
                     

                       if (ppp_node.max_min_xy.y1 < max_y) {
                            var hh = Math.abs(max_y - ppp_node.max_min_xy.y1) +g_height2 ;
                            xxx = Math.cos(Raphael.rad(g_degree)) * hh * -1 ;
                   
                            yyy = Math.sin(Raphael.rad(g_degree)) * hh * -1;
                       }
                   } 
                   else if ( (item.pnode.prenode.length == 0 || item.pnode.prenode.length ==1)  && item.jb=="3"   && item.pnode.pnode!=null   ){ 
                        ppp_node = item.pnode.pnode; 
                        if (ppp_node["objs"][0].y1 < max_y) {
                            var hh = Math.abs(max_y - ppp_node.max_min_xy.y1)  + g_height2 ;
                            xxx = Math.cos(Raphael.rad(g_degree)) * hh * -1; 
                            yyy = Math.sin(Raphael.rad(g_degree)) * hh * -1;
                       }
                   }  
                } 
                
            } 
           
        } 
        else if ( (item.angle == "0" || item.angle == "360")  ) {
            //比较难触发
            max_y = item.max_min_xy.y1;
            max_x = item.max_min_xy.x1 - width/2; 
            if (get_area_xy(item.pnode.angle) == "3" || get_area_xy(item.pnode.angle) == "2") {
                if (item.pnode != null && item.pnode.pnode != null) {
                    var p_pnode = item.pnode.pnode;
                    var p_x1 = p_pnode["objs"][1]["x1"] + Math.abs(p_pnode["objs"][1]["y1"] - y1) / Math.tan(Raphael.rad(g_degree));
                    p_x1 = Math.round(p_x1, 3)
                    if (item.max_min_xy != undefined) {
                        if (item.max_min_xy.x1 < p_x1 && x1 > p_x1) {
                            var hh = Math.abs(p_x1 - item.max_min_xy.x1 + g_height1);
                            xxx = hh; 
                            yyy = 0;
                        }
                        else if (item.max_min_xy.x1 < p_x1 && x1 == p_x1) {
                            var hh = Math.abs(p_x1 - item.max_min_xy.x1 );
                            xxx = hh ; 
                            yyy = 0; 

                            var ppp_node =null;
                            if (item.pnode.prenode.length > 1 )
                            {
                                ppp_node = item.pnode.prenode[item.pnode.prenode.length - 2];  
                                if (ppp_node.max_min_xy.x2 > max_x) {
                                     var hh = Math.abs(max_x - ppp_node.max_min_xy.x2)+ g_height2   ;
                                     xxx = hh ; 
                                     yyy = 0;
                                }
                                if (xxx != 0 || yyy != 0) { 
                                    //位置有偏差，调用重画
                                    calc_pnode_xy_group(item, xxx, yyy);
                                    return;
                                }  
                               
                            }   
                        }
                    }

                } 
            } 
        } else if (item.angle == "0"  ) {
            var root_node = get_root_node(item);
            max_y = item.max_min_xy.y2;
            max_x = item.max_min_xy.x2 + width  ; 
            if ((get_area_xy(item.pnode.angle) == "1" || get_area_xy(item.pnode.angle) == "2") ) {
                if (item.pnode != null && item.pnode.pnode != null) {
                    var p_pnode = item.pnode.pnode; 

                    var  root_node = get_root_node(item);
                    var  root_area_xy = get_area_xy(root_node.angle);

                    var p_x1 = p_pnode["objs"][0]["x1"] - Math.abs(p_pnode["objs"][0]["y1"] - y1) / Math.tan(Raphael.rad(g_degree));
                    p_x1 = Math.round(p_x1, 3)
                    if (item.max_min_xy != undefined) {
                        if (max_x + 10 > p_x1) {
                            var hh = Math.abs(max_x + 10 - p_x1 );
                            xxx = hh * -1; 
                            yyy = 0;
                        }
                    }
                   

                } 
            }
            else{
                var p_pnode = item.pnode;

                var prenode = item.prenode;
                if (prenode.length>1)
                {
 
                    var temp2 = prenode[prenode.length-2];
                    var root_node = get_root_node(temp2);
                    var min_y = item.max_min_xy.y1;
                    var min_x = item.max_min_xy.x1    ; 

                    if (  item["objs"][0]["x1"]  -  10 > min_x)
                    {
                        var hh = Math.abs( item["objs"][0]["x1"]  -  10 > min_x );
                        xxx = hh * -1; 
                        yyy = 0;
                    }
                } 

            }
        }
        else if (item.angle == "180" && item.jb==4 && item.last4==true){ 
              
            
        }
      
        if (xxx != 0 || yyy != 0) {
            //位置有偏差，调用重画
            calc_pnode_xy(item, xxx, yyy);
        } 
    } 
   
    function calc_pnode_xy(item, x, y) {
        var root_node = get_root_node(item);
       
        for (var i = g_list.length; i > 0; i--) {
            var temp = g_list[i - 1];
            if (temp.jb == 2 && (item.angle == 0 || item.angle == 180 || item.angle == 360)) {
                return;
            }
            if (temp["objs"] != undefined) {
                temp["objs"][0]["x1"] = temp["objs"][0]["x1"] + x;
                temp["objs"][0]["y1"] = temp["objs"][0]["y1"] + y;
                temp["objs"][0]["x2"] = temp["objs"][0]["x2"] + x
                temp["objs"][0]["y2"] = temp["objs"][0]["y2"] + y;
                temp["objs"][1]["x1"] = temp["objs"][1]["x1"] + x;
                temp["objs"][1]["y1"] = temp["objs"][1]["y1"] + y;
                temp["max_min_xy"]["x1"] = temp["max_min_xy"]["x1"] + x;
                temp["max_min_xy"]["y1"] = temp["max_min_xy"]["y1"] + y;
                temp["max_min_xy"]["x2"] = temp["max_min_xy"]["x2"] + x;
                temp["max_min_xy"]["y2"] = temp["max_min_xy"]["y2"] + y;

                temp["end_x"] = temp["end_x"] + x;
                temp["end_y"] = temp["end_y"] + y;
           

            }
            if (temp.jb == 2 ) {  
                
                return;
           }
        }
    }

  
    function calc_pnode_xy_group(item, x, y) {
        var prenode = item.pnode.prenode[item.pnode.prenode.length-1];
         
        if (prenode==null)
        { 
            prenode = item.prenode[item.prenode.length-1];
        }
        if (prenode==null)
        { 
            return;
        }
        var find = false;
        for (var i = 0; i < g_list.length; i++) {
            var temp = g_list[i]; 
           if (prenode.id == temp.id)
           {
                find  = true; 
           }
            if (temp["objs"] != undefined && find) {
                temp["objs"][0]["x1"] = temp["objs"][0]["x1"] + x;
                temp["objs"][0]["y1"] = temp["objs"][0]["y1"] + y;
                temp["objs"][0]["x2"] = temp["objs"][0]["x2"] + x
                temp["objs"][0]["y2"] = temp["objs"][0]["y2"] + y;
                temp["objs"][1]["x1"] = temp["objs"][1]["x1"] + x;
                temp["objs"][1]["y1"] = temp["objs"][1]["y1"] + y;
                temp["max_min_xy"]["x1"] = temp["max_min_xy"]["x1"] + x;
                temp["max_min_xy"]["y1"] = temp["max_min_xy"]["y1"] + y;
                temp["max_min_xy"]["x2"] = temp["max_min_xy"]["x2"] + x;
                temp["max_min_xy"]["y2"] = temp["max_min_xy"]["y2"] + y;

                temp["end_x"] = temp["end_x"] + x;
                temp["end_y"] = temp["end_y"] + y; 
            } 
        }
    }


    function get_root_node(item)
    {
        if  ( item.pnode!=null )
        {
            return get_root_node(item.pnode);

        }
        else{
            return item; 
        }

    }

    //计算root鱼刺的位置
    function redraw_root() {
        var root = null;
        for (var i = 0; i < g_list.length; i++) {
            var item = g_list[i];
            if (item.jb == 2 && item.pos == 0) {
                if (item.pnode != null) {
                    //root 线头
                    var max_min_xy = get_max_min_xy(item);
                    if (max_min_xy.y2 > item.pnode["objs"][0]["y1"]) {
                        var hh = (max_min_xy.y2 - item.pnode["objs"][0]["y1"]) + g_height1;
                        var x = hh / Math.tan(Raphael.rad(g_degree));
                        var y = hh;
                        item.pnode["objs"][0]["x1"] = item.pnode["objs"][0]["x1"] + x;
                        item.pnode["objs"][0]["y1"] = item.pnode["objs"][0]["y1"] + y;
                    }

                    //root  线尾 
                    //最后一个 jb=2
                    var min_yy = 10000000;
                     
                    for (var k = item.pnode.children.length - 1; k >= 0 && k >= item.pnode.children.length - 2; k--) {
                        var last_left2 = item.pnode.children[k];
                        var max_min_xy2 = get_max_min_xy(last_left2);
                        var temp_y1 = max_min_xy2.y1;
                        if (temp_y1 < min_yy) {
                            min_yy = temp_y1;
                        } 
                    }


                    //计算2级鱼刺的末级长度
                    for (var k = item.pnode.children.length - 1; k >= 0  ; k--) {  
                         
                        var pp_node = item.pnode.children[k]; 
                        if (pp_node != null && pp_node.objs != null) {
                            if ( pp_node.angle == 180) { 
                                var max_min_xy2 = get_max_min_xy(pp_node);
                                var temp_x2 = max_min_xy2.x2;
                                if (temp_x2 - pp_node["objs"][0]["x2"] > 60 ) {
                                    xxx =  temp_x2 - pp_node["objs"][0]["x2"] + g_height1;
                                    yyy = 0;
                                    pp_node["objs"][0]["x2"] = pp_node["objs"][0]["x2"] + xxx;
                                    pp_node["objs"][0]["y2"] = pp_node["objs"][0]["y2"] + yyy;
                                    var cc = get_text_xy(pp_node, pp_node.objs);
                                    pp_node.objs[1].x1 = pp_node.objs[1].x1 + xxx;
                                    pp_node.objs[1].y1 = pp_node.objs[1].y1 + yyy;
            
                                    pp_node["end_x"] = pp_node["end_x"] + xxx  ;
                                    pp_node["end_y"] = pp_node["end_y"] + yyy; 
                                }
                               
                            }   
                        }  
                    }


                    if (min_yy < item.pnode["objs"][0]["y2"]) {
                        var hh = Math.abs(min_yy - item.pnode["objs"][0]["y2"]) + g_height1 * 2;
                        var x = hh / Math.tan(Raphael.rad(g_degree));
                        var y = hh;
                        item.pnode["objs"][0]["x2"] = item.pnode["objs"][0]["x2"] + x * -1;
                        item.pnode["objs"][0]["y2"] = item.pnode["objs"][0]["y2"] + y * -1;
                        item.pnode["objs"][1]["x1"] = item.pnode["objs"][1]["x1"] + x * -1;
                        item.pnode["objs"][1]["y1"] = item.pnode["objs"][1]["y1"] + y * -1;

                    }

                    //计算root线与最大值交加点，根据此节点进行反转鱼骨图
                    var max_x = 0,
                        max_y = 0,
                        pyl_x_500 = 0,
                        pyl_y_500 = 0;
                    if (item.pnode["objs"][0]["x1"] > item.pnode.max_min_xy.x2) {
                        max_x = item.pnode["objs"][0]["x2"];
                        max_y = item.pnode["objs"][0]["y2"];
                        pyl_x_500 = max_x - g_centerX;
                        pyl_y_500 = max_y - g_centerY;
                    } else {
                        var pyl = Math.abs(item.pnode.max_min_xy.x2 - item.pnode["objs"][0]["x2"]);
                        max_x = item.pnode.max_min_xy.x2;
                        max_y = item.pnode["objs"][0]["y2"] + pyl * Math.tan(Raphael.rad(g_degree));
                        pyl_x_500 = max_x - g_centerX;
                        pyl_y_500 = max_y - g_centerY;
                    }
                    return { x: max_x, y: max_y, pyl_x_500: pyl_x_500, pyl_y_500: pyl_y_500 }
                }
            }
        }
    }

    function redraw_leaf_root(arr_leaf,ai_toleft) { 
           
        var maxY1 = 500; 
        var maxY2 = 500;
        
        var obj1 ;
        var obj2 ;
        var index = 0; 
        for (var i = 0; i < arr_leaf.length; i++) { 
            var leaf = arr_leaf[i].leaf[0]; 
            if (leaf.jb==1)
            {   
                var y1 =  leaf["objs"][0]["y1"] ;  
                var y2 =  leaf["objs"][0]["y2"] ;
                if (i%2==0)
                { 
                    if (y2 < maxY1)
                    { 
                        maxY1 = y2;  
                        obj1 = leaf["objs"];
                    }
                }
                else{ 
                    if (y2>maxY2 )
                    { 
                        maxY2 = y2; 
                        obj2 = leaf["objs"];
                    } 
                } 
                index++;
            }
          
        }  
        index = 0; 
        if (obj1==undefined || obj2==undefined)
        {
            return;
        }

        var ai_hh=0;
        if (500-maxY1 > maxY2-500)
        {
            maxY2 = 500-maxY1 +500;
        }
        else{
            maxY1 = 500 - (maxY2-500);
        }
  
        for (var i = 0; i < arr_leaf.length; i++) { 
            var leaf = arr_leaf[i].leaf[0]; 
            if (leaf.jb==1)
            {
                if (index%2==0)
                {
                    //leaf.objs[0].y2 =   maxY1   ;
                    //leaf.objs[0].x2 = leaf.objs[0].x2 +   (  parseFloat(leaf.objs[0].y2) - parseFloat(maxY1)   ) /Math.tan(Raphael.rad( leaf.angle))   ;
                    if (ai_toleft=="toright")
                    { 

                        ai_hh = (leaf.objs[0].y2 - maxY1) / Math.sin(Raphael.rad(g_degree))*-1;

                        leaf.objs[0].x2 = leaf.objs[0].x2 + ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[0].y2 = leaf.objs[0].y2 + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;

                      
                        leaf.objs[1].x1 = leaf.objs[1]["x1"]+ ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[1].y1 = leaf.objs[1]["y1"] + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;
                    }
                    else{
                        ai_hh = (leaf.objs[0].y2 - maxY1) / Math.sin(Raphael.rad(g_degree)) ;

                        leaf.objs[0].x2 = leaf.objs[0].x2 + ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[0].y2 = leaf.objs[0].y2 - ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;

                        leaf.objs[1].x1 = leaf.objs[1]["x1"] + ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[1].y1 = leaf.objs[1]["y1"] - ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;
                    }
                   
                }
                else{
                    if (ai_toleft=="toright")
                    {
                        ai_hh = (leaf.objs[0].y2 - maxY2) / Math.sin(Raphael.rad(g_degree))*-1;

                        leaf.objs[0].x2 = leaf.objs[0].x2 - ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[0].y2 = leaf.objs[0].y2 + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;

                        leaf.objs[1].x1 = leaf.objs[1]["x1"] - ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[1].y1 = leaf.objs[1]["y1"] + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;
                    }
                    else{
                        ai_hh = (leaf.objs[0].y2 - maxY2) / Math.sin(Raphael.rad(g_degree))*-1 ;

                        leaf.objs[0].x2 = leaf.objs[0].x2 + ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[0].y2 = leaf.objs[0].y2 + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;

                        leaf.objs[1].x1 = leaf.objs[1]["x1"] + ai_hh*Math.cos(Raphael.rad( leaf.angle)) ;
                        leaf.objs[1].y1 = leaf.objs[1]["y1"] + ai_hh*Math.sin(Raphael.rad( leaf.angle)) ;
 

                    }
                } 
                index++;
            }
        }
    }



    var RootMinX, RootMinY, RootMaxX, RootMaxY;
    //鱼骨图反转
    function redraw2direction(item, abcd, totype, calcmaxmin) {

        var centerX = abcd.x;
        var centerY = abcd.y;
        var pyl_x_500 = abcd.pyl_x_500;
        var pyl_y_500 = abcd.pyl_y_500;

        var x1 = item["objs"][0]["x1"];
        var y1 = item["objs"][0]["y1"];
        var x2 = item["objs"][0]["x2"];
        var y2 = item["objs"][0]["y2"];


        if (totype == "toArea4") {

            var xxx1 = 0;
            var xxx2 = 0;
            var yyy1 = 2 * (centerY - y1) - pyl_y_500;
            var yyy2 = 2 * (centerY - y2) - pyl_y_500;

            item = update_xy_one(item, xxx1, yyy1, xxx2, yyy2, totype);

        } else if (totype == "toArea2") {
            var xxx1 = 2 * (centerX - x1) - pyl_x_500;
            var yyy1 = 0;

            var xxx2 = 2 * (centerX - x2) - pyl_x_500;
            var yyy2 = 0;

            item = update_xy_one(item, xxx1, yyy1, xxx2, yyy2, totype);

        }
        if (calcmaxmin) {

            get_MaxMin(item, totype);
        }
        if (item.children.length > 0) {
            for (var ii = 0; ii < item.children.length; ii++) {
                redraw2direction(item.children[ii], abcd, totype, calcmaxmin);
            }
        }
        return item;
    }



    function update_xy_one(item, xxx1, yyy1, xxx2, yyy2, totype) {

        item["objs"][0]["x1"] = item["objs"][0]["x1"] + xxx1;
        item["objs"][0]["y1"] = item["objs"][0]["y1"] + yyy1;
        item["objs"][0]["x2"] = item["objs"][0]["x2"] + xxx2
        item["objs"][0]["y2"] = item["objs"][0]["y2"] + yyy2;
        item["objs"][1]["x1"] = item["objs"][1]["x1"] + xxx2;
        item["objs"][1]["y1"] = item["objs"][1]["y1"] + yyy2;
        if (totype == "toArea4") {
            if (get_area_xy(item.angle) == "1" || get_area_xy(item.angle) == "2") {
                item["objs"][1]["y1"] = item["objs"][1]["y1"] + item["objs"][1]["textsize"]["height"];
            } else if (get_area_xy(item.angle) == "3" || get_area_xy(item.angle) == "4") {
                item["objs"][1]["y1"] = item["objs"][1]["y1"] - item["objs"][1]["textsize"]["height"];
            }
        } else if (totype == "toArea2") {
            if (item.angle == "0" || item.angle == "360") {
                item["objs"][1]["x1"] = item["objs"][1]["x1"] + item["objs"][1]["textsize"]["width"];
            } else if (item.angle == "180") {
                item["objs"][1]["x1"] = item["objs"][1]["x1"] - item["objs"][1]["textsize"]["width"];
            }
        }

        return item;
    }

    function get_MaxMin(item2, totype) {
        var list_xxx = [];
        var list_yyy = [];

        if (item2["objs"] != undefined) {
            list_xxx.push(item2["objs"][0]["x1"]);
            list_xxx.push(item2["objs"][0]["x2"]);
            var fhh = 1;

            if (totype == "toArea2") {
                if (item2.angle == "180") {
                    fhh = -1;
                }
            } else {
                if (item2.angle == "0" || item2.angle == "360") {
                    fhh = -1;
                }
            }

            list_xxx.push(item2["objs"][1]["x1"] + fhh * item2["objs"][1]["textsize"]["width"] / 2);
            if (RootMinX != null) {
                list_xxx.push(RootMinX);
            }
            if (RootMaxX != null) {
                list_xxx.push(RootMaxX);
            }

            list_yyy.push(item2["objs"][0]["y1"]);
            list_yyy.push(item2["objs"][0]["y2"]);
            list_yyy.push(item2["objs"][1]["y1"] + item2["objs"][1]["textsize"]["height"] / 2);
            if (RootMinX != null) {
                list_yyy.push(RootMinY);
            }
            if (RootMaxX != null) {
                list_yyy.push(RootMaxY);
            }


            RootMinX = min(list_xxx);
            RootMinY = min(list_yyy);
            RootMaxX = max(list_xxx);
            RootMaxY = max(list_yyy);
           
        }
    }

    function set_MaxMin(item) {
        // debugger
        item["MinX"] = RootMinX;
        item["MinY"] = RootMinY;
        item["MaxX"] = RootMaxX;
        item["MaxY"] = RootMaxY;
        item["width"] = Math.abs(RootMaxX - RootMinX);
        item["height"] = Math.abs(RootMaxY - RootMinY);
        item["x1"] = item["objs"][0]["x1"];
        item["y1"] = item["objs"][0]["y1"];
        return item;
    }

    //leaftype=>toright,toleft
    //默认在坐标轴左上坐标区域内画鱼骨图(坐标轴90-1800区域)，命名为1，顺时针依次为234
    //toArea2：将鱼骨图反转到坐标轴右边即位置2（坐标轴0-90区域）
    //toArea4:  将鱼骨图反转到坐标轴下方即位置4（坐标轴270-360区域）
    function draw_leaf(deg, a_item, leaftype, index) {
        g_list = [];
        RootMinX = null;
        RootMinY = null;
        RootMaxX = null;
        RootMaxY = null;
        var px = g_centerX,
            py = g_centerY;
        //drawLine( x1,x2,end_x,end_y  ,4,"#333333");  
        a_item.angle = 0;
        obj = get_fish_deep(1, a_item, px, py, deg, leaftype);
        var aa = redraw_root();
        var aa = { x: 500, y: 500, pyl_x_500: 0, pyl_y_500: 0 };
        //toArea2    toArea4 
        if (leaftype == "toleft") {
            if (index % 2 == 0) {
                RootMinX = null;
                RootMinY = null;
                RootMaxX = null;
                RootMaxY = null;
                obj = redraw2direction(obj, aa, "toArea2", true); //反正到坐标轴右方
                obj = set_MaxMin(obj);
            } else {
                RootMinX = null;
                RootMinY = null;
                RootMaxX = null;
                RootMaxY = null;
                obj = redraw2direction(obj, aa, "toArea2", true); //反正到坐标轴右方
                obj = set_MaxMin(obj);
                RootMinX = null;
                RootMinY = null;
                RootMaxX = null;
                RootMaxY = null;
                obj = redraw2direction(obj, aa, "toArea4", true); //反正到坐标轴下方
                obj = set_MaxMin(obj);
            }
        } else {
            if (index % 2 == 1) {
                RootMinX = null;
                RootMinY = null;
                RootMaxX = null;
                RootMaxY = null;
                obj = redraw2direction(obj, aa, "toArea4", true); //反正到坐标轴下方
                obj = set_MaxMin(obj);
            } else {
                RootMinX = null;
                RootMinY = null;
                RootMaxX = null;
                RootMaxY = null;
                obj = redraw2direction(obj, aa, "", true);
                obj = set_MaxMin(obj);
            }
        }

        // ===== 碰撞检测已禁用：原实现在 redraw2direction/set_MaxMin 之后修改坐标会破坏父子节点连线关系 =====
        // 如需重新启用碰撞检测，必须在坐标计算阶段（get_fish_deep/redraw2direction内部）完成，而非后处理修改

        return obj
    }

    function get_leaf_array(a_leaf) {
        var li_min_x = 0,
            li_max_x = 0;
        var li_min_y = 0,
            li_max_y = 0;
        var nodes = [];
        if (a_leaf != null) {
            var stack = []; //同来存放将来要访问的节点
            stack.push(a_leaf);
            while (stack.length !== 0) {
                var item = stack.pop(); //正在访问的节点
                nodes.push(item);

                li_max_x = Math.max(item.objs[0].x1, item.objs[0].x2);
                li_min_x = Math.min(item.objs[0].x1, item.objs[0].x2);

                li_max_y = Math.max(item.objs[0].y1, item.objs[0].y2);
                li_min_y = Math.min(item.objs[0].y1, item.objs[0].y2);

                if (item.children) {
                    var childrens = item.children;
                    for (var i = childrens.length - 1; i >= 0; i--) //将现在访问点的节点的子节点存入stack，供将来访问
                        stack.push(childrens[i]);
                }
            }
        }
        return { width: li_max_x - li_min_x, height: li_max_y - li_min_y, leaf: nodes };

    }



    var paper, paperv;
    var g_level = 0;
    //虚拟画布；
    paperv = Raphael(0, 0, 1000, 1000);
    var color_back_yg = "white";

    var arr_leaf = [];



        var _dc = JSON.parse(JSON.stringify(datas));
    var datas_tree = list2tree(_dc, "ROOT", null);


    //debugger;
    for (var i = 0; i < datas_tree.length; i++) {
        var deg = 0;
        var temp = draw_leaf(deg, datas_tree[i], leaftype, i);
        arr_leaf.push(get_leaf_array(temp));
    }


    //  if (leaftype != "toleft") {
    //      arr_leaf.reverse();
    //  }



    var max_top = 0,
        max_bottom = 0,

        max_width = 0;
    var arr_max_width = [];

    //debugger;
    for (var i = 0; i < arr_leaf.length; i++) {

        var li_max_width = 0;
        max_top = Math.max(max_top, arr_leaf[i].leaf[0].height);

        li_max_width = Math.max(li_max_width, arr_leaf[i].leaf[0].width);
        i++;
        if (i < arr_leaf.length) {
            max_bottom = Math.max(max_bottom, arr_leaf[i].leaf[0].height);
            li_max_width = Math.max(li_max_width, arr_leaf[i].leaf[0].width);
            // 上下组共享同一根节点，取最大宽度 + 组间距
            li_max_width = Math.round(li_max_width + g_group_spacing);
            arr_max_width.push(li_max_width + 1);
        }

        arr_max_width.push(li_max_width + 1);

        max_width += li_max_width -35;
    }


    //Paper.setSize(width, height)

    var height_pyl =0;
    var width_pyl =0;
    if (g_cqi_flag=="1")
    {
        height_pyl=100; 
        width_pyl = 200;
    }
  
    var add_foot_ww=50;
    if (g_cqi_flag=="1")
    {
        g_height =2* Math.max(max_top, max_bottom)+height_pyl; 
        add_foot_ww += g_add_foot_width;  
    } 

    // 简化计算：上下左右各留80px空白
    var padding = 80;
    g_width = max_width + startwidth + 2 * padding;   // 内容宽 + 左右各80px
    if (g_cqi_flag!="1") {
        g_height = max_top + max_bottom;
    }
    var svg_height = g_height + 2 * padding;          // 内容高 + 上下各80px
    paper = Raphael(panel, g_width+width_pyl, svg_height);
    // 动态调整 panel div 的尺寸，适配鱼骨图实际大小
    var panelEl = document.getElementById(panel);
    if (panelEl) {
        panelEl.style.width = (g_width + width_pyl) + "px";
        panelEl.style.height = svg_height + "px";
    }

    // 保存原始 startwidth，鱼尾和中脊线在渲染循环后根据真实包围盒绘制
    var origSw = startwidth;
    var headX = 0, spineEndX = 0;
    if (leaftype == "toright") {
        var xx2 = 2 * startwidth_head;
        if (ygtstyle == "") { xx2 = startwidth_head / 2; }
        headX = max_width + origSw + startwidth_head / 2;
        spineEndX = max_width + origSw + xx2;
        draw_head(headX, 80 + max_top, title, "toright");
        startwidth = max_width + origSw + origSw / 2;
    } else {
        headX = origSw - startwidth_head_toleft;
        spineEndX = max_width + origSw + startwidth_pyl + add_foot_ww;
        draw_head(headX, 80 + max_top, title, "toleft");
    }
 
    if (g_cqi_flag=="1")
    {
        redraw_leaf_root(arr_leaf,leaftype); 
    }
    
    if (leaftype != "toleft") {
        // 包围盒数组：记录每对鱼刺的真实 SVG 矩形边界 { left, right, top, bottom }
        var pairBounds = [];
        for (var i = 0; i < arr_leaf.length; i++) {

            var leaf = arr_leaf[i].leaf[0]; // 上组（鱼背）

            var leaf_center_max = leaf.MaxX - leaf.objs[0].x1 ;

            if ((i + 1) < arr_leaf.length) {

                var leaf2 = arr_leaf[i + 1].leaf[0];
                var leaf_center2 = leaf2.MaxX - leaf2.objs[0].x1;
                leaf_center_max = Math.max(leaf_center_max, leaf_center2);
            }
            leaf_center_max = Math.max(leaf_center_max, 30);

            // 上组 Y 偏移
            var topY = 80 + max_top - leaf.y1 - start_middle;

            //画鱼背
            draw_leaf_topaper(arr_leaf[i], startwidth - (leaf.x1 + leaf_center_max), topY);


            i++;
            if (i < arr_leaf.length) {
                //画鱼肚
                var leafB = arr_leaf[i].leaf[0]; // 下组（鱼肚）
                var bottomY = 80 + max_top - leafB.y1 + start_middle;

                draw_leaf_topaper(arr_leaf[i], startwidth - (leafB.x1 + leaf_center_max) - 25, bottomY);

                // ====== 计算本 pair 的真实 SVG 包围盒 ======
                var topRootX = startwidth - leaf_center_max;
                var topLeft  = topRootX - (leaf.x1 - leaf.MinX);
                var topRight = topRootX + (leaf.MaxX - leaf.x1);
                var topTop    = topY + leaf.MinY;
                var topBottom = topY + leaf.MaxY;

                var btmRootX = startwidth - leaf_center_max - 25;
                var btmLeft  = btmRootX - (leafB.x1 - leafB.MinX);
                var btmRight = btmRootX + (leafB.MaxX - leafB.x1);
                var btmTop    = bottomY + leafB.MinY;
                var btmBottom = bottomY + leafB.MaxY;

                var pLeft   = Math.min(topLeft, btmLeft);
                var pRight  = Math.max(topRight, btmRight);
                var pTop    = Math.min(topTop, btmTop);
                var pBottom = Math.max(topBottom, btmBottom);

                pairBounds.push({ left: pLeft, right: pRight, top: pTop, bottom: pBottom });

                startwidth = pLeft - g_group_spacing;

            } else {
                var topRootX = startwidth - leaf_center_max;
                var topLeft  = topRootX - (leaf.x1 - leaf.MinX);
                var topRight = topRootX + (leaf.MaxX - leaf.x1);
                pairBounds.push({ left: topLeft, right: topRight, top: topY + leaf.MinY, bottom: topY + leaf.MaxY });
            }
        }
        paper.pairBounds = pairBounds;
    } else //toleaft
    {
        var pairBounds = [];
        for (var i = 0; i < arr_leaf.length; i++) {
            var leaf = arr_leaf[i].leaf[0];
            var leaf_center_max = Math.min(leaf.objs[0].x1, leaf.MinX);
            if ((i + 1) < arr_leaf.length) {

                var leaf2 = arr_leaf[i + 1].leaf[0];
                var leaf_center2 = Math.min(leaf2.objs[0].x1, leaf2.MinX);
                leaf_center_max = Math.min(leaf_center_max, leaf_center2);
            }

            leaf_center_max = Math.min(leaf_center_max, g_centerX -30);
            var topY = 80 + max_top - leaf.y1 - start_middle;

            draw_leaf_topaper(arr_leaf[i], startwidth - leaf_center_max, topY);


            i++;
            if (i < arr_leaf.length) {
                var leafB = arr_leaf[i].leaf[0];
                var bottomY = 80 + max_top - leafB.y1 + start_middle;

                draw_leaf_topaper(arr_leaf[i], startwidth - leaf_center_max + 25, bottomY);

                var topOffsetX = startwidth - leaf_center_max;
                var topLeft   = leaf.MinX + topOffsetX;
                var topRight  = leaf.MaxX + topOffsetX;
                var topTop    = topY + leaf.MinY;
                var topBottom = topY + leaf.MaxY;

                var btmOffsetX = startwidth - leaf_center_max + 25;
                var btmLeft   = leafB.MinX + btmOffsetX;
                var btmRight  = leafB.MaxX + btmOffsetX;
                var btmTop    = bottomY + leafB.MinY;
                var btmBottom = bottomY + leafB.MaxY;

                var pLeft   = Math.min(topLeft, btmLeft);
                var pRight  = Math.max(topRight, btmRight);
                var pTop    = Math.min(topTop, btmTop);
                var pBottom = Math.max(topBottom, btmBottom);

                pairBounds.push({ left: pLeft, right: pRight, top: pTop, bottom: pBottom });

                startwidth = pRight + g_group_spacing;

            } else {
                var topOffsetX = startwidth - leaf_center_max;
                pairBounds.push({ left: leaf.MinX + topOffsetX, right: leaf.MaxX + topOffsetX, top: topY + leaf.MinY, bottom: topY + leaf.MaxY });
            }
        }
        paper.pairBounds = pairBounds;

    }

    // ====== 鱼尾 = 最后一组边界 + 50px ======
    if (pairBounds.length > 0) {
        var lastPB = pairBounds[pairBounds.length - 1];
        var tailX;
        if (leaftype == "toright") {
            tailX = lastPB.left - 50;
            draw_foot(tailX, 80 + max_top, "toright");
            draw_middle_line(tailX, 80 + max_top, spineEndX, 80 + max_top);
        } else {
            tailX = lastPB.right + 50;
            draw_foot(tailX, 80 + max_top, "toleft");
            draw_middle_line(headX, 80 + max_top, tailX, 80 + max_top);
        }
        if (window.__YGT_LEGACY_COLLECT__) {
            window.__YGT_LEGACY_COLLECT__.skeleton = {
                head: { x: headX, y: 80 + max_top, dir: leaftype },
                tail: { x: tailX, y: 80 + max_top, dir: leaftype },
                spine: leaftype == "toright"
                    ? { x1: tailX, y1: 80 + max_top, x2: spineEndX, y2: 80 + max_top }
                    : { x1: headX, y1: 80 + max_top, x2: tailX, y2: 80 + max_top }
            };
        }
    }

    draw_stylesetting_panel(panel);
    //画导出功能
    draw_exportmenu()

    //清除临时画板
    paperv.clear();
    paperv.remove();

    // ========== 缩放和拖动功能（Figma / Miro 风格交互） ==========
    (function() {
        var svg = paper.canvas;
        var panelId = panel;

        // --- 1. 创建变换组 <g>，包裹所有 SVG 内容 ---
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", "ygt-transform-group");
        while (svg.firstChild) { g.appendChild(svg.firstChild); }
        svg.appendChild(g);

        // --- 2. 状态变量 ---
        var scale     = 1;
        var tx        = 0, ty = 0;
        var minScale  = 0.2, maxScale = 3;
        var zoomStep  = 0.15;    // 统一缩放步长（15%乘法步进，按钮与滚轮一致）
        // 拖动状态
        var dragging  = false;
        var dragSX, dragSY, dragTX, dragTY;
        var dragButton = -1;        // 记录哪个键触发的拖动（0=左键, 1=中键）
        // Space 键状态（Figma 风格：按住 Space 进入手型拖动模式）
        var spaceHeld = false;
        // 触摸/双指缩放状态
        var pinchDist = 0, pinchCX = 0, pinchCY = 0, pinchScale = 1, pinchTX = 0, pinchTY = 0;

        // --- 3. 核心：应用变换 ---
        function applyTransform() {
            g.setAttribute("transform",
                "translate(" + tx.toFixed(2) + "," + ty.toFixed(2) + ") scale(" + scale.toFixed(4) + ")");
            updateToolbar();
        }
        function updateToolbar() {
            var pct = document.getElementById("ygt-zoom-pct");
            if (pct) pct.textContent = Math.round(scale * 100) + "%";
            // 缩放越界时按钮变灰
            var zo = document.getElementById("ygt-zoom-out-btn");
            var zi = document.getElementById("ygt-zoom-in-btn");
            if (zo) zo.style.opacity = scale <= minScale ? "0.35" : "1";
            if (zi) zi.style.opacity = scale >= maxScale ? "0.35" : "1";
        }

        // --- 4. 容器设置 ---
        var container = svg.parentNode;
        if (container) {
            container.style.overflow = "hidden";
            container.style.position  = "relative";
            if (container.parentNode && container.parentNode !== document.body) {
                container.parentNode.style.overflow = "hidden";
            }
        }
        svg.style.cursor = "grab";

        // --- 5. 底部工具栏（Figma 风格：覆盖层方案，确保一定可见） ---
        // 先注入样式
        if (!document.getElementById("ygt-zoom-styles")) {
            var zs = document.createElement("style");
            zs.id = "ygt-zoom-styles";
            zs.textContent = [
                "#ygt-zoom-toolbar{",
                "position:fixed!important;bottom:24px!important;left:50%!important;",
                "transform:translateX(-50%)!important;z-index:2147483647!important;",
                "display:flex!important;align-items:center!important;gap:2px!important;height:44px!important;",
                "padding:3px!important;margin:0!important;",
                "background:#ffffff!important;",
                "border:1.5px solid #d0d5dd!important;",
                "border-radius:12px!important;",
                "box-shadow:0 4px 24px rgba(0,0,0,0.12),0 1px 3px rgba(0,0,0,0.06)!important;",
                "user-select:none!important;pointer-events:auto!important;",
                "}",
                "#ygt-zoom-toolbar .ygt-zm-btn{",
                "width:38px;height:38px;border:none;border-radius:9px;background:transparent;color:#4a5568;",
                "font-size:20px;font-weight:500;cursor:pointer;padding:0;margin:0;",
                "display:flex!important;align-items:center!important;justify-content:center!important;",
                "line-height:1;outline:none;transition:background 0.15s,color 0.15s;",
                "}",
                "#ygt-zoom-toolbar .ygt-zm-btn:hover{background:#f0f4ff;color:#1a73e8}",
                "#ygt-zoom-toolbar .ygt-zm-btn:active{background:#dde7ff;color:#1557b0;transform:scale(0.95)}",
                "#ygt-zoom-toolbar .ygt-zm-divider{",
                "width:1px;height:24px;background:#e8ecf1;margin:0 2px;align-self:center;",
                "}",
                "#ygt-zoom-toolbar .ygt-zm-pct{",
                "min-width:58px;height:38px;display:flex!important;align-items:center!important;justify-content:center!important;",
                "font-size:13px;font-weight:700;color:#1a73e8;cursor:pointer;background:#f0f4ff;",
                "border-radius:9px;user-select:none;padding:0 10px;box-sizing:border-box;",
                "transition:background 0.15s;margin:0 3px;",
                "}",
                "#ygt-zoom-toolbar .ygt-zm-pct:hover{background:#dde7ff}",
                "#ygt-zoom-toolbar .ygt-zm-fit{color:#6b7280!important;font-size:18px!important}"
            ].join("");
            document.head.appendChild(zs);
        }
        // 移除旧的工具栏
        var oldTb = document.getElementById("ygt-zoom-toolbar");
        if (oldTb) oldTb.parentNode.removeChild(oldTb);
        // 用 insertAdjacentHTML 直接插入到 body 末尾，确保是最后一个子元素
        document.body.insertAdjacentHTML("beforeend",
            '<div id="ygt-zoom-toolbar">' +
            '<button id="ygt-zoom-out-btn" class="ygt-zm-btn" title="缩小 (滚轮)">−</button>' +
            '<span class="ygt-zm-divider"></span>' +
            '<span id="ygt-zoom-pct" class="ygt-zm-pct" title="点击重置 100%">100%</span>' +
            '<span class="ygt-zm-divider"></span>' +
            '<button id="ygt-zoom-in-btn" class="ygt-zm-btn" title="放大 (滚轮)">+</button>' +
            '<span class="ygt-zm-divider"></span>' +
            '<button id="ygt-fit-btn" class="ygt-zm-btn ygt-zm-fit" title="适应画面">⛶</button>' +
            '</div>');

        // 工具栏按钮事件
        document.getElementById("ygt-zoom-out-btn").onclick = function() {
            if (scale <= minScale) return;
            scale = Math.max(minScale, scale * (1 - zoomStep));
            applyTransform();
        };
        document.getElementById("ygt-zoom-in-btn").onclick = function() {
            if (scale >= maxScale) return;
            scale = Math.min(maxScale, scale * (1 + zoomStep));
            applyTransform();
        };
        document.getElementById("ygt-zoom-pct").onclick = function() {
            scale = 1; tx = 0; ty = 0;
            applyTransform();
        };

        // --- 6. 适应画面（Fit to Screen） ---
        function fitToScreen() {
            var rect = svg.getBoundingClientRect();
            var svgW = rect.width, svgH = rect.height;
            // 获取内容实际包围盒（通过 g 的 getBBox）
            var bbox;
            try { bbox = g.getBBox(); } catch(e) { bbox = {x:0,y:0,width:svgW,height:svgH}; }
            if (!bbox || bbox.width === 0 || bbox.height === 0) {
                bbox = { x: 0, y: 0, width: svgW, height: svgH };
            }
            // 留出 8% 的边距
            var pad = 0.92;
            var fitScale = Math.min(svgW / bbox.width, svgH / bbox.height) * pad;
            fitScale = Math.max(minScale, Math.min(maxScale, fitScale));
            // 居中
            var centerX = bbox.x + bbox.width / 2;
            var centerY = bbox.y + bbox.height / 2;
            tx = svgW / 2 - centerX * fitScale;
            ty = svgH / 2 - centerY * fitScale;
            scale = fitScale;
            applyTransform();
        }
        document.getElementById("ygt-fit-btn").onclick = fitToScreen;

        // 首次渲染后自动适应画面
        setTimeout(function() {
            try {
                var bbox = g.getBBox();
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                    fitToScreen();
                }
            } catch(e) {}
        }, 100);

        // --- 7. Space 键切换手型模式（Figma 风格） ---
        document.addEventListener("keydown", function(e) {
            if (e.code === "Space" && !spaceHeld) {
                // 不在输入框内才触发
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && !e.target.isContentEditable) {
                    e.preventDefault();
                    spaceHeld = true;
                    svg.style.cursor = "grab";
                    // 添加视觉提示：给 SVG 加一个微弱的蓝色叠加
                    svg.style.outline = "2px solid rgba(74,158,255,0.3)";
                    svg.style.outlineOffset = "-1px";
                }
            }
        });
        document.addEventListener("keyup", function(e) {
            if (e.code === "Space" && spaceHeld) {
                spaceHeld = false;
                svg.style.cursor = dragging ? "grabbing" : "default";
                svg.style.outline = "";
            }
        });
        // 窗口失焦时重置 Space 状态
        window.addEventListener("blur", function() {
            spaceHeld = false;
            svg.style.cursor = dragging ? "grabbing" : "default";
            svg.style.outline = "";
        });

        // --- 8. 鼠标滚轮缩放（以光标为中心，Figma 风格平滑缩放） ---
        svg.addEventListener("wheel", function(e) {
            // 如果正在双指缩放（pinch），不处理 wheel 事件
            if (e.ctrlKey && Math.abs(e.deltaY) < 10) return;
            e.preventDefault();
            var delta = -e.deltaY * (zoomStep / 100);  // 与按钮一致的缩放步长
            if (e.ctrlKey || e.metaKey) delta *= 2.5;  // Ctrl+滚轮 = 大步长
            var newScale = Math.max(minScale, Math.min(maxScale, scale * (1 + delta)));
            var rect = svg.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var my = e.clientY - rect.top;
            var ratio = newScale / scale;
            tx = mx - (mx - tx) * ratio;
            ty = my - (my - ty) * ratio;
            scale = newScale;
            applyTransform();
        }, { passive: false });

        // --- 9. 三种拖动方式 ---

        // 判断是否在可交互元素上（文字节点等）
        function isOnElement(e) {
            return e.target !== svg && e.target !== g;
        }

        function startDrag(e, button) {
            dragging   = true;
            dragButton = button;
            dragSX     = e.clientX;
            dragSY     = e.clientY;
            dragTX     = tx;
            dragTY     = ty;
            svg.style.cursor = "grabbing";
            e.preventDefault();
        }

        // 9a. 按住 Space 时：在任意位置左键拖动
        // 9b. 中键拖动（通用标准）
        // 9c. 左键在空白 SVG/g 区域拖动
        svg.addEventListener("mousedown", function(e) {
            // 中键拖动（最高优先级）
            if (e.button === 1) {
                startDrag(e, 1);
                return;
            }
            // Space 键按下时：左键拖动（无视元素）
            if (e.button === 0 && spaceHeld) {
                startDrag(e, 0);
                return;
            }
            // 正常模式：仅空白区域左键拖动
            if (e.button === 0 && !isOnElement(e)) {
                startDrag(e, 0);
            }
        });

        document.addEventListener("mousemove", function(e) {
            if (dragging) {
                tx = dragTX + (e.clientX - dragSX);
                ty = dragTY + (e.clientY - dragSY);
                applyTransform();
            }
        });

        document.addEventListener("mouseup", function(e) {
            if (dragging) {
                dragging = false;
                dragButton = -1;
                svg.style.cursor = spaceHeld ? "grab" : "default";
            }
        });

        // --- 10. 触摸/双指缩放（Trackpad Pinch Zoom） ---
        svg.addEventListener("touchstart", function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                var t0 = e.touches[0], t1 = e.touches[1];
                pinchDist  = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                pinchCX    = (t0.clientX + t1.clientX) / 2;
                pinchCY    = (t0.clientY + t1.clientY) / 2;
                pinchScale = scale;
                pinchTX    = tx;
                pinchTY    = ty;
            } else if (e.touches.length === 1 && !spaceHeld) {
                // 单指拖动（在非 Space 模式下）
                dragging   = true;
                dragButton = 0;
                dragSX     = e.touches[0].clientX;
                dragSY     = e.touches[0].clientY;
                dragTX     = tx;
                dragTY     = ty;
            }
        }, { passive: false });

        svg.addEventListener("touchmove", function(e) {
            if (e.touches.length === 2 && pinchDist > 0) {
                e.preventDefault();
                var t0 = e.touches[0], t1 = e.touches[1];
                var newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                var newScale = Math.max(minScale, Math.min(maxScale, pinchScale * (newDist / pinchDist)));
                var rect = svg.getBoundingClientRect();
                var mx = pinchCX - rect.left;
                var my = pinchCY - rect.top;
                var ratio = newScale / pinchScale;
                tx = mx - (mx - pinchTX) * ratio;
                ty = my - (my - pinchTY) * ratio;
                scale = newScale;
                applyTransform();
            } else if (e.touches.length === 1 && dragging) {
                tx = dragTX + (e.touches[0].clientX - dragSX);
                ty = dragTY + (e.touches[0].clientY - dragSY);
                applyTransform();
            }
        }, { passive: false });

        svg.addEventListener("touchend", function(e) {
            if (e.touches.length < 2) {
                pinchDist = 0;
            }
            if (e.touches.length === 0) {
                dragging = false;
                dragButton = -1;
            }
        });

        // --- 11. 双击空白区域重置 ---
        svg.addEventListener("dblclick", function(e) {
            if (!isOnElement(e)) {
                scale = 1; tx = 0; ty = 0;
                applyTransform();
            }
        });

        // --- 12. 鼠标样式切换（hover 时区分空白/元素） ---
        svg.addEventListener("mousemove", function(e) {
            if (!dragging && !spaceHeld) {
                svg.style.cursor = isOnElement(e) ? "default" : "grab";
            }
        });

        // 初始加载时自动 fit
        updateToolbar();
    })();
    // ========== 缩放和拖动功能 结束 ==========

    // 在 paper 上挂载当前鱼骨图样式配置，格式与预设样式 JSON 一致
    paper.ygtstyle = {
        ygtstyle: ygtstyle,
        g_fish_preset: (typeof g_fish_preset !== "undefined" && g_fish_preset !== "") ? g_fish_preset : "",
        g_fill: g_fill,
        g_spine_color: g_spine_color,
        g_title_color: g_title_color,
        g_fin_color: g_fin_color,
        g_fin_bg_color: g_fin_bg_color,
        g_bg_color: g_bg_color,
        g_text_color: g_text_color,
        g_bg_color_important: g_bg_color_important,
        g_text_color_important: g_text_color_important,
        g_arrow_size: g_arrow_size,
        g_middle_line_width: g_middle_line_width,
        g_group_spacing: g_group_spacing,
        g_stroke_width: g_stroke_width,
        g_font_size: g_font_size,
        // 一级鱼刺
        g_fin_color_1: g_fin_color_1, g_stroke_width_1: g_stroke_width_1, g_arrow_size_1: g_arrow_size_1, g_text_color_1: g_text_color_1, g_font_size_1: g_font_size_1, g_font_weight_1: g_font_weight_1, g_text_line_spacing_ratio_1: g_text_line_spacing_ratio_1,
        // 二级鱼刺
        g_fin_color_2: g_fin_color_2, g_stroke_width_2: g_stroke_width_2, g_arrow_size_2: g_arrow_size_2, g_text_color_2: g_text_color_2, g_font_size_2: g_font_size_2, g_font_weight_2: g_font_weight_2, g_text_line_spacing_ratio_2: g_text_line_spacing_ratio_2,
        // 三级鱼刺
        g_fin_color_3: g_fin_color_3, g_stroke_width_3: g_stroke_width_3, g_arrow_size_3: g_arrow_size_3, g_text_color_3: g_text_color_3, g_font_size_3: g_font_size_3, g_font_weight_3: g_font_weight_3, g_text_line_spacing_ratio_3: g_text_line_spacing_ratio_3,
        fish_head_w: fish_head_w,
        fish_head_h: fish_head_h,
        fish_tail_w: fish_tail_w,
        fish_tail_h: fish_tail_h
    };

    return paper;
    
}
