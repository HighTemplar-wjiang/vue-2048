Vue.component("number-box", {
    computed: {
        numberBoxStyle() {
            let numLevel = parseInt(Math.log2(this.value))
            let numLength = parseInt(Math.log10(this.value))

            let unitHeight = 100.0 / this.gameSize[0]
            let unitWidth = 100.0 / this.gameSize[1]
            let x = parseInt(this.index / this.gameSize[1])
            let y = parseInt(this.index % this.gameSize[1])

            let h = (numLevel * 50) % 360
            let s = "50%"
            let l = 50 - numLevel * 3 + "%"
            let a = "0.5"

            return {
                visibility: this.value === 0 ? "hidden" : "visible",
                top: unitHeight * x + "%",
                left: unitWidth * y + "%",
                height: unitHeight + "%",
                width: unitWidth + "%",
                background: `hsla(${h},${s},${l},${a})`,
                fontSize: 6 * (0.85 ** numLength) + "vw"
            }
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
        getRandomNumber: function () {
            return Math.random() > 0.75 ? 4 : 2;
        },
        index2xy: function (i) {
            return [Math.floor(i / this.gameSize[1]), Math.floor(i % this.gameSize[1])]
        },
        xy2index: function(x, y) {
            return x * this.gameSize[0] + y;
        },
        transpose: function(t) {
            var i;
            for(i = 0; i < t; i++) {
                for(x = 0; x < this.gameSize[0]; x++) {
                    for(y = 0; y < )
                }
            }
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
                this.nums.push([i, i < 2 ? this.getRandomNumber() : 0])
            }
            this.nums = _.shuffle(this.nums)
        },
        reset: function () {
            this.nums = [];
            this.init();
        },
        move: function (direction) {
            console.log(direction);
            this.moveLeft();
        },
        moveLeft: function () {
            var x, y, j;
            var curIndex, preIndex;
            for(x = 0; x < this.gameSize[0]; x++) {
                for(y = 0; y < this.gameSize[1]; y++) {
                    // console.log(x + " " + y)
                    if(this.nums[this.xy2index(x, y)][1] == 0) {
                        continue;
                    }

                    for(j = y; j > 0; j--) {
                        console.log(j);
                        curIndex = this.xy2index(x, j);
                        preIndex = curIndex - 1;

                        // Move to empty cell.
                        if(this.nums[preIndex][1] == 0) {
                            this.swapNum(preIndex, curIndex);
                        }

                        // Merge with previous cell.
                        if(this.nums[preIndex][1] == this.nums[curIndex][1]) {
                            // console.log("Merge " + [preIndex, curIndex]);
                            var p = this.nums[curIndex];
                            var q = this.nums[preIndex];
                            p[1] = 0;
                            q[1] *= 2;
                            this.nums.splice(curIndex, 1, q);
                            this.nums.splice(preIndex, 1, p);
                        }
                    }
                }
            }
        }
    }
})


