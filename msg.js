let flag = true

module.exports = {
    parseMsg(msg) { // Разбор сообщения
        if (msg.endsWith("\u0000")) // Удаление символа в конце
            msg = msg.substring(0, msg.length - "\u0000".length)
        // Разбора сообщения
        let array = msg.match(/(\(|[-\d\.]+|[\\\"\w]+|\))/g)
        let res = { msg, p: [] } // Результирующее сообщение
        // Анализировать с индекса 0, результат в res
        this.parse(array, { idx: 0 }, res)
        this.makeCmd(res) // Выделить команду
        return res
    },
    parse(array, index, res) { // Разбор сообщения в скобках
        // Всегда с открывающей скобки
        if (array[index.idx] != "(")
            return
        index.idx++
        // Разбор внутри скобок
        this.parseInner(array, index, res)
    },
    parseInner(array, index, res) {
        // Пока не встретится закрывающая скобка
        while (array[index.idx] != ")") {
            // Если внутри еще одна скобка
            if (array[index.idx] == "(") {
                let r = { p: [] }
                // Рекурсивный вызов с index
                this.parse(array, index, r)
                res.p.push(r)
            } else {
                // Одиночный параметр
                let num = parseFloat(array[index.idx])
                res.p.push(isNaN(num) ? array[index.idx] : num)
                index.idx++
            }
        }
        index.idx++
    },
    makeCmd(res) { // Выделение команды
        if (res.p && res.p.length > 0) {
            // Первый параметр - команды
            res.cmd = res.p.shift()
            // Выделить команды у параметров
            for (let value of res.p)
                this.makeCmd(value)
        }
    },
    parseSeeMsg(msg) {
        // return msg
        let result = []
        let arr = msg.match(/\(\([a-zA-Z 0-9F"]+\)[0-9 \.\-]+\)/g)
        for (let i = 0; i < arr.length; i++) {
            let args = arr[i].match(/\) ([0-9 \.\-]+)/)[1].split(" ")
            let flag = arr[i].match(/\(([a-zA-Z 0-9F"]+)\)/)[1]
            let key = flag.replace(/ /g, '')
            result.push({key : key, distance : Number(args[0]), alpha : Number(args[1])})
            // let arr = msg.split(" ")
            // console.log(arr.slice(2, arr.length - 1))
        }

        return result
    }
}