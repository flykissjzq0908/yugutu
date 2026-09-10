/* 鱼骨图编辑器：自定义 shapes / 鱼形 path 数据 / 模板 */
window.YGT = window.YGT || {};
(function (Y) {
  'use strict';

  var FONT_FAMILY = 'Microsoft YaHei, SimHei, sans-serif';
  var registered = false;
  var TEMPLATE_PRESETS = {
    classic: ['人', '机', '料', '法', '环', '测'],
    qc: ['制度流程', '人员素质', '设备设施', '药品耗材', '环境因素', '管理监督'],
    nursing: ['护理人员', '患者因素', '设备材料', '流程制度', '环境因素', '沟通协作'],
    rca: ['流程制度', '人员操作', '设备环境', '沟通交接', '培训教育', '监督管理'],
    nursing_qc: ['基础护理', '专科护理', '护理文书', '消毒隔离', '患者安全', '健康教育']
  };
  var IMAGE_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">' +
    '<rect width="120" height="90" fill="#e2e8f0"/>' +
    '<text x="60" y="50" font-size="13" fill="#64748b" text-anchor="middle">Image</text>' +
    '</svg>');

  function arrowLinePath(w, h) {
    var width = Math.max(w || 160, 20);
    var height = Math.max(h || 24, 8);
    var y = height / 2;
    var head = Math.max(10, height * 0.6);
    var shaftEnd = width - head;
    return 'M0,' + y + ' L' + shaftEnd + ',' + y +
      ' L' + shaftEnd + ',' + (y - height / 2) +
      ' L' + width + ',' + y +
      ' L' + shaftEnd + ',' + (y + height / 2) + ' Z';
  }

  function arrowLineLinePath(w, h, arrowSize) {
    var width = Math.max(w || 160, 20);
    var height = Math.max(h || 24, 8);
    var y = height / 2;
    var head = arrowSize != null ? Math.max(6, Number(arrowSize)) : Math.max(10, height * 0.6);
    var shaftEnd = width - head;
    return 'M0,' + y + ' L' + shaftEnd + ',' + y;
  }

  function arrowLineHeadPath(w, h, arrowSize, lineWidth) {
    var width = Math.max(w || 160, 20);
    var height = Math.max(h || 24, 8);
    var y = height / 2;
    var head = arrowSize != null ? Math.max(6, Number(arrowSize)) : Math.max(10, height * 0.6);
    var half = head / 2;
    var shaftEnd = width - head;
    return 'M' + shaftEnd + ',' + (y - half) +
      ' L' + width + ',' + y +
      ' L' + shaftEnd + ',' + (y + half) + ' Z';
  }

  // 鱼形 path 数据（提取自旧版 raphael.ygt3.js，仅作视觉参考）
  var FISH = {
    presets: ['ygt1', 'ygt2', 'ygt3', 'ygt4', 'ygt5', 'ygt6', 'ygt7'],
    headPaths: {
      ygt1: {
        toleft: {
          g_fish_head: 'M72.27,52.36c-1.27,21.43 1.51,53.64 1.51,53.64c0,0 -20.82,-5.13 -35.42,-13.04c-5.42,-2.93 -11.72,-6.85 -16.31,-10.9c-7.79,-6.86 -12.45,-13.25 -12.45,-13.25l30.05,-7.48c0,0 -18.48,3.26 -30.05,0c-11.57,-3.25 -9.45,-5.77 -9.45,-5.77c0,0 3.18,-10.74 12.02,-21.15c5.53,-6.5 15.24,-12.44 21.68,-16.89c16.75,-11.55 46.15,-17.52 46.15,-17.52c0,0 -3.61,11.28 -5.8,25.43c-1.33,8.66 -1.45,18.8 -1.93,26.93zM42.22,21.8c-6.87,0 -12.45,5.55 -12.45,12.39c0,6.85 5.58,12.4 12.45,12.4c6.88,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.57,-12.39 -12.45,-12.39z',
          g_fish_tail: 'M51.45 79.12C50.72 75.4 49.06 70.43 46.7 66.7C44.2 62.74 40.63 59.88 38.72 57.17C36.91 54.61 36.85 52.57 36.85 52.57C36.85 52.57 37.27 50.59 39.23 48.49C41.12 46.46 44.45 44.06 46.87 40.83C48.9 38.14 50.1 34.81 51.11 31.31C54.6 19.28 51.11 0 51.11 0L0 53.6L48.06 106C48.06 106 53.69 90.51 51.45 79.12Z'
        },
        toright: {
          g_fish_head: 'M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z',
          g_fish_tail: 'M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z'
        }
      },
      ygt2: {
        toleft: {
          g_fish_head: 'M111.31 38.39C114.59 17.02 120 0 120 0C120 0 75.9 9.01 50.78 26.45C41.12 33.16 26.55 42.12 18.26 51.94C4.99 67.65 0.23 83.87 0.23 83.87C0.23 83.87 -2.96 87.67 14.4 92.58C31.75 97.49 59.47 92.58 59.47 92.58L14.4 103.87C14.4 103.87 21.38 113.52 33.07 123.87C39.97 129.98 49.41 135.9 57.54 140.32C79.43 152.26 110.66 160 110.66 160C110.66 160 106.5 111.37 108.41 79.03C109.13 66.75 109.3 51.46 111.31 38.39ZM44.66 51.61C44.66 41.28 53.02 32.9 63.33 32.9C73.65 32.9 82.01 41.28 82.01 51.61C82.01 61.95 73.65 70.32 63.33 70.32C53.02 70.32 44.66 61.95 44.66 51.61Z',
          g_fish_tail: 'M107.48,164.94C105.95,157.19 102.47,146.83 97.54,139.05C92.32,130.79 84.88,124.83 80.87,119.18C77.09,113.85 76.97,109.6 76.97,109.6C76.97,109.6 77.85,105.47 81.94,101.09C85.88,96.86 92.84,91.84 97.9,85.13C102.13,79.51 104.65,72.57 106.77,65.27C114.04,40.19 106.77,0 106.77,0L0,111.73L100.38,220.98C100.38,220.98 112.16,188.68 107.48,164.94Z'
        },
        toright: {
          g_fish_head: 'M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z',
          g_fish_tail: 'M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z'
        }
      },
      ygt3: {
        toleft: {
          g_fish_head: 'M123.67,12.56c2.26,9.22 5.28,14.86 7.61,22.49c3.77,12.38 6.13,23.45 6.13,23.45c0,0 1.19,15.97 -2.08,25.8c-3.26,9.83 -13.62,21.7 -13.62,21.7c0,0 -11.64,-8.9 -27.8799,-14.53c-16.24,-5.62 -50.25,-12.17 -50.25,-12.17c0,0 -15.94,-3.97 -25.17,-9.48c-9.24,-5.52 -18.41001,-16.03 -18.41001,-16.03c0,0 11.02001,-12.74 26.45001,-24.1c9.61,-7.09 21.63,-12.81 31.66,-17.13c26.1,-11.24 63.5999,-12.56 63.5999,-12.56c0,0 -0.3,3.34 1.96,12.56zM103.646,30.2326c0,-4.7701 -3.8701,-8.6401 -8.6401,-8.6401c-4.77,0 -8.6301,3.87 -8.6301,8.6401c0,4.77 3.8601,8.63 8.6301,8.63c4.77,0 8.6401,-3.86 8.6401,-8.63z',
          g_fish_tail: 'M25.9198 50.54L27.8898 106L-0.000175476 45.29L59.0698 0L25.9198 50.54Z'
        },
        toright: {
          g_fish_head: 'M16.89,0c0,0 37.5,1.32 63.6,12.56c10.03,4.32 22.05,10.04 31.66,17.13c15.43,11.36 26.45,24.1 26.45,24.1c0,0 -9.17,10.51 -18.41,16.03c-9.23,5.51 -25.17,9.48 -25.17,9.48c0,0 -34.01,6.55 -50.25,12.17c-16.24,5.63 -27.88,14.53 -27.88,14.53c0,0 -10.36,-11.87 -13.62,-21.7c-3.27,-9.83 -2.08,-25.8 -2.08,-25.8c0,0 2.36,-11.07 6.13,-23.45c2.33,-7.63 5.35,-13.27 7.61,-22.49c2.26,-9.22 1.96,-12.56 1.96,-12.56zM43.5942,38.8626c4.77,0 8.6301,-3.86 8.6301,-8.63c0,-4.7701 -3.8601,-8.6401 -8.6301,-8.6401c-4.77,0 -8.6401,3.87 -8.6401,8.6401c0,4.77 3.8701,8.63 8.6401,8.63z',
          g_fish_tail: 'M33.15 50.54L31.18 106L59.07 45.29L0 0L33.15 50.54Z'
        }
      },
      ygt4: {
        toleft: {
          g_fish_head: 'M94.6701,51.2193c-2.43,21.1 4.33,53.0297 4.33,53.0297c0,0 -29.3099,-4.3897 -47.1499,-13.3497c-6.67,-3.36 -14.4,-6.3101 -20.43,-11.01c-10.08,-7.86 -16.89,-17.28 -16.89,-17.28c0,0 10.36,-1.61 16.89,-3.93c6.54,-2.32 15.33,-7.46 15.33,-7.46c0,0 -21.22,-1.18 -32.22,-5.11c-11.00013,-3.93 -14.53013,-4.71 -14.53013,-4.71c0,0 8.98,-14.01 22.78013,-23.18c13.81,-9.17002 38.5,-15.32002 38.5,-15.32002c0,0 21.1799,-4.64 34.9799,-2.18c13.8099,2.47 12.9499,5.71 12.9499,5.71c0,0 -12.0999,23.69002 -14.5399,44.79002zM78.1737,25.2871c0,-4.77 -3.87,-8.64 -8.64,-8.64c-4.7799,0 -8.6499,3.87 -8.6499,8.64c0,4.78 3.87,8.65 8.6499,8.65c4.77,0 8.64,-3.87 8.64,-8.65z',
          g_fish_tail: 'M10.2299 36.3188C17.4099 31.0988 29.8599 15.7388 29.8599 15.7388C29.8599 15.7388 37.8599 5.87878 46.1499 2.50878C54.4399 -0.861221 65.1499 0.138779 65.1499 0.138779C65.1499 0.138779 53.5799 8.46878 46.1499 21.1688C41.7199 28.7488 40.3699 38.3088 39.3999 47.3788C36.8099 71.6888 56.6699 105.999 56.6699 105.999C56.6699 105.999 43.7699 99.2588 36.3899 93.0988C29.0099 86.9388 20.6999 76.1388 20.6999 76.1388C20.6999 76.1388 11.1999 62.2288 6.7899 59.1788C2.3799 56.1188 -9.91821e-05 56.1188 -9.91821e-05 56.1188L-9.91821e-05 41.5288C-9.91821e-05 41.5288 3.0599 41.5288 10.2299 36.3188Z'
        },
        toright: {
          g_fish_head: 'M0.86,8.17c0,0 -0.86,-3.24 12.95,-5.71c13.8,-2.46 34.9799,2.18 34.9799,2.18c0,0 24.69,6.15 38.5,15.32c13.8001,9.17 22.7801,23.18 22.7801,23.18c0,0 -3.53,0.78 -14.5301,4.71c-11,3.93 -32.22,5.11 -32.22,5.11c0,0 8.79,5.14 15.33,7.46c6.53,2.32 16.89,3.93 16.89,3.93c0,0 -6.81,9.42 -16.89,17.28c-6.03,4.6999 -13.76,7.65 -20.43,11.01c-17.84,8.96 -47.1499,13.35 -47.1499,13.35c0,0 6.76,-31.93 4.33,-53.03c-2.44,-21.1 -14.54,-44.79 -14.54,-44.79zM40.5364,35.6778c4.7799,0 8.6499,-3.87 8.6499,-8.65c0,-4.77 -3.87,-8.64 -8.6499,-8.64c-4.77,0 -8.64,3.87 -8.64,8.64c0,4.78 3.87,8.65 8.64,8.65z',
          g_fish_tail: 'M54.92 36.32C47.74 31.1 35.29 15.74 35.29 15.74C35.29 15.74 27.29 5.88 19 2.51C10.71 -0.86 0 0.14 0 0.14C0 0.14 11.57 8.47 19 21.17C23.43 28.75 24.78 38.31 25.75 47.38C28.34 71.69 8.48 106 8.48 106C8.48 106 21.38 99.26 28.76 93.1C36.14 86.94 44.45 76.14 44.45 76.14C44.45 76.14 53.95 62.23 58.36 59.18C62.77 56.12 65.15 56.12 65.15 56.12L65.15 41.53C65.15 41.53 62.09 41.53 54.92 36.32Z'
        }
      },
      ygt5: {
        toleft: {
          g_fish_head: 'M87.9998,52.6599c1.13,21.44 11.94,35.38 11.94,35.38c0,0 2.8502,5.45 2.7902,9.36c-0.07,3.9001 -2.7902,8.3301 -2.7902,8.3301c0,0 -26.1001,0.27 -43.2001,-2.88c-13.74,-2.53 -32.21,-9.2301 -38.9501,-11.7601c-1.6199,-0.53 -2.6,-0.99 -2.6,-0.99c0,0 0.9401,0.37 2.6,0.99c2.7901,0.91 7.4801,1.98 12.2101,1.06c7.45,-1.45 16.45,-9.46 16.45,-9.46c0,0 -6.68,4.89 -16.45,5.35c-9.77,0.46 -23.8601,-5.35 -23.8601,-5.35c0,0 -5.06981,-4.25 -5.9898,-9.29c-0.92,-5.03 2.69979,-12.51 2.69979,-12.51c0,0 5.76001,-17.6899 24.27011,-32.4999c18.51,-14.81 72.8201,-28.39 72.8201,-28.39c0,0 -13.06,31.21 -11.94,52.6599zM53.0364,49.7752c0,-5.45 -4.4199,-9.8699 -9.8699,-9.8699c-5.46,0 -9.8799,4.4199 -9.8799,9.8699c0,5.46 4.4199,9.88 9.8799,9.88c5.45,0 9.8699,-4.42 9.8699,-9.88z',
          g_fish_tail: 'M100.85 0.84C103.35 2.72 102.81 7.69 102.81 7.69C102.81 7.69 98.7304 18.35 94.9804 30.67C92.8104 37.83 89.2404 44.56 90.5804 52.69C92.0104 61.34 98.3204 69.79 104.01 77.54C112.85 89.58 121.88 99.15 121.88 99.15C121.88 99.15 123.86 100.61 123.92 102.3C123.98 103.99 121.88 106 121.88 106C121.88 106 83.9304 98.32 59.9004 89.25C35.8704 80.19 4.49041 61.98 4.49041 61.98C4.49041 61.98 0.0604095 58.44 0.000411987 54.91C-0.0595932 51.38 4.49041 47.3 4.49041 47.3C4.49041 47.3 29.0404 27.56 47.5404 17.96C66.0304 8.35 93.0204 0.84 93.0204 0.84C93.0204 0.84 98.3504 -1.05 100.85 0.84Z'
        },
        toright: {
          g_fish_head: 'M2.85001,0c0,0 54.31009,13.58 72.82009,28.39c18.5101,14.81 24.2701,32.4999 24.2701,32.4999c0,0 3.6198,7.48 2.6998,12.51c-0.92,5.04 -5.9898,9.29 -5.9898,9.29c0,0 -14.0901,5.81 -23.8601,5.35c-9.77,-0.46 -16.45,-5.35 -16.45,-5.35c0,0 9,8.01 16.45,9.46c4.73,0.92 9.42,-0.15 12.2101,-1.06c1.6599,-0.62 2.6,-0.99 2.6,-0.99c0,0 -0.9801,0.46 -2.6,0.99c-6.7401,2.53 -25.2101,9.2301 -38.9501,11.7601c-17.1,3.15 -43.20009,2.88 -43.20009,2.88c0,0 -2.72001,-4.43 -2.79001,-8.3301c-0.06,-3.91 2.79001,-9.36 2.79001,-9.36c0,0 10.80999,-13.94 11.93999,-35.38c1.12,-21.4499 -11.93999,-52.6599 -11.93999,-52.6599zM59.6233,59.6552c5.46,0 9.8799,-4.42 9.8799,-9.88c0,-5.45 -4.4199,-9.8699 -9.8799,-9.8699c-5.45,0 -9.8699,4.4199 -9.8699,9.8699c0,5.46 4.4199,9.88 9.8799,9.88z',
          g_fish_tail: 'M23.07 0.84C20.57 2.72 21.11 7.69 21.11 7.69C21.11 7.69 25.19 18.35 28.94 30.67C31.11 37.83 34.68 44.56 33.34 52.69C31.91 61.34 25.6 69.79 19.91 77.54C11.07 89.58 2.04 99.15 2.04 99.15C2.04 99.15 0.06 100.61 0 102.3C-0.06 103.99 2.04 106 2.04 106C2.04 106 39.99 98.32 64.02 89.25C88.05 80.19 119.43 61.98 119.43 61.98C119.43 61.98 123.86 58.44 123.92 54.91C123.98 51.38 119.43 47.3 119.43 47.3C119.43 47.3 94.88 27.56 76.38 17.96C57.89 8.35 30.9 0.84 30.9 0.84C30.9 0.84 25.57 -1.05 23.07 0.84Z'
        }
      },
      ygt6: {
        toleft: {
          g_fish_head: 'M9.34 160C9.34 160 40.57 152.26 62.46 140.32C70.59 135.9 80.03 129.98 86.93 123.87C98.62 113.52 105.6 103.87 105.6 103.87L60.53 92.58C60.53 92.58 88.25 97.49 105.6 92.58C122.96 87.67 119.77 83.87 119.77 83.87C119.77 83.87 115.01 67.65 101.74 51.94C93.45 42.12 78.88 33.16 69.22 26.45C44.1 9.01 0 0 0 0C0 0 5.41 17.02 8.69 38.39C10.7 51.46 10.87 66.75 11.59 79.03C13.5 111.37 9.34 160 9.34 160ZM75.34 51.61C75.34 61.95 66.98 70.32 56.67 70.32C46.35 70.32 37.99 61.95 37.99 51.61C37.99 41.28 46.35 32.9 56.67 32.9C66.98 32.9 75.34 41.28 75.34 51.61Z',
          g_fish_tail: 'M110,111.73L3.23,0C3.23,0 -4.04,40.19 3.23,65.27C5.35,72.57 7.87,79.51 12.1,85.13C17.16,91.84 24.12,96.86 28.06,101.09C32.15,105.47 33.03,109.6 33.03,109.6C33.03,109.6 32.91,113.85 29.13,119.18C25.12,124.83 17.68,130.79 12.46,139.05C7.53,146.83 4.05,157.19 2.52,164.94C-2.16,188.68 9.62,220.98 9.62,220.98L110,111.73Z'
        },
        toright: {
          g_fish_head: 'M5.80003,25.43c-2.19,-14.15 -5.8,-25.43 -5.8,-25.43c0,0 29.39997,5.97 46.14997,17.52c6.44,4.45 16.15,10.39 21.68,16.89c8.84,10.41 12.02,21.15 12.02,21.15c0,0 2.12,2.52 -9.45,5.77c-11.57,3.26 -30.05,0 -30.05,0l30.05,7.48c0,0 -4.66,6.39 -12.45,13.25c-4.59,4.05 -10.89,7.97 -16.31,10.9c-14.6,7.91 -35.41998,13.04 -35.41998,13.04c0,0 2.78,-32.21 1.51001,-53.64c-0.48001,-8.13 -0.60001,-18.27 -1.93,-26.93zM25.33,34.19c0,6.85 5.57,12.4 12.45,12.4c6.87,0 12.45,-5.55 12.45,-12.4c0,-6.84 -5.58,-12.39 -12.45,-12.39c-6.88,0 -12.45,5.55 -12.45,12.39z',
          g_fish_tail: 'M1.21113 79.12C1.94113 75.4 3.60113 70.43 5.96113 66.7C8.46113 62.74 12.0311 59.88 13.9411 57.17C15.7511 54.61 15.8111 52.57 15.8111 52.57C15.8111 52.57 15.3911 50.59 13.4311 48.49C11.5411 46.46 8.21113 44.06 5.79113 40.83C3.76113 38.14 2.56113 34.81 1.55113 31.31C-1.93887 19.28 1.55113 0 1.55113 0L52.6611 53.6L4.60113 106C4.60113 106 -1.02887 90.51 1.21113 79.12Z'
        }
      }
    },
    sizes: {
      ygt1: { head: [80, 106], tail: [53, 106] },
      ygt2: { head: [120, 160], tail: [110, 220] },
      ygt3: { head: [140, 120], tail: [70, 106] },
      ygt4: { head: [110, 110], tail: [75, 106] },
      ygt5: { head: [110, 110], tail: [130, 106] },
      ygt6: { head: [80, 106], tail: [53, 106] },
      ygt7: { head: [120, 160], tail: [110, 220] }
    },
    tailOffset: {
      ygt1: { toleft: [-45, -76], toright: [0, -31] },
      ygt2: { toleft: [-45, -135], toright: [-65, -90] },
      ygt3: { toleft: [-45, -69], toright: [0, -23] },
      ygt4: { toleft: [-44, -71], toright: [-30, -25] },
      ygt5: { toleft: [-45, -77], toright: [-85, -33] },
      ygt6: { toleft: [-45, -76], toright: [0, -31] },
      ygt7: { toleft: [-45, -135], toright: [-65, -90] }
    }
  };
  var PRESET_STYLES = {
    ygt7: {
      fill: '#FF9900',
      spineColor: '#FF9900',
      spineWidth: 10,
      finColor: '#FF9900',
      finBgColor: '#FF9900',
      textColor: '#007ADD',
      importantBg: '#FF5733',
      importantText: '#333333',
      strokeWidth: 2,
      arrowSize: 5,
      fontSize: 16,
      levels: {
        1: { finColor: '#FF9900', strokeWidth: 5.5, arrowSize: 15, textColor: '#ffffff', fontSize: 22, fontWeight: 700 },
        2: { finColor: '#FF9900', strokeWidth: 4.8, arrowSize: 12, textColor: '#000000', fontSize: 20, fontWeight: 700 },
        3: { finColor: '#FF9900', strokeWidth: 4.8, arrowSize: 12, textColor: '#000000', fontSize: 18, fontWeight: 400 }
      }
    }
  };
  var DEFAULT_STYLE = {
    fill: '#1a73e8',
    spineColor: '#1a73e8',
    spineWidth: 8,
    finColor: '#1a73e8',
    finBgColor: '#e8f0fe',
    textColor: '#1f2937',
    importantBg: '#dc2626',
    importantText: '#dc2626',
    strokeWidth: 2,
    arrowSize: 10,
    fontSize: 14,
    levels: {
      1: { finColor: '#1a73e8', strokeWidth: 2, arrowSize: 10, textColor: '#1f2937', fontSize: 13, fontWeight: 400 },
      2: { finColor: '#1a73e8', strokeWidth: 2, arrowSize: 10, textColor: '#1f2937', fontSize: 13, fontWeight: 400 },
      3: { finColor: '#1a73e8', strokeWidth: 2, arrowSize: 10, textColor: '#1f2937', fontSize: 13, fontWeight: 400 }
    }
  };
  FISH.headPaths.ygt7 = FISH.headPaths.ygt2;

  var portAttrs = {
    circle: { r: 5, magnet: true, fill: '#ffffff', stroke: '#1a73e8', strokeWidth: 1 }
  };
  var portGroups = {
    left: { position: 'left', attrs: portAttrs },
    right: { position: 'right', attrs: portAttrs },
    top: { position: 'top', attrs: portAttrs },
    bottom: { position: 'bottom', attrs: portAttrs }
  };

  function portsOf(sides) {
    var ids = String(sides).split('|');
    return {
      groups: portGroups,
      items: ids.map(function (name) {
        return { id: 'port-' + name, group: name };
      })
    };
  }

  function registerShapes() {
    if (registered) return;
    registered = true;

    X6.Graph.registerNode('fish-head', {
      inherit: 'rect',
      markup: [
        { tagName: 'path', selector: 'body' },
        { tagName: 'text', selector: 'label' }
      ],
      attrs: {
        body: { fill: '#1a73e8', stroke: '#1a73e8', strokeWidth: 2 },
        label: {
          textAnchor: 'middle', textVerticalAnchor: 'middle',
          fontSize: 16, fill: '#1a73e8', fontFamily: FONT_FAMILY
        }
      }
    }, true);

    X6.Graph.registerNode('fish-tail', {
      inherit: 'rect',
      markup: [{ tagName: 'path', selector: 'body' }],
      attrs: {
        body: { fill: '#1a73e8', stroke: '#1a73e8', strokeWidth: 2 }
      }
    }, true);

    X6.Graph.registerNode('fish-spine', {
      inherit: 'rect',
      markup: [{ tagName: 'rect', selector: 'body' }],
      attrs: {
        body: { fill: '#1a73e8', stroke: 'none', rx: 2, ry: 2 }
      }
    }, true);

    X6.Graph.registerNode('bone-node', {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' }
      ],
      attrs: {
        body: { fill: '#ffffff', stroke: '#94a3b8', strokeWidth: 1, rx: 6, ry: 6 },
        label: {
          textAnchor: 'middle', textVerticalAnchor: 'middle',
          fontSize: 13, fill: '#1f2937', fontFamily: FONT_FAMILY,
          textWrap: { width: -8, height: -6, ellipsis: true }
        }
      }
    }, true);

    X6.Graph.registerNode('group-node', {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' }
      ],
      attrs: {
        body: { fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1, rx: 8, ry: 8 },
        label: {
          textAnchor: 'middle', textVerticalAnchor: 'middle',
          fontSize: 14, fill: '#92400e', fontFamily: FONT_FAMILY,
          textWrap: { width: -8, height: -6, ellipsis: true }
        }
      }
    }, true);

    X6.Graph.registerNode('text-node', {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' }
      ],
      attrs: {
        body: { fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 3', rx: 2, ry: 2 },
        label: {
          textAnchor: 'middle', textVerticalAnchor: 'middle',
          fontSize: 13, fill: '#334155', fontFamily: FONT_FAMILY,
          textWrap: { width: 130, height: null, ellipsis: false }
        }
      }
    }, true);

    X6.Graph.registerNode('image-node', {
      inherit: 'rect',
      markup: [{ tagName: 'image', selector: 'image' }],
      attrs: {
        image: {
          refX: 0, refY: 0, refWidth: '100%', refHeight: '100%',
          preserveAspectRatio: 'xMidYMid meet', xlinkHref: IMAGE_PLACEHOLDER
        }
      }
    }, true);

    X6.Graph.registerNode('dot-node', {
      inherit: 'rect',
      markup: [
        { tagName: 'circle', selector: 'hit' },
        { tagName: 'circle', selector: 'body' }
      ],
      attrs: {
        hit: {
          cx: 9, cy: 9, r: 24,
          fill: 'transparent', stroke: 'transparent', strokeWidth: 16,
          cursor: 'move', pointerEvents: 'all'
        },
        body: {
          cx: 9, cy: 9, r: 9,
          fill: 'none', stroke: '#1a73e8', strokeWidth: 2,
          cursor: 'move', pointerEvents: 'all'
        }
      }
    }, true);

    X6.Graph.registerNode('arrow-line', {
      inherit: 'rect',
      markup: [
        { tagName: 'path', selector: 'hit' },
        { tagName: 'path', selector: 'arrow' },
        { tagName: 'path', selector: 'body' }
      ],
      attrs: {
        hit: {
          d: arrowLineLinePath(160, 24, 10), fill: 'none', stroke: 'transparent',
          strokeWidth: 10, strokeLinecap: 'butt', pointerEvents: 'all', cursor: 'pointer'
        },
        body: {
          d: arrowLineLinePath(160, 24, 10), fill: 'none', stroke: '#1a73e8',
          strokeWidth: 2, strokeLinecap: 'butt', pointerEvents: 'none'
        },
        arrow: {
          d: arrowLineHeadPath(160, 24, 10, 2), fill: '#1a73e8', stroke: '#1a73e8',
          strokeWidth: 1, strokeLinejoin: 'round', pointerEvents: 'none'
        }
      }
    }, true);

    X6.Graph.registerEdge('bone-edge', {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#1a73e8', strokeWidth: 2,
          targetMarker: blockMarkerAttrs(10, 8),
          strokeLinejoin: 'round', strokeLinecap: 'butt'
        }
      },
      connector: { name: 'normal' },
      zIndex: 0
    }, true);
  }

  function presetOf(p) {
    return FISH.headPaths[p] ? p : 'ygt1';
  }

  function styleOf(preset) {
    var p = presetOf(preset);
    return PRESET_STYLES[p] || DEFAULT_STYLE;
  }

  function levelStyle(preset, level) {
    var st = styleOf(preset);
    var defs = st.levels || {};
    // 4/5 级未单独定义时沿用最近一个已定义级别，避免回退到预设顶层样式。
    var useLevel = level;
    while (useLevel > 0 && !defs[useLevel]) useLevel -= 1;
    var ls = useLevel > 0 ? (defs[useLevel] || {}) : {};
    return {
      finColor: ls.finColor || st.finColor,
      strokeWidth: ls.strokeWidth == null ? st.strokeWidth : ls.strokeWidth,
      arrowSize: ls.arrowSize == null ? st.arrowSize : ls.arrowSize,
      textColor: ls.textColor || st.textColor,
      fontSize: ls.fontSize == null ? st.fontSize : ls.fontSize,
      fontWeight: ls.fontWeight == null ? 400 : ls.fontWeight
    };
  }

  function edgeLineAttrs(style) {
    var arrow = style.arrowSize == null ? 10 : style.arrowSize;
    var markerHeight = Math.max(4, Math.round(arrow * 0.7));
    return {
      line: {
        stroke: style.finColor || '#1a73e8',
        strokeWidth: style.strokeWidth == null ? 2 : style.strokeWidth,
        targetMarker: blockMarkerAttrs(arrow, markerHeight, style.strokeWidth),
        strokeLinecap: 'butt'
      }
    };
  }

  function blockMarkerAttrs(width, height, lineStrokeWidth) {
    var w = Math.max(4, Number(width) || 10);
    var h = Math.max(2, Number(height) || 8);
    var sw = Number(lineStrokeWidth);
    if (!(sw > 0)) sw = 2;
    return {
      name: 'block',
      width: w,
      height: h,
      refX: -(sw + 5.5),
      refY: 0
    };
  }

  function headSpec(preset, dir, title) {
    var p = presetOf(preset);
    var s = FISH.sizes[p];
    var st = styleOf(p);
    var path = FISH.headPaths[p][dir || 'toright'].g_fish_head;
    var bb = fishPathBBox(path);
    return {
      preset: p,
      dir: dir || 'toright',
      width: s.head[0],
      height: s.head[1],
      path: path,
      fill: st.fill,
      stroke: st.fill,
      labelOffX: bb
        ? ((dir === 'toleft') ? bb.x - 30 : bb.x + bb.width + 30)
        : ((dir === 'toleft') ? -(s.head[0] / 2) - 30 : s.head[0] + 30)
    };
  }

  var fishPathBBoxCache = {};
  function fishPathBBox(pathData) {
    if (typeof document === 'undefined') return null;
    if (fishPathBBoxCache[pathData]) return fishPathBBoxCache[pathData];
    try {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'absolute';
      svg.style.left = '-99999px';
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', pathData);
      svg.appendChild(p);
      document.body.appendChild(svg);
      var b = p.getBBox();
      document.body.removeChild(svg);
      var out = { x: b.x, width: b.width };
      fishPathBBoxCache[pathData] = out;
      return out;
    } catch (e) {
      return null;
    }
  }

  // 鱼头文字方向：'v' 时一个字一行，'h' 时还原为单行
  function fishLabelText(title, textDir) {
    var t = String(title == null ? '' : title).replace(/\r?\n/g, '');
    return textDir === 'v' ? t.split('').join('\n') : t;
  }

  function tailSpec(preset, dir, ax, ay) {
    var p = presetOf(preset);
    var s = FISH.sizes[p];
    var st = styleOf(p);
    var off = (FISH.tailOffset[p] || {})[dir || 'toright'] || [0, -31];
    return {
      x: ax + off[0],
      y: ay + off[1],
      width: s.tail[0],
      height: s.tail[1],
      path: FISH.headPaths[p][dir || 'toright'].g_fish_tail,
      fill: st.fill,
      stroke: st.fill
    };
  }

  function applyPresetStyle(graph, preset, dir) {
    if (!graph || typeof graph.getNodes !== 'function') return;
    var p = presetOf(preset);
    var d = dir === 'toleft' ? 'toleft' : 'toright';
    var st = styleOf(p);
    graph.getNodes().forEach(function (n) {
      if (!n || typeof n.getData !== 'function') return;
      var data = n.getData() || {};
      if (n.shape === 'fish-head' || n.shape === 'fish-tail') {
        var spec = n.shape === 'fish-head'
          ? headSpec(p, d, n.attr('label/text') || '')
          : tailSpec(p, d, n.position().x, n.position().y);
        n.resize(spec.width, spec.height);
        var body = { d: spec.path, fill: spec.fill, stroke: spec.stroke };
        if (n.shape === 'fish-head') {
          n.attr({
            body: body,
            label: {
              text: fishLabelText(n.attr('label/text') || '', data.textDir),
              refX: spec.labelOffX,
              textAnchor: d === 'toleft' ? 'end' : 'start',
              textVerticalAnchor: 'middle'
            }
          });
        } else {
          n.attr({ body: body });
        }
        n.setData(Object.assign({}, data, { ygtPreset: p, ygtDir: d }));
        return;
      }
      if (n.shape === 'fish-spine') {
        n.attr({ body: { fill: st.spineColor, stroke: st.spineColor } });
        return;
      }
      if (n.shape === 'bone-node' || n.shape === 'group-node') {
        var level = typeof data.level === 'number' ? data.level : 0;
        var ls = levelStyle(p, level);
        var labelPatch = {
          fill: data.important ? st.importantText : ls.textColor,
          fontSize: data.important ? st.fontSize : ls.fontSize,
          fontWeight: data.important ? '700' : String(ls.fontWeight)
        };
        var bodyPatch = {};
        if (level === 1) {
          bodyPatch.fill = st.finBgColor;
          bodyPatch.stroke = ls.finColor;
        } else if (data.important) {
          bodyPatch.fill = '#ffffff';
          bodyPatch.stroke = st.importantBg;
        }
        if (Object.keys(bodyPatch).length) n.attr({ body: bodyPatch });
        n.attr({ label: labelPatch });
      }
    });
    graph.getEdges().forEach(function (e) {
      if (!e || e.shape !== 'bone-edge' || typeof e.getTarget !== 'function') return;
      var t = e.getTarget();
      var tid = t && (t.cell || t);
      var tgt = tid ? graph.getCellById(tid) : null;
      var level = 0;
      if (tgt && typeof tgt.getData === 'function') {
        var td = tgt.getData() || {};
        level = typeof td.level === 'number' ? td.level : 0;
      }
      e.attr(edgeLineAttrs(levelStyle(p, level)));
    });
  }

  function buildTemplate(kind, opts) {
    var o = opts || {};
    var preset = presetOf(o.preset || 'ygt1');
    var st = styleOf(preset);
    var dir = o.dir === 'toleft' ? 'toleft' : 'toright';
    var spineY = o.spineY || 420;
    var spineX0 = o.spineX0 || 120;
    var hasGroups = !!TEMPLATE_PRESETS[kind];
    var spineX1 = o.spineX1 || (hasGroups ? spineX0 + 1140 : 720);
    var title = o.title || '问题描述';
    var cells = [];

    var hs = headSpec(preset, dir, title);
    var ts = tailSpec(preset, dir, spineX0, spineY);
    var headX = (dir === 'toleft') ? spineX0 - 80 - hs.width : spineX1 + 60;
    var headY = spineY - hs.height / 2;

    cells.push({
      id: 'tpl_head', shape: 'fish-head', x: headX, y: headY,
      width: hs.width, height: hs.height, zIndex: 1,
      attrs: {
        body: { d: hs.path, fill: hs.fill, stroke: hs.stroke },
        label: {
          text: fishLabelText(title, 'h'),
          refX: hs.labelOffX,
          textAnchor: dir === 'toleft' ? 'end' : 'start',
          textVerticalAnchor: 'middle',
          fill: hs.fill
        }
      },
      data: { ygtPreset: preset, ygtDir: dir, kind: 'head', parentId: '__ROOT__', order: 0, level: 0 },
      ports: portsOf('left|right')
    });
    cells.push({
      id: 'tpl_tail', shape: 'fish-tail', x: ts.x, y: ts.y,
      width: ts.width, height: ts.height, zIndex: 1,
      attrs: { body: { d: ts.path, fill: ts.fill, stroke: ts.stroke } },
      data: { ygtPreset: preset, ygtDir: dir },
      ports: portsOf('left|right')
    });
    cells.push({
      id: 'tpl_spine', shape: 'fish-spine',
      x: spineX0, y: spineY - st.spineWidth / 2, width: spineX1 - spineX0,
      height: st.spineWidth, zIndex: 0,
      attrs: { body: { fill: st.spineColor, stroke: 'none' } },
      ports: portsOf('left|right|top|bottom')
    });
    cells.push({ id: 'tpl_e1', shape: 'bone-edge', attrs: edgeLineAttrs(st), source: { cell: 'tpl_tail', port: 'port-right' }, target: { cell: 'tpl_spine', port: 'port-left' } });
    cells.push({ id: 'tpl_e2', shape: 'bone-edge', attrs: edgeLineAttrs(st), source: { cell: 'tpl_spine', port: 'port-right' }, target: { cell: 'tpl_head', port: 'port-left' } });

    if (TEMPLATE_PRESETS[kind]) {
      var groups = o.groups || TEMPLATE_PRESETS[kind] || TEMPLATE_PRESETS.classic;
      var ls1 = levelStyle(preset, 1);
      var ls2 = levelStyle(preset, 2);
      for (var i = 0; i < groups.length; i++) {
        var gx = spineX0 + 80 + i * 150;
        var top = i % 2 === 0;
        var gy = top ? spineY - 180 : spineY + 136;
        var gid = 'tpl_g' + i;
        cells.push({
          id: gid, shape: 'bone-node', x: gx, y: gy, width: 120, height: 44, zIndex: 2,
          attrs: {
            body: { fill: st.finBgColor, stroke: ls1.finColor },
            label: { text: groups[i], fill: ls1.textColor, fontSize: ls1.fontSize, fontWeight: ls1.fontWeight }
          },
          data: { kind: 'group', parentId: 'tpl_head', order: i, level: 1 },
          ports: portsOf('left|right|top|bottom')
        });
        cells.push({
          id: 'tpl_ge' + i, shape: 'bone-edge',
          attrs: edgeLineAttrs(ls1),
          source: { x: gx, y: spineY },
          target: { cell: gid, port: top ? 'port-bottom' : 'port-top' }
        });
        for (var k = 0; k < 2; k++) {
          var sid = 'tpl_g' + i + 's' + k;
          var sy = top ? gy + 142 - k * 64 : gy - 142 + k * 64;
          cells.push({
            id: sid, shape: 'bone-node', x: gx + 140, y: sy, width: 150, height: 36, zIndex: 2,
            attrs: { label: { text: '子原因 ' + (k + 1), fill: ls2.textColor, fontSize: ls2.fontSize, fontWeight: ls2.fontWeight } },
            data: { kind: 'bone', parentId: gid, order: k, level: 2 },
            ports: portsOf('left|right|top|bottom')
          });
          cells.push({
            id: 'tpl_' + sid + 'e', shape: 'bone-edge',
            attrs: edgeLineAttrs(ls2),
            source: { cell: 'tpl_ge' + i, anchor: { name: 'ratio', args: { ratio: (k + 1) / 3 } } },
            target: { cell: sid, port: 'port-left' }
          });
        }
      }
    }
    return cells;
  }

  function layoutPalette(items, width, gap) {
    var y = 14;
    return items.map(function (it) {
      it.x = Math.round((width - it.width) / 2);
      it.y = y;
      y += it.height + gap;
      return it;
    });
  }

  // 从 hl_ygtmx 重建鱼骨图（旧数据 positions 为空时由前端自动布局）
  function buildFromLegacyMx(mx, dir, title) {
    dir = dir === 'toleft' ? 'toleft' : 'toright';
    title = title || '鱼骨图';
    var preset = 'ygt1';
    var spineY = 420;
    var spineX0 = 120;
    var nodes = mx || [];
    var roots = nodes.filter(function (n) { return !n.parentId || n.parentId === '__ROOT__'; })
      .slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var byParent = {};
    nodes.forEach(function (n) {
      var pid = n.parentId || '__ROOT__';
      (byParent[pid] = byParent[pid] || []).push(n);
    });
    Object.keys(byParent).forEach(function (pid) {
      byParent[pid].sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    });
    var spineX1 = spineX0 + Math.max(roots.length, 1) * 150 + 60;
    var cells = [];
    var hs = headSpec(preset, dir, title);
    var ts = tailSpec(preset, dir, spineX0, spineY);
    var headX = dir === 'toleft' ? spineX0 - 80 - hs.width : spineX1 + 60;
    var headY = spineY - hs.height / 2;
    cells.push({
      id: 'ygt_head', shape: 'fish-head', x: headX, y: headY,
      width: hs.width, height: hs.height, zIndex: 1,
      attrs: {
        body: { d: hs.path, fill: hs.fill, stroke: hs.stroke },
        label: {
          text: fishLabelText(title, 'h'),
          refX: hs.labelOffX,
          textAnchor: dir === 'toleft' ? 'end' : 'start',
          textVerticalAnchor: 'middle',
          fill: hs.fill
        }
      },
      data: { ygtPreset: preset, ygtDir: dir, kind: 'head', parentId: '__ROOT__', order: 0, level: 0 },
      ports: portsOf('left|right')
    });
    cells.push({
      id: 'ygt_tail', shape: 'fish-tail', x: ts.x, y: ts.y,
      width: ts.width, height: ts.height, zIndex: 1,
      attrs: { body: { d: ts.path, fill: ts.fill, stroke: ts.stroke } },
      data: { ygtPreset: preset, ygtDir: dir },
      ports: portsOf('left|right')
    });
    cells.push({
      id: 'ygt_spine', shape: 'fish-spine',
      x: spineX0, y: spineY - 4, width: spineX1 - spineX0, height: 8, zIndex: 0,
      ports: portsOf('left|right|top|bottom')
    });
    cells.push({ id: 'ygt_e_tail', shape: 'bone-edge', source: { cell: 'ygt_tail', port: 'port-right' }, target: { cell: 'ygt_spine', port: 'port-left' } });
    cells.push({ id: 'ygt_e_head', shape: 'bone-edge', source: { cell: 'ygt_spine', port: 'port-right' }, target: { cell: 'ygt_head', port: 'port-left' } });

    var edgeSeq = 0;
    function layoutNode(node, level, parent, parentEdgeId, index) {
      var id = node.id || ('mx_node_' + (edgeSeq++));
      var gx, gy;
      var targetPort = 'port-left';
      if (level === 1) {
        gx = spineX0 + 80 + index * 150;
        gy = index % 2 === 0 ? spineY - 180 : spineY + 136;
      } else {
        var kids = byParent[parent.id] || [];
        var k = kids.indexOf(node);
        var forward = dir === 'toleft' ? -1 : 1;
        if (level % 2 === 0) {
          var towardForward = k % 2 === 0;
          var sideSign = towardForward ? forward : -forward;
          var sideKids = kids.filter(function (_, idx) { return (idx % 2 === 0) === towardForward; });
          var sideIndex = Math.max(0, sideKids.indexOf(node));
          var verticalDirection = (parent.y || 0) < spineY ? -1 : 1;
          gx = (parent.x || 0) + sideSign * 150;
          gy = (parent.y || 0) + verticalDirection * (sideIndex - (sideKids.length - 1) / 2) * 64;
          targetPort = sideSign > 0 ? 'port-left' : 'port-right';
        } else {
          var sideUp = k % 2 === 0;
          var upKids = kids.filter(function (_, idx) { return (idx % 2 === 0) === sideUp; });
          var upIndex = Math.max(0, upKids.indexOf(node));
          gx = (parent.x || 0) + forward * (150 + upIndex * 150);
          gy = (parent.y || 0) + (sideUp ? -64 : 64);
          targetPort = forward > 0 ? 'port-left' : 'port-right';
        }
      }
      var important = !!node.important;
      var order = level === 1 ? index : (byParent[parent.id] || []).indexOf(node);
      var labelAttrs = {
        text: node.label || '',
        fontSize: 13,
        fontWeight: important ? '700' : '400',
        fill: important ? '#dc2626' : '#1f2937'
      };
      var bodyAttrs = important
        ? { fill: '#fef2f2', stroke: '#dc2626' }
        : { fill: '#ffffff', stroke: '#94a3b8' };
      cells.push({
        id: id, shape: 'bone-node', x: gx, y: gy, width: 120, height: 36, zIndex: 2,
        attrs: { body: bodyAttrs, label: labelAttrs },
        data: {
          kind: level === 1 ? 'group' : 'bone',
          parentId: parent ? parent.id : '__ROOT__',
          order: order,
          level: level,
          url: node.url || '',
          openType: node.openType || 'blank'
        },
        ports: portsOf('left|right|top|bottom')
      });
      var edgeId = 'ygt_edge_' + (edgeSeq++);
      if (level === 1) {
        cells.push({
          id: edgeId, shape: 'bone-edge',
          source: { x: gx, y: spineY },
          target: { cell: id, port: index % 2 === 0 ? 'port-bottom' : 'port-top' }
        });
      } else {
        var siblingCount = (byParent[parent.id] || []).length;
        var ratio = siblingCount > 0 ? (order + 1) / (siblingCount + 1) : 0.5;
        cells.push({
          id: edgeId, shape: 'bone-edge',
          source: { cell: parentEdgeId, anchor: { name: 'ratio', args: { ratio: ratio } } },
          target: { cell: id, port: targetPort }
        });
      }
      (byParent[id] || []).forEach(function (child, ci) {
        layoutNode(child, level + 1, { id: id, x: gx, y: gy }, edgeId, ci);
      });
    }
    roots.forEach(function (root, i) { layoutNode(root, 1, null, null, i); });
    return cells;
  }

  function paletteGroups() {
    var head = headSpec('ygt1', 'toright', '鱼头');
    var tail = tailSpec('ygt1', 'toright', 0, 0);
    var skeleton = [
      {
        shape: 'fish-head', width: head.width, height: head.height,
        attrs: {
          body: { d: head.path, fill: head.fill, stroke: head.stroke },
          label: { text: '鱼头' }
        },
        data: { ygtPreset: 'ygt1', ygtDir: 'toright' },
        ports: portsOf('left|right')
      },
      {
        shape: 'fish-tail', width: tail.width, height: tail.height,
        attrs: { body: { d: tail.path, fill: tail.fill, stroke: tail.stroke } },
        data: { ygtPreset: 'ygt1', ygtDir: 'toright' },
        ports: portsOf('left|right')
      },
      {
        shape: 'fish-spine', width: 170, height: 8,
        attrs: { body: { fill: '#1a73e8' } },
        ports: portsOf('left|right')
      }
    ];
    var content = [
      { shape: 'bone-node', width: 130, height: 44, attrs: { label: { text: '一级鱼刺' }, body: { fill: '#e8f0fe', stroke: '#1a73e8' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'bone-node', width: 110, height: 36, attrs: { label: { text: '二级鱼刺' }, body: { fill: '#e0f2fe', stroke: '#0284c7' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'bone-node', width: 100, height: 32, attrs: { label: { text: '内容节点' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'group-node', width: 150, height: 60, attrs: { label: { text: '原因分组' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'text-node', width: 120, height: 40, attrs: { label: { text: '文本框' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'image-node', width: 120, height: 90, attrs: { image: { xlinkHref: IMAGE_PLACEHOLDER } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'dot-node', width: 18, height: 18, attrs: { body: { fill: 'none', stroke: '#1a73e8' } }, ports: portsOf('left|right|top|bottom') },
      { shape: 'arrow-line', width: 160, height: 24, attrs: { body: { stroke: '#1a73e8' }, arrow: { fill: '#1a73e8', stroke: '#1a73e8' } }, ports: portsOf('left|right') }
    ];
    layoutPalette(skeleton, 210, 26);
    layoutPalette(content, 210, 18);
    return {
      groups: [
        { name: 'skeleton', title: '鱼骨骨架' },
        { name: 'content', title: '鱼刺与内容' }
      ],
      skeleton: skeleton,
      content: content
    };
  }

  Y.shapes = {
    FISH: FISH,
    FONT_FAMILY: FONT_FAMILY,
    registerShapes: registerShapes,
    portsOf: portsOf,
    headSpec: headSpec,
    tailSpec: tailSpec,
    styleOf: styleOf,
    levelStyle: levelStyle,
    edgeLineAttrs: edgeLineAttrs,
    blockMarkerAttrs: blockMarkerAttrs,
    fishLabelText: fishLabelText,
    applyPresetStyle: applyPresetStyle,
    buildTemplate: buildTemplate,
    buildFromLegacyMx: buildFromLegacyMx,
    paletteGroups: paletteGroups,
    arrowLinePath: arrowLinePath,
    arrowLineLinePath: arrowLineLinePath,
    arrowLineHeadPath: arrowLineHeadPath
  };
})(window.YGT);
