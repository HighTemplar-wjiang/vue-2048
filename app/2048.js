Vue.component("number-box", {
    computed: {
        numberBoxStyle() {
            let numLevel = parseInt(Math.log2(this.num))
            let numLength = parseInt(Math.log10(this.num))

            let unitHeight = 100.0 / this.gameSize[0]
            let unitWidth = 100.0 / this.gameSize[1]
            let x = parseInt(this.index / this.gameSize[1])
            let y = parseInt(this.index % this.gameSize[1])

            let h = (numLevel * 50) % 360
            let s = "50%"
            let l = 50 - numLevel * 3 + "%"
            let a = "0.5"

            return {
                top: unitHeight * x + "%",
                left: unitWidth * y + "%",
                height: unitHeight + "%",
                width: unitWidth + "%",
                background: `hsla(${h},${s},${l},${a})`,
                fontSize: 6 * (0.85 ** numLength) + "vw"
            }
        }
    },
    props: ["index", "num", "gameSize"],
    template: `
        <li
            class="box"
            draggable="true"
            v-bind:style="numberBoxStyle"
        >{{ num }}</li>
    `
});

var app = new Vue({
    el: "#app",
    data: {
        gameConfig: {},
        nums: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
        steps: 0,
        gameSize: [4, 4],
    },
    created: function () {
        console.log("created")
    },
    methods: {
        reset: function () {
            console.log("reset")
            this.nums = _.shuffle(this.nums).map((val) => {return val;})
        },

        // Get the box color.
        getColor: function (num) {
            var h = num / 255;
            var s = "50%"
            var l = "50%"
            var a = "0.5"
            return `hsla(${h},${s},${l},${a})`
        }
    }
})


