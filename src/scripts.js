class RuminantsNumberString {
    constructor (value) {
        this.value = value;
    }

    isEqual(n) {
        return this.value == n
    }

    getCountCow(n){
        let count = 0;
        n.split("").forEach((symbol, index) => {
            if (this.value[index] != symbol && this.value.includes(symbol)) count ++
        });
        return(count)
    }

    getCountBull(n){
        let count = 0;
        n.split("").forEach((symbol, index) => {
            if (this.value[index] == symbol) count ++
        });
        return(count)
    }


    format(n) {
        let nCows = this.getCountCow(n);
        let nBulls = this.getCountBull(n);
        return `${n}: ${nCows} коров${this.checkEndWordF(nCows)}, ${nBulls} бык${this.checkEndWordM(nBulls)}`
    }

    checkEndWordF(n) {
        let uno = n % 10
        if ( uno == 0) return "ок"
        if ( uno == 1) return "ка"
        return "ки"
    }

    checkEndWordM(n) {
        let uno = n % 10
        if ( uno == 1) return ""
        if ( uno == 0) return "ов"
        return "a"
    }
}

class RoundGame {
    constructor(query) {
        this.counter = 0;
        this.winner = null;
        this.autoPlayerNumber = null;
        this.homoPlayerNumber = null;
        this.playingField = document.querySelector(query);
        this.stack = {
            source: [],
            cow: 0,
            bull: 0,
            digits: {
                right: new Set(),
                wrong: new Set(),
                mask: "XXXX",
                twice: new Set()
            },
            takeTheNext: true
        };
		this.maxLength = 4;
    }

    init() {
        //alert("Здесь легко победить человеком")
        let supposedNumber = this.getRandomNumber();
        this.autoPlayerNumber = new RuminantsNumberString(supposedNumber);
        this.printLog(this.stack.digits.mask);
        this.counter ++;

        supposedNumber = this.askUserNumber("Задайте 4х-значное число, состоящее из неповторяющихся цифр: ")
        this.homoPlayerNumber = new RuminantsNumberString(supposedNumber);
        this.printLog(this.homoPlayerNumber.value);
    }

    start() {
        if (this.counter == 0 ) {
            this.init();
        } else {
            let supposedNumber, description;
            switch (this.counter % 2) {
                case 1:
                    supposedNumber = this.askUserNumber("Ваш ход: ")
                    if (this.autoPlayerNumber.isEqual(supposedNumber)) {
                        this.winner = 1
                        /*this.counter % 2*/
                    }
                    description = this.autoPlayerNumber.format(supposedNumber)
                    break;

                default:
                    this.thinkingMachine();
                    supposedNumber = this.stack.source[this.stack.source.length - 1]
                    if (this.homoPlayerNumber.isEqual(supposedNumber)) {
                        this.winner = 0
                        /*this.counter % 2*/
                    }
                    description = this.homoPlayerNumber.format(supposedNumber)
            }

            if (!this.won() || this.winner) {
                this.printLog(description)
            }

            if (this.won()) {
                if (this.counter % 2 == this.winner) {
                    this.playingField.querySelector("button").classList = "hidden"
                    let winner = this.winner ? "Вы" : "Компьютер"
                    let number = this.winner ? this.autoPlayerNumber.value : this.homoPlayerNumber.value
                    this.printLog(`GAME OVER<br/>${winner} - победитель, угадано ${number}`, "info")
                }
            }
        }
        this.counter ++;
    }

    won(){
        return this.winner == 0 || this.winner == 1
    }

    askUserNumber(ask) {
        let supposedNumber
        do {
            supposedNumber = prompt(ask)
        } while (this.checkNumberFromPrompt(supposedNumber) || !this.checkSameNumber(supposedNumber))
        return supposedNumber.length < 4 ? `0${supposedNumber}` : supposedNumber
    }

    thinkingMachine() {
        let noEmptyStack = this.stack.source.length > 0
        let supposedNumber = noEmptyStack ? this.stack.source[this.stack.source.length - 1] : this.getRandomNumber()

        if (noEmptyStack) {
            let { cow, bull } =this.stack;
            let { mask, right, wrong } =this.stack.digits;

            if (+cow + +bull == this.maxLength) {
                this.addManyRightDigits(supposedNumber)
            }

            if (cow == 0 && bull == 0) {console.log("добавить кучу неправильных")
            	this.addManyWrongDigits(supposedNumber)
            }

            if (this.counter > 2) {
                let index = mask.lastIndexOf("X");
                let previousDigit = supposedNumber[index];
                supposedNumber = this.changeDigit(supposedNumber);
                let digit = supposedNumber[index];
                let compareResult = this.comparePrevious(supposedNumber)

                if (this.stack.takeTheNext) {
                    if (compareResult[1] == 1 || compareResult[0] == 1) {
                        if (compareResult[1] == 1 && !mask.includes(digit)) {
                            this.stack.digits.mask = this.changeSymbolInIndex(mask, index, digit);
                        }
                        this.addDigit(digit, true);
                        if (compareResult[1] == 1 && compareResult[0] == 0 || compareResult[0] == 1 && compareResult[1] == 0) {
                            this.addDigit(previousDigit, false);
                        }
                    } else {
                        if (compareResult[1] == -1 || compareResult[0] == -1) {
                            if (compareResult[1] == -1 && compareResult[0] <= 0) {
                                this.stack.digits.mask = this.changeSymbolInIndex(mask, index, previousDigit)
                                this.addDigit(digit, false);
                            }
                            this.addDigit(previousDigit, true);
                        } else {
                            if (compareResult[0] == 0 && compareResult[1] == 0) {
                                if (right.has(digit) || right.has(previousDigit)) {
                                    this.addDigit(digit, true)
                                    this.addDigit(previousDigit, true)
                                } else if (wrong.has(digit) || wrong.has(previousDigit)
                                    || right.size + this.stack.digits.twice.size > this.maxLength) {
                                    this.addDigit(digit, false)
                                    this.addDigit(previousDigit, false)
                                } else {
                                    this.stack.digits.twice.add(previousDigit)
                                    this.stack.digits.twice.add(digit)
                                }
                            }
                        }
                    }
                } else {
                    this.stack.takeTheNext = true
                }
            }
        } else {
            this.comparePrevious(supposedNumber)

            if (this.stack.cow == 0 && this.stack.bull == 0) {
                this.addManyWrongDigits(supposedNumber, false)
            }
        }
        this.stack.source.push(supposedNumber)
    }

    changeDigit(supposedNumber){
//console.log(this.stack, supposedNumber)
        let { mask, right, wrong } = this.stack.digits
        let index = mask.lastIndexOf("X")
        let supposedDigit
		let checkSupposedNumber

        if (index === -1) return mask

        if (right.size < this.maxLength) {
            for(let supposedDigit = 0; supposedDigit <= 9; supposedDigit++ ) {
                if (!(wrong.has(String(supposedDigit))
                    || right.has(String(supposedDigit))
                    || supposedNumber.includes(String(supposedDigit)))) {
                    checkSupposedNumber = this.changeSymbolInIndex(supposedNumber, index, supposedDigit)
                    if (!this.stack.source.includes(checkSupposedNumber))  {
                        return checkSupposedNumber}
                }
			}
        } else {
            checkSupposedNumber = this.changeNumberByMask(supposedNumber, index)
            if (!this.stack.source.includes(checkSupposedNumber) ) {
                return checkSupposedNumber
            }
        }

        if (supposedDigit === undefined){

            this.stack.takeTheNext = false
            supposedNumber = this.replaceDigits(supposedNumber, index)

            if (!this.stack.source.includes(supposedNumber)) {
                return supposedNumber
            } else {
                checkSupposedNumber = supposedNumber.split("")
                supposedDigit = checkSupposedNumber.shift()
                checkSupposedNumber.push(supposedDigit)
                if (!this.stack.source.includes(checkSupposedNumber.join("")))
                    return checkSupposedNumber.join("")

                for(let digit of right) {
                    if (!supposedNumber.includes(digit)) {
                        supposedDigit = digit;
                        break
                    }
                }
                return this.changeSymbolInIndex(supposedNumber,index, supposedDigit)
                // this.changeDigit(supposedNumber)
            }
        }

    }

    changeSymbolInIndex(sourcestring, index, symbol) {
        let newCombination = sourcestring.split("")
        newCombination[index] = symbol
        return newCombination.join("")
    }

    changeNumberByMask(supposedNumber, index) {
        let { mask, right } = this.stack.digits
        let newCombination = supposedNumber.split("")
        let rightDigits = Array.from(right)

        if (index < this.maxLength - 1) {
            for (let i= index + 1; i < this.maxLength; i++ ) {
                newCombination[i] = mask[i]
            }
        }

        for (let i=0; i <= index; i++) {
            for (let j=0; j < rightDigits.length; j++) {
                if (newCombination.indexOf(rightDigits[j]) === -1) {
                    newCombination[i] = rightDigits[j]
                    if (!this.stack.source.includes(newCombination.join(""))) {
                        break
                    }
                }
            }
        }
        return newCombination.join("")
    }

    replaceDigits(sourcestring, index) {
        let newCombination = sourcestring.split("")
    	if (index > 0) {
    		let symbol = newCombination[index - 1]
    		newCombination[index - 1] = newCombination[index]
    		if (this.stack.digits.wrong.has(symbol)) {
    		    //todo поменять на правильную цифру
    		}
    		newCombination[index] = symbol
    	}
    	return newCombination.join("")
    }

    addDigit(digit, isRightDigit) {
        let {right, wrong, twice} = this.stack.digits
        let checkTwice = twice.size && twice.has(digit)

        let array = isRightDigit ? right : wrong
        array.add(digit)
        if (checkTwice) {
            for (let item of twice) {
                array.add(item)
            }
            this.stack.digits.twice = new Set()
        }

        if (!isRightDigit && array.size  >=  (10 - this.maxLength)) {
            this.fixRightDigits()
        }
    }

    addManyRightDigits(supposedNumber) {
        supposedNumber.split("").forEach( digit => {
            this.addDigit(digit, 1)
        })
    }

    addManyWrongDigits(supposedNumber, withoutIndex, index) {
        supposedNumber.split("").forEach( (digit, i) => {
            if (!withoutIndex || index != i) this.addDigit(digit, 0)
        })
    }

    fixRightDigits() {
    	let {right, wrong} = this.stack.digits
        for( let i = 0; i <= 9; i++) {
        	if (wrong.has( "" + i)) continue;
            right.add("" + i)
        }
    }

    comparePrevious(supposedNumber){
        const newCountCows = this.homoPlayerNumber.getCountCow(supposedNumber)
        const newCountBulls = this.homoPlayerNumber.getCountBull(supposedNumber)
        const oldCountCows = this.stack.cow
        const oldCountBulls = this.stack.bull
        this.stack.cow = newCountCows;
        this.stack.bull = newCountBulls;
        return [newCountCows - oldCountCows, newCountBulls - oldCountBulls]
    }

    getRandomNumber(){
        let randomNumber, supposedNumber;
        do {
            randomNumber = Math.floor(Math.random()*(9876-123+1)+123);
            supposedNumber = randomNumber > 999 ? String(randomNumber) : "0" + randomNumber
        } while (!this.checkSameNumber(supposedNumber));//alert(supposedNumber)
        return supposedNumber
    }

    checkNumberFromPrompt(supposedNumber) {
        return isNaN(supposedNumber) || supposedNumber < 123 || supposedNumber > 9876
    }

    checkSameNumber(supposedNumber){
        let s = supposedNumber
        return !(s[0] == s[1] || s[0] == s[2] || s[0] == s[3] || s[1] == s[2] || s[1] == s[3] || s[2] == s[3])
    }

    printLog(text, className) {
        let line = document.createElement("div");
        line.classList = typeof className === "undefined" ? "column": className
        line.innerHTML = text
        this.playingField.appendChild(line)
    }
}

window.onload = () => {
    const theGame = new RoundGame(".container");
    let actionButton = theGame.playingField.querySelector("button")

    actionButton.addEventListener("click", e => {
        if (!theGame.won() || theGame.counter < 4) {
            if (theGame.counter == 0) {
                actionButton.innerHTML = "Продолжить игру"
            } else {
                theGame.start()
            }
            theGame.start()
        }
    })
}