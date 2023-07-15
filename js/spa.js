
class App {

	constructor(root, router) {

		this.root = root;
		this.router = router;

		// По умолчанию у нас только две попытки отправить 
		// запрос на получение данных в случае невалидности токена авторизации
		this.attempts = 2;

		// Заглушки для вывода ошибок
		this.notFoundPlug = "<h1>Не найдено!</h1>";
		this.internalServerErrorPlug = "<h1>Внутренняя ошибка сервера</h1>";
		this.getDataErrorPlug = "<h1>При получении данных возникла ошибка</h1>";

		// Опции для отправки запроса на получение данные оп умолчанию
		this.fetchOpt = {
			method: "GET",
		};

		// Функция вызываемая при возникновении ошибки 401 (неавторизирован)
		this.onUnauthorized = function() {
			console.log("unauthorized");
		};

		// Функция, выполняемая во время ожидания выполнения обработчика
		this.waiting = null;
	}

	routeName() {
		return window.location.hash.substr(1).replace('#', '');
	}

	run() {

		(function(scope) {
			window.addEventListener('hashchange', function (e) {
				scope.route(scope.routeName());
			});
		})(this);

		this.route(this.routeName());
	}

	route(name) {

		if (this.waiting != null) {
			this.waiting(this);
		}

		if (window.location.hash.length > 0) {
			this.handle(this.router.getHandler(name));
		} else {
			this.handle(this.router.getDefault());
		}
	}

	async handle(handler) {

		if (handler == undefined) {
			return
		}

		for (let i = 0; i < this.attempts; i++) {

			let resp = await fetch(handler.url, this.fetchOpt);

			if (resp.status >= 500) {
				this.root.innerHTML = this.internalServerErrorPlug;
				return;
			}

			if (resp.status == 403 || resp.status == 404) {
				this.root.innerHTML = this.notFoundPlug;
				return;
			}

			if (resp.status == 401) {

				this.onUnauthorized();
				continue;
			}

			let data = null;
			try {
				data = await resp.text();
			} catch(err) { data = null; }

			if (data == null) {
				this.root.innerHTML = getDataErrorPlug;
				return;
			}

			let scripts = data.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi) || [];

			for(let item of scripts) {
				data = data.replace(item, "");
			};

			this.root.innerHTML = data;

			for(let item of scripts) {
				eval(item.replace(/<[/]?script(.)*>/g, ""));
			};

			return;
		}
	}
}

class Handler {

	constructor(url) {
		this.url = url;
	}
}

class Router {

	constructor() {
		this.handlers = new Map();
		this.default = null;
	};

	register(name, handler, defaultHandler = false) {

		if (defaultHandler) {
			this.default = handler;
		}

		this.handlers.set(name, handler);
	}

	getHandler(name) {

		for(let key of this.handlers.keys()) {
			if (new RegExp(`^${key}$`).test(name)) {
				return this.handlers.get(key);
			}
		}
	}

	getDefault() {
		return this.default;
	}
}
