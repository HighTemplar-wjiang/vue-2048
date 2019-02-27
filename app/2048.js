Vue.component("number-box", {
    computed: {
        numberBoxStyle() {
            let numLevel = parseInt(Math.log2(this.value+1));
            let numLength = parseInt(Math.log10(this.value+1));

            let unitHeight = 100.0 / this.gameSize[0];
            let unitWidth = 100.0 / this.gameSize[1];
            let x = parseInt(this.index / this.gameSize[1]);
            let y = parseInt(this.index % this.gameSize[1]);

            let h = (numLevel * 50) % 360;
            let s = "50%";
            let l = 50 - numLevel * 3 + "%";
            let a = this.value < 2 ? 0.0 : 0.5;

            var newStyle = {
                // visibility: this.value < 2 ? "hidden" : "visible",
                visibility: "visible",
                border: "0.1vw solid " + this.value < 2 ? "white" : "lightgray",
                top: unitHeight * x + "%",
                left: unitWidth * y + "%",
                height: unitHeight + "%",
                width: unitWidth + "%",
                opacity: a,
                background: this.value < 2 ? "white" : `hsl(${h},${s},${l})`,
                fontSize: 6 * (0.85 ** numLength) + "vw"
            };

            return newStyle;
        }
    },
    props: ["index", "value", "gameSize"],
    template: `
        <li
            class="box"
            draggable="true"
            v-bind:style="numberBoxStyle"
        >{{ value }}</li>
    `
});

var app = new Vue({
    el: "#app",
    data: {
        gameConfig: {},
        nums: [],
        steps: 0,
        gameSize: [4, 4],
        newGameSize: [4, 4]
    },
    created: function () {
        this.init()
        window.addEventListener("keyup", this.keyUp)
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
        singleTranspose(originalMatrix, transposedMatrix, M, N) {
            var i, j, it, jt;
            for(i = 0; i < M; i++) {
                for(j = 0; j < N; j++) {
                    [it, jt] = [j, M-i-1];
                    transposedMatrix[this.xy2index(it, jt, M)] = originalMatrix[this.xy2index(i, j, N)];
                }
            }
        },
        multiTranspose: function(transpose_times) {
            var temp = new Array(this.nums.length);
            var M, N;
            for([M, N] = [this.gameSize[0], this.gameSize[1]], transpose_times %= 4; 
                transpose_times > 0; 
                transpose_times--) {
                this.singleTranspose(this.nums, temp, M, N);
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
        },
        init: function () {
            var totalNums = this.gameSize[0] * this.gameSize[1]
            var i;
            for(i = 0; i < totalNums; i++) {
                this.nums.push([i, i < 2 ? this.getRandomNumber() : 0]);
            }
            this.nums = _.shuffle(this.nums);
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
                for(i = newLength-1; i > oldLength-1; i--) {
                    this.nums.push([i, 0]);
                }
                this.spawnNewBlock();
            } else {
                for(i = oldLength-1; i > newLength-1; i--) {
                    this.nums.pop();
                }
            }

            this.gameSize.splice(0, 1, this.newGameSize[0]);
            this.gameSize.splice(1, 1, this.newGameSize[1]);
            // this.gameSize[0] = this.newGameSize[0];
            // this.gameSize[1] = this.newGameSize[1];
        },
        spawnNewBlock() {
            var zeroIndexes = this.getZeroIndexes();
            var newIndex = zeroIndexes[this.getRandomInt(zeroIndexes.length-1)];
            var newNum = this.getRandomNumber();
            this.nums.splice(newIndex, 1, [this.nums[newIndex][0], newNum]);
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
            [this.gameSize[0], this.gameSize[1]] = this.multiTranspose(transpose_times);
            var moved = this.moveLeft();
            [this.gameSize[0], this.gameSize[1]] = this.multiTranspose(4 - transpose_times);

            // Generate new block.
            if(moved) {
                this.spawnNewBlock();
            }
        },
        moveLeft: function () {
            var x, y, j;
            var curIndex, preIndex;
            var moved = false;
            for(x = 0; x < this.gameSize[0]; x++) {
                var merged = new Array(this.gameSize[1]).fill(false);
                for(y = 0; y < this.gameSize[1]; y++) {
                    console.log(x + " " + y)
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

                            console.log(`Merging ${preIndex} ${curIndex}`);
                            this.nums[preIndex].splice(1, 1, this.nums[preIndex][1]*2);
                            this.nums[curIndex].splice(1, 1, 0);
                        }
                    }
                }
            }
            return moved;
        }
    }
})


