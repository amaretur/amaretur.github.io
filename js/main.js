
const HOST = window.location.protocol + "//" + window.location.host;
const VIEWS = HOST + "/views";

function run_spa() {

	let root = document.querySelector('#app');

	// Создаем роутер и регистрируем обработчики
	let router = new Router();

	router.register(
		"main",
		new Handler(VIEWS + "/main.html"),
		true // Обработчик по умолчанию
	);

	router.register(
		"era",
		new Handler(VIEWS + "/era.html")
	);

	router.register(
		"mc",
		new Handler(VIEWS + "/mc.html")
	);

	router.register(
		"dwmblocks",
		new Handler(VIEWS + "/dwmblocks.html")
	);

	let app = new App(root, router);

	// Стандартные опции для отправки запроса
	// на получение данных (html) для клиентского приложения
	app.fetchOpt = {
		method: "GET",
	};

	// Функция, выполняемая во время ожидания выполнения работы обработчика
	// Функция будет выводить на экран спиннер
	app.waiting = function(app) {
		window.scrollTo(0, 0);
		app.root.innerHTML = `<div class="app-spinner"></div>`;
	};

	app.run();
}

function init_hidden_widgets() {

	let hiddenList = document.querySelectorAll(".hidden");

	for(let hiddenElem of hiddenList) {
		hiddenElem.onclick = function(e){
			hiddenElem.classList.remove("hide");
		}
	}
}

function init() {
	run_spa();
}

init();
