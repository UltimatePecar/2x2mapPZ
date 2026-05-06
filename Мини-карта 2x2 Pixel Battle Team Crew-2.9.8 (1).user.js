// ==UserScript==
// @name         Мини-карта 2x2 Pixel Battle Team Crew
// @namespace    http://tampermonkey.net/
// @version      2.9.8
// @description  Overlay-like tool for pixelzone.io
// @author       meatie, modified by Yoldaş Pisicik. URL adaptive by Edward Scorpio. 2x2 Designed by MDOwlman.
// @match        https://pixelzone.io/*
// @homepage     https://github.com/EdwardScorpio/pz-map/
// @updateURL    
// @downloadURL  https://raw.githubusercontent.com/EdwardScorpio/pz-map/main/PBteam-map-2.0.user.js
// @icon         https://i.ibb.co/C5S0R1bV/Square-Logo2x2.png
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

/* Based on https://github.com/Pinkfloydd/ArgentinaMap_PixelZone

Инструкции

Используйте плагин Tampermonkey, чтобы внедрить это в игру. Добавьте скрипт, вставьте код.

Путь к изображениям должен быть прямым, например: https://image.com/img.png.
Код для ссылок и координат находится на 450-ых строках.
Клавиши:
Пробел : Показать и скрыть карту. Это также перезагружает изображения шаблона после обновления.
QERTYUIOP и FGHJKLZ : выбрать цвет
+/- numpad: масштабирование миникарты (Так же можно масштабировать на клавиши "-" и "=" )
0: Включить\Выключить Автовыбор цвета
9: Проверить наличие обновлений (Так же, оно выполняется автоматически при загрузке страницы PixelZone, и в настройках)

Мини-карта стартует скрытой. Чтобы она заработала - откройте её.
*/
var vers = "";
var range = 16; //margin for showing the map window
var x, y, zoomlevel, zooming_out, zooming_in, zoom_time, x_window, y_window, coorDOM, gameWindow;
var toggle_show, toggle_follow, counter, image_list, needed_templates, mousemoved;
var minimap, minimap_board, minimap_cursor, minimap_box, minimap_text;
var ctx_minimap, ctx_minimap_board, ctx_minimap_cursor,setFactionTemplates,errorDetectionEnabled;

Number.prototype.between = function (a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};
var autoColorEnabled = false;
const MINIMAP_VERSION = "2.2.19";

function startup() {
document.addEventListener('keydown', function(e) {
  if (e.key === '9') {
    checkForUpdates(false);
  }
});

setTimeout(addUpdateCheckListener, 0);
addUpdateCheckListener();

function addUpdateCheckListener() {
    const checkUpdatesButton = document.getElementById("check-updates");
    if (checkUpdatesButton && !checkUpdatesButton.hasAttribute("data-listener-added")) {
        checkUpdatesButton.addEventListener("click", () => checkForUpdates(false));
        checkUpdatesButton.setAttribute("data-listener-added", "true");
    }
}
    const versionLabel = document.getElementById("versionLabel");
if (versionLabel) {
  versionLabel.textContent = "Версия: " + MINIMAP_VERSION;
}
  window.timerDiv = undefined;
  var i, t = getCookie("baseTemplateUrl");
  var leftContainer, usersDiv, coordDiv;

  console.log("Try: listTemplates() and keys space, QERTYUIOP FGHJKLZ");
  gameWindow = document.getElementsByTagName("canvas")[0];

  leftContainer = document.getElementsByClassName("_left_16o3w_27")[0];

  usersDiv = leftContainer.childNodes[0];
  coordDiv = leftContainer.childNodes[1];

  var pixelCounter = document.createElement('div');
pixelCounter.className = '_flex_16o3w_1 _row_16o3w_8 _center_16o3w_14 _background_xd2n8_16 _padding_xd2n8_39 _margin_xd2n8_43 _fit-content_xd2n8_34 _note_9gyhg_1';
pixelCounter.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg
       width="1.2em" height="1.2em"
       viewBox="0 0 454 454"
       fill="#aaaaaa"
       stroke="Whitw" stroke-width="4"
       stroke-linecap="round" stroke-linejoin="round"
       style="margin: 2px; border-style:solid;border-width:2px">
    <g>
      <g>
        <path d="M228.062,154.507h-34.938v65.631h34.938c18.094,0,32.814-14.72,32.814-32.814 C260.877,169.23,246.156,154.507,228.062,154.507z"/>
        <path d="M0,0v454h454V0H0z M228.062,279.648h-34.938v79.398h-59.512V94.952l94.451,0.043c50.908,0,92.325,41.418,92.325,92.328 C320.388,238.232,278.971,279.648,228.062,279.648z"/>
      </g>
    </g>
  </svg>
  <span id="pixelCounter" class="notranslate">0</span>
`;
leftContainer.appendChild(pixelCounter);


  //DOM element of the displayed X, Y
  coorDOM = coordDiv.childNodes[1];

  //coordinates of the middle of the window
  x_window = y_window = 0;

  //coordinates of cursor
  x = y = 0;

  //list of all available templates
  window.template_list = null;

  //minimap zoom level
  zoomlevel = 16;

  //toggle options
  toggle_show = false;
  toggle_follow = true; //if minimap is following window, x_window = x and y_window = y;
  zooming_in = zooming_out = false;
  zoom_time = 50;

  //array with all loaded template-images
  window.image_list = [];
  counter = 0;

  //templates which are needed in the current area
  needed_templates = [];
  //Cachebreaker to force image refresh. Set it to eg. 1
  window.cachebreaker = "invisible";
var div = document.createElement('div');;
div.setAttribute('class', 'post block bc2');

    div.innerHTML = `
       <style>
    #not_Used{display:none !important}
    </style>
------- (ru) Увидел этот текст? Проверь интернет и скорость подключения<br>
-------,а может и сам сайт плохо работает.
-------(en) See this text? Check your internet connection speed<br>
------- or maybe the site itself is having issues.
-------(tr) Bu metni gördünüz mü? İnternet bağlantınızı ve hızını kontrol edin<br>
-------veya site düzgün çalışmıyor olabilir.
-------(es) ¿Ves este texto? Revisa tu conexión a internet<br>
------- o tal vez el sitio no funcione correctamente.
-------(fr) Vous voyez ce texte ? Vérifiez votre connexion internet<br>
------- ou peut-être que le site a un problème.
-------(pt) Vê este texto? Verifica a tua ligação à internet<br>
------- ou talvez o site não esteja a funcionar bem.
-------(sv) Ser du denna text? Kontrollera din internetanslutning<br>
------- eller så fungerar inte webbplatsen korrekt.
-------(fi) Näetkö tämän tekstin? Tarkista internet-yhteytesi<br>
------- tai ehkä sivusto ei toimi kunnolla.
-------(kz) Осы жазуды көрдің бе? Интернетке қосылуды тексер<br>-------немесе сайт дұрыс істемей жатқан шығар.⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
                                       ⢀⣠⡶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⢀⣤⠶⠋⣼⠁⠀⠀⠀⣀⣠⣤⣤⡶⠆⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠀⠀⢀⡴⠋⠁⠀⣸⣥⡤⠶⠛⠉⠉⢀⣴⡯⠤⠶⠚⢫⡝⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠏⢸⣇⡴⠋⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⠀⢠⡟⠀⠀⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣞⣁⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡟⣦⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⣉⡽⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣾⣉⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⢓⣲⣶⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢘⣷⣶⣶⣶⣶⣶⣶⣶⣦⣤⣤⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⠴⠖⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⠷⠀⠀⠀⠀⠉⠉⠛⠿⢿⣿⣷⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⡆⠀⠀⠀⠀⢀⣀⣤⣄⣀⣤⠉⠉⠛⢷⡀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣤⡀⠀⠀⢀⣴⣿⣯⡶⢲⡍⠁⠀⠀⠀⠈⢷⡀⢰⣆⠀⠀⠸⣟⠒⠒⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣾⣦⠦⢤⣙⡻⠿⢿⣽⠾⠇⠀⠀⠀⠀⠀⣬⣷⢸⣿⣿⣆⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣤⣆⡾⣫⢿⡄⠀⠀⠀⠀⠀⠀⠀⣻⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣰⠤⣄⡀⠀⢠⡄⢸⣿⣿⣿⣿⣿⠓⢾⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⡶⠛⢻⠏⠀⠀⣾⠁⢀⣶⢛⣦⠀⠀⠀⣿⣿⡏⠉⣹⣟⣛⣻⣯⢿⡙⠿⣿⣿⣶⣿⣿⣶⣦⣿⣿⣿⣿⣿⣿⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠁⠀⣾⠀⠀⢰⡇⠀⡾⠁⠈⡿⠀⠀⣠⣽⣿⣇⠀⢻⣭⣿⣽⠟⣨⣷⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡟⠀⢸⡇⠀⠀⣾⣿⢸⡇⠀⢸⡇⠀⢰⡿⠘⣷⢻⠀⠀⠀⣀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣧⠀⠘⣧⠀⠀⢳⣿⣾⠀⠀⢸⠁⠀⢸⡇⠀⣿⠛⣧⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣃⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⣧⣤⣿⣧⣶⣿⣿⣇⠀⠀⢸⣦⢀⣿⠀⢰⡏⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⣿⢭⣉⠛⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣾⣧⣀⣸⣿⣿⣿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣰⣿⠉⠻⡷⡄⠈⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢹⡿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⢾⣸⡶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⣿⣿⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠻⣄⠉⠓⠾⠿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠻⣷⡝⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⢀⣷⡇⠀⢸⠓⠶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣷⣤⣀⠀⠀⠈⠹⠿⣿⣿⣿⣿⡟⠀⣿⠁⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⡇⠀⢸⠀⠀⠀⠙⠳⠶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣶⣶⣶⣶⣾⣿⣿⣿⡇⠀⣿⠂⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⠀⠀⣼⠀⢀⠀⠀⠀⠀⠀⠉⠙⠳⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢫⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⢹⠀⠀⣿⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⣉⣻⠦⠄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣠⢾⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⣾⡿⢀⡴⠋⠀⠀⠀⢀⡤⠀⠀⠀⣀⡴⠞⣉⣤⣶⣦⡘⠦⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢭⣿⣛⡛⢿⣿⣿⡿⠿⢿⢛⣛⣛⣯⣥⣾⡟⣻⠟⠛⠀⠀⠀⢀⡴⠋⠀⠀⣠⠞⣡⣴⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠻⠃⠙⠻⢿⢿⣿⣿⣿⣷⠀⠀⢹⣿⡆⢻⣹⡇⣾⣿⣿⠟⠋⠀⠀⡾⢱⡏⠀⠀⢰⣯⡿⠋⠀⢀⡴⢋⣵⣾⣿⣿⣿⣿⣿⣿⡌⠉⠻⡄⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠛⣿⣿⣿⣿⣿⣿⣷⣮⣿⡁⢸⣿⡇⠿⠋⠀⠀⣀⠀⢸⡇⠻⣄⣀⠀⠙⢁⣤⢖⡷⢋⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⣸⠃⠀⠀
⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡽⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⢻⡇⠀⠀⠀⡼⠃⠀⠀⠙⠳⠮⣭⣝⡛⠛⡿⠋⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⡀⠀⠀
⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣸⣸⡇⠀⢀⡾⠁⠀⠀⠀⠀⣀⣀⡀⢈⣙⣛⣛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀

<style>
  #minimapbg {
    background: linear-gradient(to bottom, #dfdfdf, #9f9f9f);
    border-radius: 25px 25px 25px 25px;
    border: 2px solid black;
    box-shadow: inset 0 0 4px #666, 0 4px 10px rgba(0, 0, 0, 0.5);
    padding: 6px;
  }

  #minimap-text,
  #minimap-title {
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
  }

  #minimap-config,
  #minimap_settings {
    background: linear-gradient(to bottom, #dbdbdb, #b1b1b1);
    border: 2px solid #777;
    border-radius: 12px;
    box-shadow: inset 0 0 6px #666, 0 2px 6px rgba(0, 0, 0, 0.4);
    padding: 6px;
  }
   #minimap_settings button,
  #minimap_settings span,
  #minimap_settings select,
  #minimap_settings input[type="range"] {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 3px rgba(255, 255, 255, 0.3);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }

  #minimap_settings button:active,
  #minimap_settings span:active,
  #minimap_settings select:active,
  #minimap_settings input[type="range"]:active {
    transform: scale(0.97);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
  }

  #settings-title {
    background: linear-gradient(to bottom, #333, #000);
    color: white;
    box-shadow: inset 0 0 3px #000;
    text-shadow: 1px 1px 0 #000;
    border-radius: 50px 50px 50px 50px;
  }

  #infoContent {
    background: #eaeaea;
    border: 1px solid #aaa;
    border-radius: 6px;
    box-shadow: inset 0 0 4px #bbb;
    color: #333;
  }

  #volumeSlider,
  #transparencySlider {
    background: linear-gradient(to right, #eee, #ccc);
    box-shadow: inset 0 0 2px #999;
  }

  #volumeSlider::-webkit-slider-thumb,
  #transparencySlider::-webkit-slider-thumb {
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
  }

  #minimap-config span,
  #autoColorButton,
  #zoomDisplay {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 3px rgba(255, 255, 255, 0.3);
    transition: transform 0.1s ease, box-shadow 0.2s ease;
  }

  #minimap-config span:active,
  #autoColorButton:active {
    transform: scale(0.96);
    box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.4);
  }

  #zoomDisplay {
    background: linear-gradient(to bottom, #333, #111);
    color: white;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.8em;
    text-align: center;
  }
</style>

<!-- Подключение стандартной HTML-структуры карты без изменений -->
<div id="minimapbg" style="background-color:rgba(202,202,202,100%); border-radius:25px 25px 25px 25px; position:absolute;right:5px; bottom:0; z-index:1;border-style:solid;border-width:2px 2px 2px 2px;border-color:black">
    <div class="posy unselectable" id="posyt" style="background-size:100%;font-size:1.1em; color:#fff; text-align:center; line-height:18px; vertical-align:middle; width:auto; height:auto; padding:2px 2px 4px 2px;">
      <div id="minimap-text" style="background:DimGray;padding-left:10px;padding-right:10px;padding-top:2px;padding-bottom:2px;border-radius:20px 20px 0 0 ;user-select:none;"></div>
      <div id="minimap-title" style="line-height:17px;font-size:1.05em;background:Black;Border-radius:20px 20px 0 0;user-select:none;padding:6px 6px 4px 6px;">=2X2 МИНИ-КАРТА=</div>
      <div id="minimap-box" style="position:relative;width:390px;height:280px">
        <canvas id="minimap" style="width: 100%; height: 100%;z-index:1;position:absolute;top:0;left:0;"></canvas>
        <canvas id="minimap-board" style="width: 100%; height: 100%;z-index:2;position:absolute;top:0;left:0;"></canvas>
        <canvas id="minimap-cursor" style="width: 100%; height: 100%;z-index:3;position:absolute;top:0;left:0;"></canvas>
      </div>
<div id="minimap-config" style="line-height:32px;border-style:solid;border-width:2px 2px 2px 2px;border-color:Gray;border-radius:5px 5px 5px 5px;background:#999999;padding:3px 1px 3px 1px;margin:4px 3px 1px 3px">
  <span id="hide-map" style="cursor:pointer;user-select:none;font-size:0.95em;background:#1164B4;padding-left:4px;padding-right:4px;border-radius:8px 0 0 8px;margin-left:4px;margin-right:0px;border-style:solid;border-width:1px 2px 4px 2px;border-color:#004292">Скрыть</span>
  <span id="settings-map" style="cursor:pointer;user-select:none;font-size:0.95em;background:Teal;padding-left:4px;padding-right:4px;border-radius:0 8px 8px 0;margin-right:2px;border-style:solid;border-width:1px 2px 4px 2px;border-color:#007070">Настройки</span>
  <span id="zoom-plus" style="cursor:pointer;font-weight:bold;font-size:0.95em;user-select:none;background:Crimson;padding-left:0;padding-right:0;border-corner-shape:bevel;border-radius:12px 12px 2px 2px;border-style:solid;border-width:1px 2px 4px 2px;border-color:#BA021A";margin-left:0>&nbsp;+&nbsp;</span>
</span>
  <span id="zoom-minus" style="cursor:pointer;font-weight:bold;font-size:0.95em;user-select:none;background:Blue;padding-left:0;padding-right:0;border-corner-shape:bevel;border-radius:2px 2px 12px 12px;border-style:solid;border-width:1px 2px 4px 2px;border-color:#0000AA";margin-left:0>&nbsp;-&nbsp;</span>
  <span id="autoColorButton" style="cursor:pointer;font-weight:bold;font-size:0.95em; padding:0 6px 0 6px;border-radius:8px;background:black;margin-left:0;margin-right:2px;text-transform:none;border-style:solid;border-width:3px 3px 3px 3px;border-color:Slategray;transition: background-color 0.2s ease, color 0.8s ease;">Авто-цвет</button>
  </label>
</div>
    </div>
<div id="minimap_settings" style="background-size:100%;border-radius:20px 20px 0 0; width:auto; height:auto; text-align:center; display:none;padding: 4px 4px 0 4px;">
      <div id="settings-title" style="line-height:16px;font-size:0.95em;user-select:none;padding:4px 0 4px 0;background:Black;border-radius:50px 50px 0 0">Настройки Мини-Карты</div>
      <p>
      </figure style="background:Black;border-radius:2px;">
      <div id="infoButton" style="display:inline-block; background-color:black; color:white; padding:2px 4px 4px 2px;margin:4px 20px 4px 0px border:none; border-radius:4px; cursor:pointer; font-size:0.95em;">
  Информация
</div>
<div id="infoContent" style="display:none; margin-top:10px; padding:10px; background-color:#f1f1f1; border:1px solid #ccc; border-radius:4px; font-size:0.95em; color:#333;">
<div id="infoText">
<p> Привет фанат телеканала 2х2!
<p>Данная мини-карта сделана специально для тебя!
  <p> Данная мини-карта была создана благодаря следующим людям:
  <p> Генерал Пиксельных войн Edward Scorpio
  <p> Генерал Пиксельных войн Ultimate Pekar
  <p> Генерал-Комендаторе MDOwlman.
  <p> Данная карта была официально создана 18 сентября 2024 года.
  </div>
  <img class="background-image"
  src="data:image/svg+xml;charset=UTF-8,%3c?xml version='1.0' encoding='UTF-8'?%3e%3c!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='250px' height='108px' style='shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%3e%3cpath style='opacity:1' fill='%23020202' d='M -0.5,-0.5 C 82.8333,-0.5 166.167,-0.5 249.5,-0.5C 249.5,35.5 249.5,71.5 249.5,107.5C 166.167,107.5 82.8333,107.5 -0.5,107.5C -0.5,71.5 -0.5,35.5 -0.5,-0.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%238a8a8a' d='M 76.5,24.5 C 59.5,24.5 42.5,24.5 25.5,24.5C 25.5,29.1667 25.5,33.8333 25.5,38.5C 24.5128,33.6946 24.1795,28.6946 24.5,23.5C 42.008,23.17 59.3414,23.5033 76.5,24.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23fbfbfb' d='M 76.5,24.5 C 79.9875,25.1434 82.4875,27.1434 84,30.5C 84.4998,40.828 84.6665,51.1613 84.5,61.5C 69.8333,61.5 55.1667,61.5 40.5,61.5C 39.5318,63.6074 39.1984,65.9407 39.5,68.5C 54.5,68.5 69.5,68.5 84.5,68.5C 84.5,73.1667 84.5,77.8333 84.5,82.5C 64.8333,82.5 45.1667,82.5 25.5,82.5C 25.5,73.1667 25.5,63.8333 25.5,54.5C 26.1434,51.0125 28.1434,48.5125 31.5,47C 44.1623,46.5001 56.8289,46.3334 69.5,46.5C 69.5,43.8333 69.5,41.1667 69.5,38.5C 54.8333,38.5 40.1667,38.5 25.5,38.5C 25.5,33.8333 25.5,29.1667 25.5,24.5C 42.5,24.5 59.5,24.5 76.5,24.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23fbfbfb' d='M 223.5,68.5 C 223.5,73.1667 223.5,77.8333 223.5,82.5C 203.833,82.5 184.167,82.5 164.5,82.5C 164.334,72.4944 164.5,62.4944 165,52.5C 166.48,49.1828 168.98,47.1828 172.5,46.5C 184.833,46.5 197.167,46.5 209.5,46.5C 209.806,43.6146 209.473,40.9479 208.5,38.5C 193.833,38.5 179.167,38.5 164.5,38.5C 164.5,33.5 164.5,28.5 164.5,23.5C 181.837,23.3334 199.17,23.5001 216.5,24C 219.583,24.786 221.749,26.6193 223,29.5C 223.5,39.828 223.666,50.1613 223.5,60.5C 208.833,60.5 194.167,60.5 179.5,60.5C 179.5,63.1667 179.5,65.8333 179.5,68.5C 194.167,68.5 208.833,68.5 223.5,68.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23aaaaaa' d='M 108.5,29.5 C 103.305,29.1795 98.3054,29.5128 93.5,30.5C 92.9569,30.44 92.6236,30.1067 92.5,29.5C 97.9864,28.1853 103.32,28.1853 108.5,29.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23a7a7a7' d='M 138.5,29.5 C 143.68,28.1853 149.014,28.1853 154.5,29.5C 154.376,30.1067 154.043,30.44 153.5,30.5C 148.695,29.5128 143.695,29.1795 138.5,29.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23f8f8f8' d='M 108.5,29.5 C 113.839,34.1727 118.839,39.1727 123.5,44.5C 128.881,39.7852 133.881,34.7852 138.5,29.5C 143.695,29.1795 148.695,29.5128 153.5,30.5C 146.695,38.474 139.695,46.3074 132.5,54C 139.685,61.6837 146.685,69.517 153.5,77.5C 148.695,78.4872 143.695,78.8205 138.5,78.5C 133.881,73.2148 128.881,68.2148 123.5,63.5C 118.839,68.8273 113.839,73.8273 108.5,78.5C 103.305,78.8205 98.3054,78.4872 93.5,77.5C 101.018,70.1473 108.018,62.314 114.5,54C 108.047,45.7117 101.047,37.8783 93.5,30.5C 98.3054,29.5128 103.305,29.1795 108.5,29.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23767676' d='M 208.5,38.5 C 209.473,40.9479 209.806,43.6146 209.5,46.5C 197.167,46.5 184.833,46.5 172.5,46.5C 184.322,45.5049 196.322,45.1716 208.5,45.5C 208.5,43.1667 208.5,40.8333 208.5,38.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%233b3b3b' d='M 40.5,61.5 C 40.5,63.5 40.5,65.5 40.5,67.5C 55.3428,67.1707 70.0095,67.504 84.5,68.5C 69.5,68.5 54.5,68.5 39.5,68.5C 39.1984,65.9407 39.5318,63.6074 40.5,61.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%239e9e9e' d='M 93.5,77.5 C 98.3054,78.4872 103.305,78.8205 108.5,78.5C 103.32,79.8147 97.9864,79.8147 92.5,78.5C 92.6236,77.8933 92.9569,77.56 93.5,77.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23a3a3a3' d='M 153.5,77.5 C 154.289,77.7828 154.956,78.2828 155.5,79C 149.651,79.8184 143.985,79.6517 138.5,78.5C 143.695,78.8205 148.695,78.4872 153.5,77.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23959595' d='M 25.5,54.5 C 25.5,63.8333 25.5,73.1667 25.5,82.5C 45.1667,82.5 64.8333,82.5 84.5,82.5C 64.6736,83.4971 44.6736,83.8305 24.5,83.5C 24.1729,73.6522 24.5062,63.9856 25.5,54.5 Z'/%3e%3c/g%3e%3cg%3e%3cpath style='opacity:1' fill='%23898989' d='M 223.5,68.5 C 224.487,73.3054 224.821,78.3054 224.5,83.5C 204.326,83.8305 184.326,83.4971 164.5,82.5C 184.167,82.5 203.833,82.5 223.5,82.5C 223.5,77.8333 223.5,73.1667 223.5,68.5 Z'/%3e%3c/g%3e%3c/svg%3e ");
  " alt="Фоновое изображение">
  </div>
    <span id="languageLabel" style="user-select: none; padding: 0 4px 0 4px;margin:20px 40px 20px 30px font-size:0.95em; background:DarkGrey; border-radius:4px;">
    Язык&nbsp;
  </span>
  <select id="languageSelect" style="margin-left:6px; outline:0; font-family:Nunito,sans-serif; border-radius:5px;">
    <option value="ru">🇷🇺 Русский</option>
    <option value="en">🇬🇧 English</option>
    <option value="es">🇪🇸 Español</option>
    <option value="tr">🇹🇷 Türkçe</option>
    <option value="fi">🇫🇮 Suomi</option>
    <option value="fr">🇫🇷 Français</option>
    <option value="pt">🇵🇹 Português</option>
    <option value="sv">🇸🇪 Svenska</option>
    <option value="kk">🇰🇿 Қазақша</option>
  </select>
  <p>
      <span id="volumeLabel" style="font-size:0.9em; color:#222222;background-color:LimeGreen;padding:4px 2px 4px 2px;border-radius:2px">Звук:</span>
<input type="range" id="volumeSlider" min="0" max="100" value="100" style="text-align:center; width:180px; height:8px; border-radius:5px;appearance: none; outline: none;">
<style>
  /* Стиль для контейнера ползунка */
  #volumeSlider {
    -webkit-appearance: none; /* Для Webkit-браузеров */
    width: 40px;              /* Ширина ползунка */
    height: 12px;               /* Высота дорожки */
    background: #ffffff;         /* Цвет фона дорожки */
    border-radius: 3px;       /* Скругление дорожки */
    outline: none;             /* Убираем обводку */
    cursor: pointer;          /* Указатель-курсор при наведении */
  }

  /* Стиль для бегунка ползунка */
  #volumeSlider::-webkit-slider-thumb {
    -webkit-appearance: none; /* Для Webkit-браузеров */
    width: 10px;              /* Ширина бегунка */
    height: 18px;             /* Высота бегунка */
    background:FireBrick;      /* Цвет бегунка */
    border-radius: 2px;       /* Круглый бегунок */
    cursor: pointer;          /* Указатель-курсор */
    border: none;              /* Без обводки */
  }

  #volumeSlider::-webkit-slider-runnable-track {
    height: 18px;
    width: 40px;
    background:LightCoral;
    border-radius: 1px;
  }
</style><p>
 <style>
  #transparencySlider {
    -webkit-appearance: none;
    width: 150px;
    height: 18px;
    background: #aaaaaa;
    border-radius: 1px;
    outline: none;
  }
  #transparencySlider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 18px;
    background: Steelblue;
    border-radius: 2px;
    cursor: pointer;
    border: none;
  }
</style>
<span id="transparencyLabel" style="font-size:0.9em; color:#222222; background-color:YellowGreen; padding:4px 2px 4px 2px; border-radius:2px;">
  Прозрачность:
</span>
<input type="range" id="transparencySlider" min="0" max="100" value="100">
  <p>
<span id="check-updates" style="cursor:pointer;user-select:none;background:#01796F;padding-left:4px;padding-right:4px;border-radius:4px;">Обновления</span>
<span id="versionLabel" style="font-size:0.95em;color:#0fffff;background:Blue;padding-left:4px;padding-right:4px;border-radius:8px;">Версия: 2.2.19</span>
<p>
<span id="settings-map-2" style="cursor:pointer;user-select:none;text-align:center;background:#003153;padding-left:4px;padding-right:4px;border-radius:4px;">Вернуться</span>
    </div>
  </div>
`;

document.body.appendChild(div);

    const Lang = localStorage.getItem("minimapLang") || "ru";
const languageSelect = document.getElementById("languageSelect");
if (languageSelect) {
  languageSelect.value = Lang;
  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    localStorage.setItem("minimapLang", lang);
    updateLanguage(lang);
      const infoEl = document.getElementById("infoContent");
  if (infoEl && texts.infoContent && texts.infoContent[lang]) {
    infoEl.innerHTML = texts.infoContent[lang];
     const infoButton = document.getElementById('infoButton')
  }
      const infoTextEl = document.getElementById("infoText");
if (infoTextEl && texts.infoContent && texts.infoContent[lang]) {
    infoTextEl.innerHTML = texts.infoContent[lang];
    const versionEl = document.getElementById("versionLabel");
if (versionEl && texts.version && texts.version[lang]) {
  versionEl.textContent = texts.version[lang] + ": " + MINIMAP_VERSION;
}
   vers = texts.versionTitle[lang] || "=2X2 МИНИ-КАРТА=";
const title = document.getElementById("minimap-title");
if (title) title.textContent = vers;
}
  });
}
 document.getElementById("transparencySlider").addEventListener("input", function() {
  var value = this.value;
  // Изменяем прозрачность фона мини-карты
  document.getElementById("minimapbg").style.backgroundColor = "rgba(202,202,202," + (value / 100) + ")";
});
function setScriptVersion() {
  const versionSpan = document.getElementById('script-version');
  if (versionSpan) {
    versionSpan.textContent = + GM_info.script.version;
  }
}
const volSlider = document.getElementById("volumeSlider");
const savedVol = parseInt(localStorage.getItem("minimapVolume") || "100", 10);

function setVolume(percent) {
  const v = percent / 100;
  Object.values(audioEls).forEach(a => a.volume = v);
}

if (volSlider) {
  volSlider.value = savedVol;
  setVolume(savedVol);

  volSlider.addEventListener("input", () => {
    const v = parseInt(volSlider.value, 10);
    localStorage.setItem("minimapVolume", v);
    setVolume(v);
  });
}

  minimap = document.getElementById("minimap");
  minimap_board = document.getElementById("minimap-board");
  minimap_cursor = document.getElementById("minimap-cursor");
  minimap.width = minimap.offsetWidth;
  minimap_board.width = minimap_board.offsetWidth;
  minimap_cursor.width = minimap_cursor.offsetWidth;
  minimap.height = minimap.offsetHeight;
  minimap_board.height = minimap_board.offsetHeight;
  minimap_cursor.height = minimap_cursor.offsetHeight;
  ctx_minimap = minimap.getContext("2d");
  ctx_minimap_board = minimap_board.getContext("2d");
  ctx_minimap_cursor = minimap_cursor.getContext("2d");
  minimap_box = document.getElementById("minimap-box");
  minimap_text = document.getElementById("minimap-text");

  //No Antialiasing when scaling!
  ctx_minimap.mozImageSmoothingEnabled = false;
  ctx_minimap.webkitImageSmoothingEnabled = false;
  ctx_minimap.msImageSmoothingEnabled = false;
  ctx_minimap.imageSmoothingEnabled = false;

  //Bugfix really
  document.getElementsByClassName("_pointer-children_xd2n8_73")[0].style = "max-height:1px";

  toggleShow(toggle_show);

  drawBoard();
  drawCursor();

  document.getElementsByClassName("_ratio_1owdq_1")[0].parentElement.style = "position:absolute;left:158px;zoom:0.66";

  var pal = document.getElementsByClassName("_ratio_1owdq_1")[0].firstChild.firstChild;

  // Loop the color divs, add tooltips
  for (i = 0; i < 16; i++) {
    pal.childNodes[i].firstChild.title = "QERTYUIOPFGHJKLZ".substr(i, 1) + ":" + i;
  }

document.getElementById("hide-map").onclick = function () {
  audioEls.hideMap.currentTime = 0;
  audioEls.hideMap.play();
  toggleShow(false);
};
  minimap_text.onclick = function () {
  audioEls.openMap.currentTime = 0;
  audioEls.openMap.play();
  toggleShow(true);
};
  document.getElementById("settings-map").onclick = function () {
  audioEls.settings.currentTime = 0;
  audioEls.settings.play();
  document.getElementById("minimap_settings").style.display = 'block';
  document.getElementById("posyt").style.display = 'none';
};

  document.getElementById("settings-map-2").onclick = function () {
  audioEls.back.currentTime = 0;
  audioEls.back.play();
    document.getElementById("minimap_settings").style.display = 'none';
  document.getElementById("posyt").style.display = 'block';
 };
  document.getElementById("zoom-plus").addEventListener('mousedown', function (e) {
    e.preventDefault();
    zooming_in = true;
    zooming_out = false;
  audioEls.zoomIn.currentTime = 0;
  audioEls.zoomIn.play();
    zoomIn();
  }, false);
const zoomMinus = document.getElementById("zoom-minus");
if (zoomMinus) {
  zoomMinus.addEventListener('mousedown', function (e) {
    e.preventDefault();
    audioEls.zoomOut.currentTime = 0;
    audioEls.zoomOut.play();
    zooming_out = true;
    zoomOut();
  }, false);
  zoomMinus.addEventListener('mouseup', function () {
    zooming_out = false;
  }, false);
}

  gameWindow.addEventListener('mouseup', function (evt) {
    if (!toggle_show) return;
    if (!toggle_follow) setTimeout(getCenter, 1650);
  }, false);

  gameWindow.addEventListener('mousemove', mymousemove, false);

  setInterval(updateloop, 5e3);

  updateloop();

  setInterval(function () {
    if (mousemoved) {
      mousemoved = false;
      loadTemplates();
    }
  }, 20);
setTimeout(() => {
  const Lang = localStorage.getItem("minimapLang") || "ru";
  updateLanguage(Lang);
}, 100);
document.getElementById('infoButton').addEventListener('click', function(){
   audioEls.info.currentTime = 0;
   audioEls.info.play();
    var infoDiv = document.getElementById('infoContent');
    if(infoDiv.style.display === 'none' || infoDiv.style.display === ''){
      infoDiv.style.display = 'block';
    } else {
      infoDiv.style.display = 'none';
    }
  });
autoColorButton.addEventListener("click", function() {
  // 1) переключаем флаг
  autoColorEnabled = !autoColorEnabled;

  // 2) проигрываем правильный звук
  if (autoColorEnabled) audioEls.autoOn.currentTime = 0, audioEls.autoOn.play();
  else                  audioEls.autoOff.currentTime = 0, audioEls.autoOff.play();

  // 3) меняем фон (как было)
  autoColorButton.style.backgroundColor = autoColorEnabled ? "#33CA33" : "#000000";
  autoColorButton.style.color = "#ffffff";

  // 4) подхватываем язык (с учётом возможного null)
  const lang = (languageSelect && languageSelect.value)
                || localStorage.getItem("minimapLang")
                || "ru";

  // 5) берём правильный ключ в словаре
  const key = autoColorEnabled ? "autoColorOn" : "autoColorOff";

  // 6) ставим текст из словаря
  autoColorButton.textContent = texts[key][lang];

  console.log("Auto-Color is now " + (autoColorEnabled ? "ENABLED" : "DISABLED"));
});

}

window.addEventListener('load', function () {
  var loadInt = setInterval(() => {
    window.timerDiv = document.getElementsByClassName("_center_16o3w_14 _top_16o3w_18 _fit-content_xd2n8_34")[0].attributes;

    if (window.timerDiv.length > 0) {
      clearInterval(loadInt)

      startup();
    }
  }, 100)
}, false);
// === СТАБИЛЬНОЕ ПЕРЕТАСКИВАНИЕ + МАГНИТ + ОТКРЫТИЕ (без ломания startup) ===
(function () {
  // не ломаем выполнение, ловим любые ошибки
  try {
    const LOG_PREFIX = "minimap-drag:";
    let tries = 0;

    function waitFor() {
      tries++;
      const map = document.getElementById("minimapbg");
      if (!map) {
        if (tries < 12) {
          setTimeout(waitFor, 200);
          return;
        } else {
          console.warn(LOG_PREFIX, "element #minimapbg not found — giving up");
          return;
        }
      }
      attach(map);
    }

    function attach(map) {
      if (map.__minimapDragAttached) return;
      map.__minimapDragAttached = true;

      // Надёжные CSS-основы — фиксируем поведение
      map.style.position = map.style.position || "fixed";
      map.style.zIndex = map.style.zIndex || 9999;
      map.style.touchAction = "none"; // чтобы pointer события работали плавно

      // Восстановление позиции (не ломает, если нет данных)
      try {
        const saved = JSON.parse(localStorage.getItem("minimapPosition") || "{}");
        if (saved && saved.anchor === "right") {
          map.style.right = (saved.right ?? 10) + "px";
          map.style.left = "auto";
          map.style.bottom = (saved.bottom ?? 10) + "px";
        } else if (saved && typeof saved.left === "number") {
          map.style.left = (saved.left ?? 10) + "px";
          map.style.bottom = (saved.bottom ?? 10) + "px";
          map.style.right = "auto";
        }
      } catch (e) { /* ignore */ }

      let dragging = false;
      let startX = 0, startY = 0, startLeft = 0, startBottom = 0;
      let moved = false;

      function isInteractive(node) {
        if (!node) return false;
        if (node.closest) {
          if (node.closest("#minimap_settings") || node.closest("#minimap-config") || node.closest("#minimap-config") ) return true;
          if (node.closest("button, input, select, canvas, a, label")) return true;
          if (node.closest("[data-action], [onclick], [role='button'], [tabindex]")) return true;
        }
        // fallback: tag check upward
        let el = node;
        while (el && el !== document) {
          const t = el.tagName && el.tagName.toLowerCase();
          if (["button","input","select","label","a","canvas","svg"].includes(t)) return true;
          el = el.parentElement;
        }
        return false;
      }

      map.addEventListener("pointerdown", function (ev) {
        // не начинаем перетаскивание, если кликнули по контролу внутри карты
        if (isInteractive(ev.target)) return;
        dragging = true;
        moved = false;
        startX = ev.clientX; startY = ev.clientY;
        const r = map.getBoundingClientRect();
        startLeft = r.left;
        startBottom = window.innerHeight - r.bottom;
        map.setPointerCapture && map.setPointerCapture(ev.pointerId);
        map.style.cursor = "grabbing";
      }, { passive: false });

      window.addEventListener("pointermove", function (ev) {
        if (!dragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
        // Передвигаем, используя left/bottom, и снимаем right, если он был
        map.style.left = (startLeft + dx) + "px";
        map.style.bottom = (startBottom - dy) + "px";
        map.style.right = "auto";
      }, { passive: true });

      window.addEventListener("pointerup", function (ev) {
        if (!dragging) return;
        dragging = false;
        map.releasePointerCapture && map.releasePointerCapture(ev.pointerId);
        map.style.cursor = "grab";

        // Привязка к краям (порог 10px)
        const r = map.getBoundingClientRect();
        const TH = 10;
        const nearLeft = r.left <= TH;
        const nearRight = window.innerWidth - r.right <= TH;
        const nearBottom = window.innerHeight - r.bottom <= TH;

        if (nearLeft) {
          map.style.left = "0px"; map.style.right = "auto";
        } else if (nearRight) {
          map.style.right = "0px"; map.style.left = "auto";
        }
        if (nearBottom) map.style.bottom = "0px";

        // Сохраняем позицию
        try {
          const cs = getComputedStyle(map);
          const save = {
            left: cs.left === "auto" ? undefined : parseInt(cs.left) || 0,
            right: cs.right === "auto" ? undefined : parseInt(cs.right) || 0,
            bottom: parseInt(cs.bottom) || 0,
            anchor: cs.left === "auto" ? "right" : "left"
          };
          localStorage.setItem("minimapPosition", JSON.stringify(save));
        } catch (e) { console.warn("minimap-drag: save failed", e); }

        // Если карта действительно двигалась и отпущена у края — считаем это "стуком" и открываем карту
        if (moved && (nearLeft || nearRight)) {
          try {
            // Открытие: щёлкаем элемент, который управляет показом (minimap_text открывает карту в original code)
            const openEl = document.getElementById("minimap-text") || document.getElementById("settings-map") || document.getElementById("hide-map");
            if (openEl) {
              // если карта скрыта, клик по minmap-text открывает
              openEl.click();
            } else {
              // альтернативный: вызвать toggleShow(true), если доступен
              if (typeof toggleShow === "function") toggleShow(true);
            }
          } catch (e) { /* ignore */ }
        }
      }, { passive: true });

      // При ресайзе подведём карту в зону видимости
      window.addEventListener("resize", function () {
        const r = map.getBoundingClientRect();
        let changed = false;
        if (r.right > window.innerWidth) { map.style.left = Math.max(10, window.innerWidth - r.width - 10) + "px"; map.style.right = "auto"; changed = true;}
        if (r.bottom > window.innerHeight) { map.style.bottom = "10px"; changed = true;}
        if (changed) {
          try {
            const cs = getComputedStyle(map);
            localStorage.setItem("minimapPosition", JSON.stringify({
              left: cs.left === "auto" ? undefined : parseInt(cs.left) || 0,
              right: cs.right === "auto" ? undefined : parseInt(cs.right) || 0,
              bottom: parseInt(cs.bottom) || 0,
              anchor: cs.left === "auto" ? "right" : "left"
            }));
          } catch (e) {}
        }
      });

      console.log("minimap-drag: attached and ready");
    }

    waitFor();
  } catch (err) {
    console.error("minimap-drag: unexpected error", err);
  }
})();

const sounds = {
    openMap:   "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/openMap.mp3",
    hideMap:   "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/hideMap.mp3",
    settings:  "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/settings.mp3",
    zoomIn:    "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/zoomIn.mp3",
    zoomOut:   "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/zoomOut.mp3",
    autoOn:    "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/autoOn.mp3",
    autoOff:   "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/autoOff.mp3",
    info:      "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/info.mp3",
    back:      "https://github.com/EdwardScorpio/pz-map/raw/refs/heads/main/MiniMap%20Sound/back.mp3"
};

const audioEls = {};
Object.entries(sounds).forEach(([key, url]) => {
  const a = new Audio(url);
  a.preload = "auto";
  audioEls[key] = a;
});

function mymousemove(evt) {
  if (!toggle_show || !coorDOM) return;

  var coordsXY = coorDOM.innerHTML.split(/\s?[xy:]+/);

  var x_new = parseInt(coordsXY[1]);
  var y_new = parseInt(coordsXY[2]);

  if (x != x_new || y != y_new) {
    x = x_new;
    y = y_new;

    if (toggle_follow) {
      x_window = x;
      y_window = y;
    } else {
      drawCursor();
    }
    mousemoved = 1;
  }

 if (!autoColorEnabled) return;
var hoveringColor = window.board.getImageData(195, 140, 1, 1).data + '';
  if (hoveringColor[3] === 0) return;

  switch (hoveringColor) {
    case '38,38,38,255': clickColor(0); break;

    case '0,0,0,255': clickColor(1); break;

    case '128,128,128,255': clickColor(2); break;

    case '255,255,255,255': clickColor(3); break;

    case '153,98,61,255': clickColor(4); break;

    case '255,163,200,255': clickColor(5); break;

    case '207,115,230,255': clickColor(6); break;

    case '128,0,128,255': clickColor(7); break;

    case '229,0,0,255': clickColor(8); break;

    case '229,137,0,255': clickColor(9); break;

    case '229,229,0,255': clickColor(10); break;

    case '150,230,70,255': clickColor(11); break;

    case '0,190,0,255': clickColor(12); break;

    case '0,230,230,255': clickColor(13); break;

    case '0,136,204,255': clickColor(14); break;

    case '0,0,230,255': clickColor(15); break;
  }
}

window.listTemplates = function () {
  var ttlpx = 0;
  var mdstr = "";

  if (!template_list) {
    console.log("### No templates. Show the minimap first");
    return;
  }

  Object.keys(template_list).map(function (index, ele) {
    var eles = template_list[index];

    if (!eles.name) return;

    var z = eles.width > 300 ? 2 : eles.width > 100 ? 4 : 8;

    var n = eles.name + "";

    if (n.indexOf("//") < 0) n = baseTemplateUrl + n;

    mdstr += '\n#### ' + index + ' ' + eles.width + 'x' + eles.height + ' ' + n;
    mdstr += ' https://pixelzone.io/?p=' + Math.floor(eles.x + eles.width / 2) + ',' + Math.floor(eles.y + eles.height / 2) + ',' + z + '\n';

    if (!isNaN(eles.width) && !isNaN(eles.height)) ttlpx += eles.width * eles.height;
  });

  mdstr = '### Total pixel count: ' + ttlpx + '\n' + mdstr;
}

function updatePixelCounter() {
  fetch('https://pixelzone.io/users/profile/me')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('pixelCounter');
      if (el) el.innerText = data.pixels;
    })
    .catch(() => {});
}

function updateloop() {
    if (!toggle_show) return;

    // Здесь мы напрямую определяем template_list, вместо загрузки из файла
 window.template_list = {
        "Map 1": {
           name: "https://raw.githubusercontent.com/UltimatePecar/PZ-hostimg/refs/heads/main/2x2_--_8.png",
            x: -4096,
            y: -4096,
            width: 3423,
            height: 5268
        },
        "Map 2": {
            name: "https://i.ibb.co/d4Dmz2D0/arstotzka-turkey-newest.png",
            x: 685,
            y: -686,
            width: 807,
            height: 1400
        },
        "new_art_3": {
            name: "https://i.ibb.co/5h87dMCg/Banknote-Arstotzka.png",
            x: 1354,
            y: 78,
            width: 189,
            height: 91
        },
        "new_art_4": {
            name: "https://i.ibb.co/ycybPX3V/dither-it-IMG-9276-11.png",
            x: 1481,
            y: -482,
            width: 248,
            height: 248
        },
        "MDOWLMAN": {
        name: "https://i.ibb.co/N6NTbKdQ/image-1.png",
        x: 1420,
        y: -98,
        width: 128,
        height: 129
         },
        "UP_PZ": {
        name: "https://raw.githubusercontent.com/UltimatePecar/PZ-hostimg/refs/heads/main/PZ_purry_forn.png",
            x: -4096,
            y: 1210,
            width: 3870,
            height: 2550
     }
    };
    if (!toggle_follow) getCenter();

    image_list = [];
    loadTemplates();
    updatePixelCounter();
}

function toggleShow(newValue) {
  if (newValue === undefined) toggle_show = !toggle_show;
  else toggle_show = newValue;
  if (!minimap_box) return;
  if (toggle_show) {
    minimap_box.style.display = "block";
    minimap_text.style.display = "none";
    document.getElementById("minimap-config").style.display = "block";
    loadTemplates();
  } else {
    minimap_box.style.display = "none";
    const Lang = localStorage.getItem("minimapLang") || "ru";
    minimap_text.innerHTML = texts.openText[Lang] || "ОТКРЫТЬ МИНИ-КАРТУ";
    minimap_text.style.display = "block";
    minimap_text.style.cursor = "pointer";
    document.getElementById("minimap-config").style.display = "none";
  }
  var g = document.getElementsByClassName("grecaptcha-badge");
  if (g[0]) g[0].style.display = "none";
}
// ======= Заменить функции zoomIn / zoomOut этим кодом =======
function zoomIn() {
  if (!zooming_in) return;
  // Увеличиваем и жёстко ограничиваем сверху
  zoomlevel = Math.min(45, zoomlevel * 1.03);

  drawBoard();
  drawCursor();
  loadTemplates();

  // Если мы достигли лимита — остановим цикл и сбросим флаг
  if (zoomlevel >= 45) {
    zooming_in = false;
    return;
  }

  setTimeout(zoomIn, zoom_time);
}

function zoomOut() {
  if (!zooming_out) return;
  // Уменьшаем и ограничиваем снизу
  zoomlevel = Math.max(1, zoomlevel / 1.03);

  drawBoard();
  drawCursor();
  loadTemplates();

  if (zoomlevel <= 1) {
    zooming_out = false;
    return;
  }
  drawBoard();
  drawCursor();
  loadTemplates();
  setTimeout(zoomOut, zoom_time);
}

function loadTemplates() {
  if (!toggle_show) return;
  if (window.template_list == null || !minimap_box) return;
  var keys = Object.keys(template_list);

  needed_templates = [];

  keys.forEach(item => {
    if (!template_list[item].width) return;
    var temp_x = template_list[item].x;
    var temp_y = template_list[item].y;
    var temp_xr = temp_x + template_list[item].width;
    var temp_yb = temp_y + template_list[item].height;
    if (!x_window.between(temp_x - range, temp_xr + range)) return;
    if (!y_window.between(temp_y - range, temp_yb + range)) return;
    needed_templates.push(item);
  })

  for (var i = 0; i < keys.length; i++) {
    var template = keys[i];
    if (!template_list[template].width) continue;
    var temp_x = template_list[template].x;
    var temp_y = template_list[template].y;
    var temp_xr = temp_x + template_list[template].width;
    var temp_yb = temp_y + template_list[template].height;
    if (!x_window.between(temp_x - range, temp_xr + range)) continue;
    if (!y_window.between(temp_y - range, temp_yb + range)) continue;

    needed_templates.push(template);
  }

  if (needed_templates.length == 0) {
    if (zooming_in == false && zooming_out == false) {
      minimap_box.style.display = "none";
      minimap_text.style.display = "block";
  const Lang = localStorage.getItem("minimapLang") || "ru";
minimap_text.innerHTML = texts.emptyTemplates[Lang] || texts.emptyTemplates["ru"];
      minimap_text.style.cursor = "auto";
    }
  } else {
    minimap_box.style.display = "block";
    minimap_text.style.display = "none";
    counter = 0;
    for (i = 0; i < needed_templates.length; i++) {
      if (image_list[needed_templates[i]] == null) {
        loadImage(needed_templates[i]);
      } else {
        counter += 1;
        if (counter == needed_templates.length) drawTemplates();
      }
    }
  }
}

function loadImage(imagename) {
  console.log("Load image" + imagename,);

  image_list[imagename] = new Image();
  var src = template_list[imagename].name;
  if (cachebreaker) src += "?" +cachebreaker;

  image_list[imagename].crossOrigin = "Anonymous";
  image_list[imagename].src = src;

  image_list[imagename].onload = function () {
    counter += 1;

    if (counter == needed_templates.length) drawTemplates();
  }
}

function drawTemplates() {
  ctx_minimap.clearRect(0, 0, minimap.width, minimap.height);
  var x_left = x_window * 1 - minimap.width / zoomlevel / 2;
  var y_top = y_window * 1 - minimap.height / zoomlevel / 2;
  for (var i = 0; i < needed_templates.length; i++) {
    var template = needed_templates[i];
    var xoff = (template_list[template].x * 1 - x_left * 1) * zoomlevel;
    var yoff = (template_list[template].y * 1 - y_top * 1) * zoomlevel;
    var newwidth = zoomlevel * image_list[template].width;
    var newheight = zoomlevel * image_list[template].height;
    ctx_minimap.drawImage(image_list[template], xoff, yoff, newwidth, newheight);
    console.log();
  }
}

let drawGrid = false;

function drawBoard() {
  if (!ctx_minimap_board || !minimap_board || !minimap) return;

  ctx_minimap_board.clearRect(0, 0, minimap_board.width, minimap_board.height);
  if (!drawGrid || zoomlevel <= 4.6) return;

  const z = zoomlevel;
  const bw = minimap_board.width + z;
  const bh = minimap_board.height + z;

  // Центрирование сетки по центру миникарты
  const xoff_m = -((minimap.width / 2) - (z / 2));
  const yoff_m = -((minimap.height / 2) - (z / 2));

  ctx_minimap_board.beginPath();
  ctx_minimap_board.lineWidth = 0.2;

  for (let x = 0; x <= bw; x += z) {
    ctx_minimap_board.moveTo(x + xoff_m, yoff_m);
    ctx_minimap_board.lineTo(x + xoff_m, bh + yoff_m);
  }
  for (let y = 0; y <= bh; y += z) {
    ctx_minimap_board.moveTo(xoff_m, y + yoff_m);
    ctx_minimap_board.lineTo(bw + xoff_m, y + yoff_m);
  }

  ctx_minimap_board.strokeStyle = "white";
  ctx_minimap_board.stroke();
}

(function () {
  const interval = setInterval(() => {
    const gridCheckbox = document.getElementById("toggleGrid");
    const labelText = document.getElementById("gridLabelText");

    if (gridCheckbox && labelText) {
      // Восстановление предыдущего состояния (если хочешь, добавим localStorage позже)
      gridCheckbox.checked = drawGrid;

      // Перевод надписи
      const lang = localStorage.getItem("minimapLang") || "ru";
      labelText.textContent = texts.showGrid[lang] || texts.showGrid["ru"];

      // Обработчик
      gridCheckbox.addEventListener("change", () => {
        drawGrid = gridCheckbox.checked;
        drawBoard();
      });

      clearInterval(interval);
    }
  }, 100);
})();

function drawCursor() {
  var x_left = x_window * 1 - minimap.width / zoomlevel / 2;
  var x_right = x_window * 1 + minimap.width / zoomlevel / 2;
  var y_top = y_window * 1 - minimap.height / zoomlevel / 2;
  var y_bottom = y_window * 1 + minimap.height / zoomlevel / 2;

  ctx_minimap_cursor.clearRect(0, 0, minimap_cursor.width, minimap_cursor.height);

  if (x < x_left || x > x_right || y < y_top || y > y_bottom) return;

  var xoff_c = x - x_left;
  var yoff_c = y - y_top;

  ctx_minimap_cursor.beginPath();
  ctx_minimap_cursor.lineWidth = zoomlevel / 6;
  ctx_minimap_cursor.strokeStyle = "#ff1bfc";
  ctx_minimap_cursor.rect(zoomlevel * xoff_c, zoomlevel * yoff_c, zoomlevel, zoomlevel);
  ctx_minimap_cursor.stroke();

  window.board = ctx_minimap;
}

function getCenter() {
  var s = window.location.search.split(",");
  var cx = parseInt(s[0].split("=")[1]), cy = parseInt(s[1]);

  x_window = cx;
  y_window = cy;

  loadTemplates();
}

if (document.getElementById("factionSelect") && document.getElementById("factionSelect").value === "NewFaction") {
  errorDetectionEnabled = true;
setupErrorDetectionCanvases();
} else {
  errorDetectionEnabled = false;
  var diff = document.getElementById("diffCanvas");
  if (diff) diff.style.display = "none";
}

window.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case 32: //space
      toggleShow();

      if (toggle_show) {
        window.cachebreaker++;
        console.log(cachebreaker);
        updateloop();
      }

      mymousemove();
    break;
    case 81: clickColor(0); break;
    case 69: clickColor(1); break;
    case 82: clickColor(2); break;
    case 84: clickColor(3); break;
    case 89: clickColor(4); break;
    case 85: clickColor(5); break;
    case 73: clickColor(6); break;
    case 79: clickColor(7); break;
    case 80: clickColor(8); break;
    case 70: clickColor(9); break;
    case 71: clickColor(10); break;
    case 72: clickColor(11); break;
    case 74: clickColor(12); break;
    case 75: clickColor(13); break;
    case 76: clickColor(14); break;
    case 192:
    case 90: clickColor(15); break;
    case 87: //WASD
    case 65:
    case 83:
    case 68:
      break;
    case 107: //numpad +
      zooming_in = true;
      zooming_out = false;
      zoomIn();
      zooming_in = false;
      break;
    case 109: //numpad -
      zooming_out = true;
      zooming_in = false;
      zoomOut();
      zooming_out = false;
      break;
    case 88: //x: hide more elements
      var UIDiv = document.getElementById("upperCanvas").nextElementSibling;
      var menu = UIDiv.childNodes[4];
      var playercount = UIDiv.childNodes[3].childNodes[0];
      var coords = playercount.nextElementSibling;
      if(menu.style.display != "none") {
        menu.style.display = "none";
      } else if(playercount.style.display != "none"){ //hide counter
        playercount.style.display = "none";
      } else {
        coords.style.display = "none";
      }
      break;
 case 187: // клавиша "="
    zooming_in = true;
    zooming_out = false;
    zoomIn();
    zooming_in = false;
    break;
  case 189: // клавиша "-"
    zooming_out = true;
    zooming_in = false;
    zoomOut();
    zooming_out = false;
    break;
case 48: // клавиша "0"
  document.getElementById('autoColor').checked = !document.getElementById('autoColor').checked;
  break;
  case 57: // клавиша "9"
      document.getElementById("check-updates").click();
      break;
    default:
      console.log("keydown", e.keyCode, e.key);
  }
});

function clickColor(c) {
  var pal = document.getElementsByClassName("_ratio_1owdq_1")[0].firstChild.firstChild;
  //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
  var e = new MouseEvent("click", {
    clientX: 5, clientY: 5,
    bubbles: true
  });
  pal.childNodes[c].firstChild.dispatchEvent(e);
}

function setCookie(name, value) { //you can supply "minutes" as 3rd arg.
  var argv = setCookie.arguments;
  var argc = setCookie.arguments.length;
  var minutes = (argc > 2) ? argv[2] : 720 * 1440; //default 720 days
  var date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  var expires = "";
  if (minutes > 0) expires = "; Expires=" + date.toGMTString();
  document.cookie = name + "=" + value + expires + "; SameSite=Lax; Path=/";
}
window.setCookie = setCookie;

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

let isCheckingForUpdates = false;

function checkForUpdates(silent = false) {
    if (isCheckingForUpdates) return;
    isCheckingForUpdates = true;

    const updateURL = "https://raw.githubusercontent.com/EdwardScorpio/pz-map/main/PBteam-map-2.0.user.js";
    const lang = localStorage.getItem("minimapLang") || "ru";

    fetch(updateURL)
        .then(response => response.text())
        .then(data => {
            const remoteVersion = data.match(/@version\\s+(\\S+)/);
            const currentVersion = GM_info.script.version;

            if (remoteVersion && compareVersions(remoteVersion[1], currentVersion) > 0) {
                if (confirm(texts.updateAvailable[lang] || texts.updateAvailable["ru"])) {
                    window.open(updateURL, "_blank");
                }
            } else if (!silent) {
                alert(texts.noUpdates[lang] || texts.noUpdates["ru"]);
            }
        })
        .catch(error => {
            console.error((texts.updateError[lang] || texts.updateError["ru"]) + ":", error);
        })
        .finally(() => {
            isCheckingForUpdates = false;
        });
}
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}
(function() {
  function waitForPalette() {
    const allDivs = Array.from(document.querySelectorAll('div'));
    const palette = allDivs.find(div => {
      const childDivs = Array.from(div.children);
      return childDivs.length > 15 && childDivs.every(d => {
        const bg = getComputedStyle(d).backgroundColor;
        return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      });
    });

    if (!palette) return setTimeout(waitForPalette, 1000);

    console.log('🎨 Палитра найдена:', palette);

    // Отключаем оригинал
    palette.style.opacity = '0';
    palette.style.pointerEvents = 'none';

    // Создаём новую палитру
    const clone = document.createElement('div');
    clone.id = 'customPalette';
    clone.style.position = 'absolute';
    clone.style.right = '400px'; // рядом с миникартой
    clone.style.bottom = '80px';
    clone.style.display = 'grid';
    clone.style.gridTemplateColumns = 'repeat(8, 1fr)';
    clone.style.gap = '4px';
    clone.style.background = 'rgba(25,25,25,0.8)';
    clone.style.borderRadius = '8px';
    clone.style.padding = '6px';
    clone.style.zIndex = 9999;

    // Заполняем копию цветами
    const colors = Array.from(palette.children);
    colors.forEach((c, i) => {
      const bg = getComputedStyle(c).backgroundColor;
      const sw = document.createElement('div');
      sw.style.width = '20px';
      sw.style.height = '20px';
      sw.style.background = bg;
      sw.style.borderRadius = '4px';
      sw.style.cursor = 'pointer';
      sw.title = `Цвет ${i}`;
      sw.addEventListener('click', () => {
        c.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      clone.appendChild(sw);
    });

    document.body.appendChild(clone);
    console.log('✅ Новая палитра установлена.');
  }

  waitForPalette();
})();

function addUpdateCheckListener() {
  const checkUpdatesButton = document.getElementById('check-updates');
  if (checkUpdatesButton) {
    checkUpdatesButton.addEventListener('click', function() {
      checkForUpdates(false);
    });
  } else {
    console.error('Check Updates button not found');
  }
}
const texts = {
  hideMap: {
    ru: "Скрыть", en: "Hide", es: "Ocultar", tr: "Gizle", fi: "Piilota",
    fr: "Cacher", pt: "Ocultar", sv: "Dölj", kk: "Жасыру"
  },
  settings: {
    ru: "Настройки", en: "Settings", es: "Ajustes", tr: "Ayarlar", fi: "Asetukset",
    fr: "Paramètres", pt: "Configurações", sv: "Inställningar", kk: "Баптаулар"
  },
  openText: {
    ru: "ОТКРЫТЬ МИНИ-КАРТУ", en: "OPEN MINIMAP", es: "ABRIR MINIMAPA", tr: "MİNİ HARİTA AÇ", fi: "AVAA PIIRROS",
    fr: "OUVRIR MINICARTE", pt: "ABRIR MINIMAPA", sv: "ÖPPNA MINIKARTA", kk: "МИНИ-КАРТАНЫ АШУ"
  },
  autoColorOn: {
    ru: "Aвто-цвет", en: "Auto-Color", es: "Auto-Color", tr: "Otomatik Renk", fi: "Autoväri",
    fr: "Auto-couleur", pt: "Auto-Cor", sv: "Auto-färg", kk: "Авто-түстер"
  },
  autoColorOff: {
    ru: "Авто-цвет", en: "Auto-Color", es: "Auto-Color", tr: "Otomatik Renk", fi: "Autoväri",
    fr: "Auto-couleur", pt: "Auto-Cor", sv: "Auto-färg", kk: "Авто-түстер"
  },
  back: {
    ru: "Вернуться", en: "Back", es: "Volver", tr: "Geri", fi: "Takaisin",
    fr: "Retour", pt: "Voltar", sv: "Tillbaka", kk: "Артқа"
  },
  updates: {
    ru: "Обновления", en: "Updates", es: "Actualizaciones", tr: "Güncellemeler", fi: "Päivitykset",
    fr: "Mises à jour", pt: "Atualizações", sv: "Uppdateringar", kk: "Жаңартулар"
  },
  info: {
    ru: "Информация", en: "Info", es: "Info", tr: "Bilgi", fi: "Info",
    fr: "Info", pt: "Info", sv: "Info", kk: "Ақпарат"
  },
    transparency:{
    ru:"Прозрачность",en:"Transparency", es:"Transparencia", tr:"Şeffaflık", fi:"Läpinäkyvyys", fr:"Transparence", pt:"Transparência", sv:"Transparens", kk:"Мөлдірлік" },
  volume: {
      ru:"Звук", en:"Volume", es:"Volumen", tr:"Ses", fi:"Äänenvoim",
      fr:"Volume", pt:"Volume",sv:"Volym",kk:"Дыбыс" },
  settingsTitle:{
      ru:"Настройки Мини-Карты", en:"Minimap Settings", es:"Configuración del minimapa", tr:"Mini Harita Ayarları", fi:"Pienikartan asetukset",
      fr:"Paramètres de la mini-carte", pt:"Configurações do minimapa", sv:"Minikarta inställningar", kk:"Мини-карта баптаулары" },
    infoContent: {
    ru: " <p>Привет фанат телеканала 2х2! <p>Данная мини-карта сделана специально для тебя!</p> <p>Благодарности:</p> <ul> <li>Edward Scorpio — генерал Пиксельных войн</li> <li>Ultimate Pekar — генерал Пиксельных войн</li> <li>MDOwlman — генерал-коменданторе</li> </ul> <p>Карта создана 18 сентября 2024 года.</p>",
    en: " <p>Hello 2x2 TV fan! This minimap was made just for you!</p> <p>Acknowledgements:</p> <ul> <li>Edward Scorpio — Pixel Wars General</li> <li>Ultimate Pekar — Pixel Wars General</li> <li>MDOwlman — Grand Commander</li></ul> <p>Map officially created on September 18, 2024.</p>",
    es: "<p>¡Hola fan de 2x2 TV! ¡Este minimapa fue creado especialmente para ti!</p> <p>Agradecimientos:</p> <ul> <li>Edward Scorpio — General de las Guerras de Píxeles</li> <li>Ultimate Pekar — General de las Guerras de Píxeles</li> <li>MDOwlman — Gran Comandante</li></ul> <p>El mapa fue creado oficialmente el 18 de septiembre de 2024.</p>",
    tr: "<p>2x2 TV hayranı merhaba! Bu minimap tam sana göre yapıldı!</p> <p>Teşekkürler:</p> <ul> <li>Edward Scorpio — Piksel Savaşları Generali</li> <li>Ultimate Pekar — Piksel Savaşları Generali</li> <li>MDOwlman — Büyük Komutan</li> </ul> <p>Harita resmi olarak 18 Eylül 2024 tarihinde oluşturuldu.</p>",
    fi: "<p>Hei 2x2 TV:n fani! <p>Tämä minimappi on tehty juuri sinua varten!</p> <p>Kiitokset:</p> <ul> <li>Edward Scorpio — Pikselisotien kenraali</li><li>Ultimate Pekar — Pikselisotien kenraali</li><li>MDOwlman — Suuri komentaja</li> </ul> <p>Kartta luotiin virallisesti 18. syyskuuta 2024.</p>",
    fr: `<p>Bonjour fan de la chaîne 2x2 ! <p>Cette minicarte a été créée spécialement pour toi !</p> <p>Remerciements :</p> <ul> <li>Edward Scorpio — Général des Guerres de Pixels</li><li>Ultimate Pekar — Général des Guerres de Pixels</li><li>MDOwlman — Grand Commandant</li></ul> <p>La carte a été officiellement créée le 18 septembre 2024.</p>`,
    pt: `<p>Olá fã do canal 2x2 !
      я<p> Este minimapa foi feito especialmente para você!</p>
      <p>Agradecimentos:</p>
      <ul>
        <li>Edward Scorpio — General das Guerras de Pixels</li>
        <li>Ultimate Pekar — General das Guerras de Pixels</li>
        <li>MDOwlman — Grande Comandante</li>
      </ul>
      <p>O mapa foi criado oficialmente em 18 de setembro de 2024.</p>
    `,
    sv: `
      <p>Hej 2x2 TV-fan! Denna minimap har skapats speciellt för dig!</p> <p>Tack till:</p> <ul> <li>Edward Scorpio — General för Pixelkrigen</li> <li>Ultimate Pekar — General för Pixelkrigen</li><li>MDOwlman — Stor kommendant</li></ul> <p>Kartan skapades officiellt den 18 september 2024.</p>`,
    kk:"<p>2x2 телеканалының жанкүйері, сәлем! <p>Бұл мини-карта дәл сіз үшін жасалды!</p> <p>Рақмет:</p><ul> <li>Edward Scorpio — Пиксель соғыстары генералы</li><li>Ultimate Pekar — Пиксель соғыстары генералы</li><li>MDOwlman — Бас қолбасшы</li></ul><p>Карта ресми түрде 2024 жылғы 18 қыркүйекте жасалған.</p>"
    },
    language: {
    ru: "Язык",
    en: "Language",
    es: "Idioma",
    tr: "Dil",
    fi: "Kieli",
    fr: "Langue",
    pt: "Idioma",
    sv: "Språk",
    kk: "Тіл"
  },
  mode: {
    ru: "Режим",
    en: "Mode",
    es: "Modo",
    tr: "Mod",
    fi: "Tila",
    fr: "Mode",
    pt: "Modo",
    sv: "Läge",
    kk: "Режим"
  },
    version: {
    ru: "Версия", en: "Version", es: "Versión", tr: "Sürüm", fi: "Versio",
    fr: "Version", pt: "Versão", sv: "Version", kk: "Нұсқа"
},
    updateAvailable: {
    ru: "Доступна новая версия скрипта. Хотите обновить?",
    en: "A new version of the script is available. Would you like to update?",
    es: "Hay una nueva versión del script. ¿Desea actualizar?",
    tr: "Yeni bir betik sürümü mevcut. Güncellemek ister misiniz?",
    fi: "Uusi skriptiversio on saatavilla. Haluatko päivittää?",
    fr: "Une nouvelle version du script est disponible. Voulez-vous mettre à jour ?",
    pt: "Uma nova versão do script está disponível. Deseja atualizar?",
    sv: "En ny version av skriptet är tillgänglig. Vill du uppdatera?",
    kk: "Скриптің жаңа нұсқасы қолжетімді. Жаңартқыңыз келе ме?"
  },
  noUpdates: {
    ru: "У вас установлена последняя версия скрипта. Обновлений нет.",
    en: "You have the latest version of the script. No updates.",
    es: "Ya tiene instalada la última versión del script. No hay actualizaciones.",
    tr: "Scriptin en son sürümü yüklü. Güncelleme yok.",
    fi: "Sinulla on uusin skriptiversio. Ei päivityksiä.",
    fr: "Vous avez la dernière version du script. Pas de mises à jour.",
    pt: "Você já possui a versão mais recente do script. Nenhuma atualização.",
    sv: "Du har den senaste versionen av skriptet. Inga uppdateringar.",
    kk: "Сізде скриптің соңғы нұсқасы орнатылған. Жаңартулар жоқ."
  },
  updateError: {
    ru: "Ошибка при проверке обновлений",
    en: "Error checking for updates",
    es: "Error al comprobar actualizaciones",
    tr: "Güncellemeler kontrol edilirken hata oluştu",
    fi: "Virhe tarkistettaessa päivityksiä",
    fr: "Erreur lors de la vérification des mises à jour",
    pt: "Erro ao verificar atualizações",
    sv: "Fel vid kontroll av uppdateringar",
    kk: "Жаңартуларды тексеру кезінде қате орын алды"
  },
   emptyTemplates: {
    ru: "Пусто. Здесь трафаретов пока нет.",
    en: "Empty. No templates here yet.",
    es: "Vacío. Aún no hay plantillas aquí.",
    tr: "Boş. Burada henüz şablon yok.",
    fi: "Tyhjä. Täällä ei vielä ole mallipohjia.",
    fr: "Vide. Aucun modèle ici pour l'instant.",
    pt: "Vazio. Ainda não há modelos aqui.",
    sv: "Tomt. Inga mallar här ännu.",
    kk: "Бос. Әзірге мұнда үлгілер жоқ."
  },
    versionTitle: {
  ru: "=2X2 МИНИ-КАРТА=",
  en: "=2X2 MINIMAP=",
  es: "=2X2 MINI MAPA=",
  tr: "=2X2 MİNİ HARİTA=",
  fi: "=2X2 MINIKARTTA=",
  fr: "=2X2 MINI-CARTE=",
  pt: "=2X2 MINI MAPA=",
  sv: "=2X2 MINIKARTA=",
  kk: "=2X2 МИНИ-КАРТА="
    },
  showGrid: {
    ru: "Показывать сетку",
    en: "Show Grid",
    es: "Mostrar cuadrícula",
    tr: "Izgara Göster",
    fi: "Näytä ruudukko",
    fr: "Afficher la grille",
    pt: "Mostrar grade",
    sv: "Visa rutnät",
    kk: "Тор көзін көрсету"
  },
    zoomLevelLabel: {
    ru: "Масштаб", en: "Zoom", es: "Zoom", tr: "Yakınlaştırma",
    fi: "Zoom", fr: "Zoom", pt: "Zoom", sv: "Zoom", kk: "Масштаб"
    },
};

function updateLanguage(lang) {
  const applyText = (id, key) => {
    const el = document.getElementById(id);
    if (el && texts[key]) {
      const translation = texts[key][lang] || texts[key]["ru"]; // если нет языка, берём русский
      if (id === "versionLabel") {
        el.textContent = `${translation}: ${MINIMAP_VERSION}`;
      } else {
        el.textContent = translation;
      }
        setInterval(updateloop, 5000)
    }
      vers = texts.versionTitle[lang] || "=2X2 МИНИ-КАРТА=";
document.getElementById("minimap-title").textContent = vers;

  };
  applyText("hide-map", "hideMap");
  applyText("settings-map", "settings");
  applyText("minimap-text", "openText");
  applyText("autoColorButton", typeof autoColorEnabled !== "undefined" && autoColorEnabled ? "autoColorOn" : "autoColorOff");
  applyText("settings-map-2", "back");
  applyText("check-updates", "updates");
  applyText("infoButton", "info");
  applyText("transparencyLabel", "transparency");
  applyText("volumeLabel", "volume");
  applyText("settings-title", "settingsTitle");
  applyText("languageLabel", "language");
  applyText("modeLabel", "modeLabel");
  applyText("versionLabel", "version");
  applyText("minimap-text", "emptyTemplates");
  applyText("minimap-text", "openText");
  applyText("gridLabelText", "showGrid");// теперь правильно
}
const infoTextEl = document.getElementById("infoText");
if (infoTextEl && texts.infoContent && texts.infoContent[lang]) {
  infoTextEl.innerHTML = texts.infoContent[lang];
}
document.addEventListener("DOMContentLoaded", function () {
  const languageSelect = document.getElementById("languageSelect");
  const Lang = localStorage.getItem("minimapLang") || "ru";
  if (languageSelect) {
    languageSelect.value = Lang;
    updateLanguage(Lang);
    languageSelect.addEventListener("change", () => {
      const lang = languageSelect.value;
      localStorage.setItem("minimapLang", lang);
      updateLanguage(lang);
    });
  }
    document.getElementById("infoButton").addEventListener("click", () => {
  const lang = localStorage.getItem("minimapLang") || "ru";
  updateLanguage(lang);
  setInterval(updateloop, 5000)
});
});
    setTimeout(() => {
    updateLanguage(Lang);
  }, 100);
window.addEventListener("load", function () {
  updateLanguage(Lang);
});
setInterval(updateloop, 5000);
updateloop();