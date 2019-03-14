Vue.component("number-box", {
    data: function () {
        return {
            grownFlag: false
        }
    },
    watch: {
        value: function(newValue, oldValue) {
            if((newValue > oldValue) && oldValue > 0) {
                this.grownFlag = true;
                var self = this;
                setTimeout(function(){ self.grownFlag = false; }, 500);
            } else {
                this.grownFlag = false;
            }
        }
    },
    computed: {
        computedBoxStyle: function() {

            let unitHeight = 100.0 / this.gameSize[0];
            let unitWidth = 100.0 / this.gameSize[1];
            let x = parseInt(this.index / this.gameSize[1]);
            let y = parseInt(this.index % this.gameSize[1]);

            return {
                top: `${unitHeight*x}%`,
                left: `${unitWidth*y}%`,
                height: `${unitHeight}%`,
                width: `${unitWidth}%`,
            };
        },
        numberClassObject: function() {
            return {
                number: true,
                emphasis: this.grownFlag,
            }
        },
        numberFillStyle: function() {
            let numLevel = parseInt(Math.log2(this.value+1));
            let numLength = parseInt(Math.log10(this.value+1));
            
            let h = (numLevel * 50) % 360;
            let s = "50%";
            let l = 50 - numLevel * 3 + "%";
            let a = this.value < 2 ? 0.0 : 0.5;

            let unitHeight = 100.0 / this.gameSize[0];

            return {
                background: `hsl(${h},${s},${l})`,
                opacity: a,
                fontSize: unitHeight * 0.5 * (0.8 ** numLength) + "vmin",
            };
        }
    },
    props: ["index", "value", "gameSize"],
    template: `
        <li
            class="box"
            draggable="true"
            v-bind:style='computedBoxStyle'
        >
            <transition name="bounce">
            <div
                class="number"
                v-bind:class="{emphasis: grownFlag}"
                v-bind:style="numberFillStyle"
                v-if="value > 0"
            >{{ value }}</div>
            </transition>
        </li>
    `
});

var app = new Vue({
    el: "#app",
    data: {
        gameConfig: {},
        nums: [],
        maxNum: 0,
        steps: 0,
        gameSize: [4, 4],
        gameTargetLevel: 11,
        newGameSize: [4, 4],
        newGameTargetLevel: 11,
        hintDisplayFlag: false,
        hintSelectedMethod: 0,
        hintAvailableMethods: [],
        hintProbabilities: {},
        hintText: "No hint yet.",
        hintMove: "",
        hintAPIs: {
            "hint": "http://localhost:8000/my2048bot/hint",
            "available_methods": "http://localhost:8000/my2048bot/available_methods",
        },
        autoPlayStatus: 200,
        autoPlayFlag: false,
        autoPlayInterval: null,
        autoPlayIntervalms: 1000,
    },
    computed: {
        gameTarget: function() {
            return 2 ** this.gameTargetLevel;
        },
        deadGameFlag: function() {
            var newFlag = this.deadGameCheck();
            if(newFlag == true) {
                this.autoPlayFlag = false;
            }
            return newFlag;
        },
        winGameFlag: function() {
            var newFlag = this.maxNum >= this.gameTarget;
            if(newFlag == true) {
                this.autoPlayFlag = false;
            }
            return newFlag;
        },
    },
    watch: {
        newGameTargetLevel: function() {
            if(this.newGameTargetLevel < 1) {
                this.newGameTargetLevel = 1;
            }
            else if(this.newGameTargetLevel > 100) {
                this.newGameTargetLevel = 100;
            }
        },
        autoPlayFlag: function () {
            if(this.autoPlayFlag === true) {
                this.autoPlayInterval = window.setInterval(this.queryBot, this.autoPlayIntervalms);
            } else {
                clearInterval(this.autoPlayInterval);
            }
        },
        autoPlayIntervalms: function() {
            // Boudary check.
            if(this.autoPlayIntervalms < 100) {
                this.autoPlayIntervalms = 100;
            }
            if(this.autoPlayIntervalms > 10000) {
                this.autoPlayIntervalms = 10000;
            }

            clearInterval(this.autoPlayInterval);
            if(this.autoPlayFlag === true) {
                this.autoPlayInterval = window.setInterval(this.queryBot, this.autoPlayIntervalms);
            } 
        }
    },
    created: function () {
        this.init();
        window.addEventListener("keyup", this.keyUp)
        // Set-up axios header.
        axios.defaults.headers.common = {"Content-Type": "application/x-www-form-urlencoded"}
        // Fetch available methods.
        axios.get(this.hintAPIs.available_methods).then(
            response => {
                if(response.status == 200) {
                    this.hintAvailableMethods = response.data.details.available_methods;
                }
                this.hintSelectedMethod = this.hintAvailableMethods[0];
            }
        )
    },
    methods: {
        // Utilities.
        swapNum: function(i, j) {
            var p = this.nums[i];
            var q = this.nums[j];

            this.nums.splice(i, 1, q);
            this.nums.splice(j, 1, p);
        },
        getZeroIndexes: function() {
            var i;
            var zeroIndexes = new Array();
            for(i = 0; i < this.nums.length; i++) {
                if(this.nums[i][1] === 0) {
                    zeroIndexes.push(i);
                }
            }
            return zeroIndexes;
        },
        getRandomInt: function(max) {
            return Math.floor(Math.random() * Math.floor(max));
        },
        getRandomNumber: function () {
            return Math.random() > 0.75 ? 4 : 2;
        },
        index2xy: function (i, h, w) {
            return [Math.floor(i / w), Math.floor(i % w)];
            // return [Math.floor(i / this.gameSize[1]), Math.floor(i % this.gameSize[1])]
        },
        xy2index: function(x, y, w) {
            return x * w + y;
        },
        singleRotateRight(originalMatrix, transposedMatrix, M, N) {
            var i, j, it, jt;
            for(i = 0; i < M; i++) {
                for(j = 0; j < N; j++) {
                    [it, jt] = [j, M-i-1];
                    transposedMatrix[this.xy2index(it, jt, M)] = originalMatrix[this.xy2index(i, j, N)];
                }
            }
        },
        multiRotates: function(transpose_times) {
            var temp = new Array(this.nums.length);
            var M, N;
            for([M, N] = [this.gameSize[0], this.gameSize[1]], transpose_times %= 4; 
                transpose_times > 0; 
                transpose_times--) {
                this.singleRotateRight(this.nums, temp, M, N);
                [this.nums, temp] = [temp, this.nums];
                [M, N] = [N, M];
            }
            return [M, N];
        },

        // Events.
        keyUp: function(event) {
            switch(event.key) {
                case "Left":
                case "ArrowLeft":
                    this.move("left");
                    break;
                case "Right":
                case "ArrowRight":
                    this.move("right");
                    break;
                case "Up":
                case "ArrowUp":
                    this.move("up");
                    break;
                case "Down":
                case "ArrowDown":
                    this.move("down");
                    break;
                default:
                    break;
            }
            this.queryBot();
        },
        init: function () {
            var totalNums = this.gameSize[0] * this.gameSize[1];
            var i;
            for(i = 0; i < totalNums; i++) {
                this.nums.push([i, i < 2 ? this.getRandomNumber() : 0]);
            }
            this.nums = _.shuffle(this.nums);
            this.maxNum = 0;
            this.steps = 0;
        },
        reset: function () {
            this.nums = [];
            this.init();
        },
        configSet: function() {
            var oldLength = this.gameSize[0] * this.gameSize[1];
            var newLength = this.newGameSize[0] * this.newGameSize[1];
            var i;

            if(newLength > oldLength) {
                var idBase = window.performance.now();
                for(i = newLength-1; i > oldLength-1; i--) {
                    this.nums.push([idBase+i, 0]);
                }
                this.spawnNewBlock();
            } else {
                for(i = oldLength-1; i > newLength-1; i--) {
                    this.nums.pop();
                }
            }

            // Make sure there are as least two numbers.
            var zeroIndexes = this.getZeroIndexes();
            for(var i = 0; i < 2 - (newLength - zeroIndexes.length); i++) {
                this.spawnNewBlock();
            }

            this.gameSize.splice(0, 1, this.newGameSize[0]);
            this.gameSize.splice(1, 1, this.newGameSize[1]);

            // Set game level.
            this.gameTargetLevel = this.newGameTargetLevel;
        },
        spawnNewBlock() {
            var zeroIndexes = this.getZeroIndexes();
            if(zeroIndexes.length > 0) {
                var newIndex = zeroIndexes[this.getRandomInt(zeroIndexes.length-1)];
                var newNum = this.getRandomNumber();
                this.nums.splice(newIndex, 1, [this.nums[newIndex][0], newNum]);
            }
        },
        deadGameCheck: function() {
            if(this.winGameFlag == true) {
                return false;
            }

            for(var i = 0; i < this.gameSize[0]; i++) {
                for(var j = 0; j < this.gameSize[1]; j++) {
                    var index1dthis = this.xy2index(i, j, this.gameSize[1]);
                    var index1dright = this.xy2index(i, j+1, this.gameSize[1]);
                    var index1ddown = this.xy2index(i+1, j, this.gameSize[1]);

                    // Bottom
                    if(i == (this.gameSize[0] - 1)) {
                        index1ddown = index1dright;
                    }
                    
                    // Right most.
                    if(j == (this.gameSize[1]- 1)) {
                        index1dright = index1ddown;
                    }

                    // Last number, i.e., right down corner.
                    if(index1dthis == (this.nums.length-1)) {
                        if(this.nums[index1dthis][1] == 0) {
                            return false;
                        }
                        break;
                    }

                    // Alive if there is empty block.
                    if((this.nums[index1dthis][1] == 0) 
                    || (this.nums[index1dright][1] == 0)
                    || (this.nums[index1ddown][1] == 0)) {
                        return false;
                    }

                    // Alive if mergable.
                    if((this.nums[index1dthis][1] == this.nums[index1dright][1])
                    || (this.nums[index1dthis][1] == this.nums[index1ddown][1])) {
                        return false;
                    }
                }
            }

            return true;
        },
        move: function (direction) {
            var transpose_dict = {
                "left": 0,
                "down": 1,
                "right": 2,
                "up": 3
            };

            // Move and merge
            var transpose_times = transpose_dict[direction];
            [this.gameSize[0], this.gameSize[1]] = this.multiRotates(transpose_times);
            var moved = this.moveLeft();
            [this.gameSize[0], this.gameSize[1]] = this.multiRotates(4 - transpose_times);

            // Generate new block.
            if(moved) {
                this.steps++;
                window.setTimeout(this.spawnNewBlock, 300);
            }
        },
        moveLeft: function () {
            var x, y, j;
            var curIndex, preIndex;
            var moved = false;
            for(x = 0; x < this.gameSize[0]; x++) {
                var merged = new Array(this.gameSize[1]).fill(false);
                for(y = 0; y < this.gameSize[1]; y++) {
                    // console.log(x + " " + y)
                    if(this.nums[this.xy2index(x, y, this.gameSize[1])][1] == 0) {
                        continue;
                    }

                    for(j = y; j > 0; j--) {
                        curIndex = this.xy2index(x, j, this.gameSize[1]);
                        preIndex = curIndex - 1;

                        // Move to empty cell.
                        if(this.nums[preIndex][1] == 0) {
                            moved = true;
                            this.swapNum(preIndex, curIndex);
                        }
                        else if((this.nums[preIndex][1] == this.nums[curIndex][1])
                            && (merged[j-1] == false)
                            && (merged[j] == false)) {
                            // Merge with previous cell.
                            merged[j] = true;
                            merged[j-1] = true;
                            moved = true;

                            // console.log(`Merging ${preIndex} ${curIndex}`);
                            var newNumber = this.nums[preIndex][1] * 2
                            this.nums[preIndex].splice(1, 1, newNumber);
                            this.nums[curIndex].splice(1, 1, 0);

                            // Calculate max.
                            if(newNumber > this.maxNum) {
                                this.maxNum = newNumber;
                            }
                        }
                    }
                }
            }
            return moved;
        },
        queryBot: function() {
            axios.post(this.hintAPIs["hint"], {
                "method": this.hintSelectedMethod,
                "checkboard": this.nums.map(num => num[1]),
                "game_size": this.gameSize,
            }).then(response => {
                this.autoPlayStatus = response.status;
                if(response.status == 200) {
                    this.hintProbabilities = response.data.details.suggest;
                    this.hintText = "";
                    this.hintMove = "up";
                    var maxProbability = 0;
                    for(var key in this.hintProbabilities) {
                        var probability = this.hintProbabilities[key];
                        if(probability > maxProbability) {
                            maxProbability = probability;
                            this.hintMove = key;
                        }
                    }
                    this.hintText = this.hintMove + "(" + (this.hintProbabilities[this.hintMove] * 100).toFixed(2) + "%)";
                    if((this.autoPlayFlag == true)
                    && (this.deadGameFlag == false)
                    && (this.winGameFlag == false)) {
                        this.move(this.hintMove);
                    }
                }
            }).catch(error => {
                console.log(error);
            })
        },
    }
})


