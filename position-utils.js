 const Flags = require('./flags');

/**
 * Рассчитывает позицию игрока на основе расстояний до трех флагов
 * @param {number} x1 - x-координата первого флага
 * @param {number} y1 - y-координата первого флага
 * @param {number} x2 - x-координата второго флага
 * @param {number} y2 - y-координата второго флага
 * @param {number} x3 - x-координата третьего флага
 * @param {number} y3 - y-координата третьего флага
 * @param {number} d1 - расстояние до первого флага
 * @param {number} d2 - расстояние до второго флага
 * @param {number} d3 - расстояние до третьего флага
 * @param {boolean} flag - флаг для отладки
 * @param {Object} currentCoords - текущие координаты для сравнения
 * @returns {Object} - рассчитанные координаты {x, y}
 */
function calculatePosition(x1, y1, x2, y2, x3, y3, d1, d2, d3, flag = false, currentCoords = {x: 0, y: 0}) {
    if (flag) {
        console.log("coors", x1, y1, x2, y2, x3, y3, d1, d2, d3);
    }
    if (x1 === x2 && y1 === y2) {
        // не могу посчитать
        return currentCoords;
    }
    if (x1 === x2) {
        let y = (Math.pow(y2, 2) - Math.pow(y1, 2) + Math.pow(d1, 2) - Math.pow(d2, 2)) / (2 * (y2 - y1));
        let x_ans_1 = (2 * x1 + Math.sqrt(4 * d1 * d1 - 4 * Math.pow(y - y1, 2))) / 2;
        let x_ans_2 = (2 * x1 - Math.sqrt(4 * d1 * d1 - 4 * Math.pow(y - y1, 2))) / 2;
        if (Math.abs(x_ans_1 - currentCoords.x) < Math.abs(x_ans_2 - currentCoords.x)) {
            return {x: x_ans_1, y: y};
        } else {
            return {x: x_ans_2, y: y};
        }
    }

    if (y1 === y2) {
        let x = (Math.pow(x2, 2) - Math.pow(x1, 2) + Math.pow(d1, 2) - Math.pow(d2, 2)) / (2 * (x2 - x1));
        let y_ans_1 = (2 * y1 + Math.sqrt(4 * d1 * d1 - 4 * Math.pow(x - x1, 2))) / 2;
        let y_ans_2 = (2 * y1 - Math.sqrt(4 * d1 * d1 - 4 * Math.pow(x - x1, 2))) / 2;
        if (Math.abs(y_ans_1 - currentCoords.y) < Math.abs(y_ans_2 - currentCoords.y)) {
            return {x: x, y: y_ans_1};
        } else {
            return {x: x, y: y_ans_2};
        }
    }
    let alpha = (y1 - y2) / (x2 - x1);
    let beta = (y2 * y2 - y1 * y1 + x2 * x2 - x1 * x1 + d1 * d1 - d2 * d2) / (2 * (x2 - x1));
    let a = alpha * alpha + 1;
    let b = -2 * (alpha * (x1 - beta) + y1);
    let c = Math.pow(x1 - beta, 2) + Math.pow(y1, 2) - Math.pow(d1, 2);
    if (flag) {
        console.log("coefs", a, b, c);
    }

    let y_ans_1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
    let y_ans_2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
    let errorMin = 1000000;
    let decide;
    for (let y of [y_ans_1, y_ans_2]) {
        let x_ans_1 = x1 + Math.sqrt(Math.pow(d1, 2) - Math.pow(y - y1, 2));
        let x_ans_2 = x1 - Math.sqrt(Math.pow(d1, 2) - Math.pow(y - y1, 2));
        for (let x of [x_ans_1, x_ans_2]) {
            let error = Math.abs(Math.pow(x - x3, 2) + Math.pow(y - y3, 2) - Math.pow(d3, 2));
            if (flag) {
                console.log("x y", x, y_ans_1, y_ans_2, "err", error);
            }
            if (errorMin > error) {
                errorMin = error;
                decide = {x: x, y: y};
            }
        }
    }
    return decide;
}

/**
 * Выбирает три флага для расчета позиции
 * @param {Array} distancesOriginal - массив с информацией о видимых объектах
 * @returns {Object} - объект с тремя выбранными флагами
 */
function chooseFlags(distancesOriginal) {
    let distances = [...distancesOriginal];
    for (let i = 0; i < distances.length; i++) {
        if (Flags[distances[i].key] === undefined) {
            distances.splice(i, 1);
            i--;
        }
    }
    return {
        firstFlag: distances[0], 
        secondFlag: distances[1 % distances.length], 
        thirdFlag: distances[2 % distances.length]
    };
}

/**
 * Выбирает флаги для расчета позиции противника
 * @param {Array} distancesOriginal - массив с информацией о видимых объектах
 * @returns {Object|boolean} - объект с тремя выбранными флагами или false, если не удалось выбрать
 */
function chooseFlagsForEnemy(distancesOriginal) {
    let distances = [...distancesOriginal];
    let firstFlag = "";
    for (let i = 0; i < distances.length; i++) {
        if (Flags[distances[i].key] === undefined) {
            if (distances[i].key.includes("\"") || distances[i].key === "p") {
                firstFlag = distances[i];
            }
            distances.splice(i, 1);
            i--;
        }
    }

    if (firstFlag === "") {
        return false;
    }
    return {
        firstFlag: firstFlag, 
        secondFlag: distances[0], 
        thirdFlag: distances[1 % distances.length]
    };
}

module.exports = {
    calculatePosition,
    chooseFlags,
    chooseFlagsForEnemy
}; 