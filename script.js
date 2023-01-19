console.clear(); // Start with a clean console on refesh

const { createApp } = Vue;

const App = {
  // el: "#app",
  // data: {
  data() {
    return {
      values: [],
      colors: [
        "#064743",
        "#17d2ca",
        "#88d91a",
        "#840cd4",
        "#fcac0e",
        "#fcff11",
        "#e7151a",
        "#009b0e",
        "#064743",
        "#17d2ca",
        "#88d91a",
        "#840cd4",
        "#fcac0e",
        "#fcff11",
        "#e7151a",
        "#009b0e"],

      showTooltip: false,
      current: {
        player: "",
        time: "",
        date: ""
      },

      pos: {
        x: 0,
        y: 0
      },

      size: {
        width: 1000,
        height: 750,
        margin: 80
      }
    };


  },
  computed: {
    generateHexColor(index) {
      const seed = this.values[index].name;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (let i = 0; i < 3; i++) {
        let value = hash >> i * 8 & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
      }
      return color;
    },
    nameToColor() {
      const names = this.values.map((data, index) => data.name);
      return [...new Set(names)];
    },
    // viewBox() {
    //   return `0 0 ${this.size.width} ${this.size.height}`;
    // },

    formatDate(time) {
      const arrayTime = time.split(":");
      const [minutes, seconds, milliseconds] = [...arrayTime];
      const date = new Date(2021, 0, 1, 12, minutes, seconds, milliseconds);
      return date;
    },
    //------------------------------------------------------//
    // D3.js generate the scale
    //------------------------------------------------------//
    getScale() {
      const x = d3.
        scaleTime().
        domain([
          d3.max(this.values.map((data, index) => new Date(data.date))),
          d3.min(this.values.map((data, index) => new Date(data.date)))]).

        range([this.size.width - this.size.margin * 2, 0]);
      function formatDate(time) {
        const arrayTime = time.split(":");
        const [minutes, seconds, milliseconds] = [...arrayTime];
        const date = new Date(2021, 0, 1, 12, minutes, seconds, milliseconds);
        return date;

      }
      const y = d3.
        scaleTime().
        domain([
          d3.min(this.values.map((data, index) => formatDate(data.time))),
          d3.max(this.values.map((data, index) => formatDate(data.time)))]).

        range([this.size.height - this.size.margin * 2, 0]);

      return { x, y };
    },
    //------------------------------------------------------//
    // END D3.js generate the scale
    //------------------------------------------------------//
    //------------------------------------------------------//
    // D3 Line logic
    //------------------------------------------------------//
    perLineGenerator() {
      let lastPointX = 0;
      let lastPointY = 0;
      function formatDate(time) {
        const arrayTime = time.split(":");
        const [minutes, seconds, milliseconds] = [...arrayTime];
        const date = new Date(2021, 0, 1, 12, minutes, seconds, milliseconds);
        return date;
      }
      return this.values.map((data, index) => {
        let polyline = d3.line();
        let path = [];
        const x = this.getScale.x(new Date(data.date));
        const y = this.getScale.y(formatDate(data.time));
        path.push([lastPointX, lastPointY]);
        path.push([x, lastPointY]);
        path.push([x, y]);
        lastPointY = y;
        lastPointX = x;
        return polyline(path);
      });
    },
    //------------------------------------------------------//
    // END D3 Line logic
    //------------------------------------------------------//
    //------------------------------------------------------//
    // Cirlce position and size
    //------------------------------------------------------//
    circleDraw() {
      function formatDate(time) {
        const arrayTime = time.split(":");
        const [minutes, seconds, milliseconds] = [...arrayTime];
        const date = new Date(2021, 0, 1, 12, minutes, seconds, milliseconds);
        return date;
      }
      // return this.values.map((data, index) => {
      //   return {
      //     x: this.getScale.x(new Date(data.date)),
      //     y: this.getScale.y(data.value)
      //   };
      // });
      return this.values.map((data, index) => {
        return {
          x: this.getScale.x(new Date(data.date)),
          y: this.getScale.y(formatDate(data.time))
        };

      });
    },
    circleColor() {
      return this.values.map((data, index) => {
        return this.colors[this.nameToColor.indexOf(data.name)];
      });
    },
    calculateSize() {
      return d3.
        scaleLinear().
        domain([0, d3.max(this.values)]).
        range([1, 25]);
    },
    circleSize() {
      return this.values.map((item, index) => {
        return this.calculateSize(item);
      });
    }
    //------------------------------------------------------//
    // END Cirlce position and size
    //------------------------------------------------------//
  },
  methods: {
    // reverseData() {
    //   this.items = this.values.reverse();
    // },
    //------------------------------------------------------//
    // Create tooltip
    //------------------------------------------------------//
    updateTooltip(index, e) {
      this.showTooltip = true;
      const info = this.values[index];
      this.current = {
        name: info.name,
        time: info.time,
        date: info.date
      };

      const tooltip = this.$refs.tooltip;
      const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      // const pos = this.pos;
      const mouse = { x: pos.x, y: pos.y };
      const speed = 0.2;

      const xSet = gsap.quickSetter(tooltip, "x", "px");
      const ySet = gsap.quickSetter(tooltip, "y", "px");

      gsap.ticker.add(() => {
        // adjust speed for higher refresh monitors
        const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
        pos.x += (e.x - pos.x) * dt;
        pos.y += (e.y - pos.y) * dt;
        xSet(pos.x);
        ySet(pos.y);
      });

      //       this.pos.x = e.x;
      // this.pos.y = e.y;
    },
    hideTooltip() {
      this.showTooltip = false;
    },
    //------------------------------------------------------//
    // END Create tooltip
    //------------------------------------------------------//
    addAxisX() {
      d3.select(this.$refs.axisX).call(d3.axisBottom(this.getScale.x).tickFormat(d3.timeFormat("%Y")));
    },
    addAxisY() {

      d3.select(this.$refs.axisY).
        call(d3.axisLeft(this.getScale.y).tickFormat(d3.timeFormat("%M:%S")));
    }
  },

  watch: {
    getScale() {
      this.addAxisX();
      this.addAxisY();
    }
  },

  // mounted() {
  //   // this.addAxisX();
  //   // this.addAxisY();
  // },
  // created() {
  //   //--------------------------------//
  //   // Setup apiKey for development
  //   //--------------------------------//
  //   this.apiKey = localStorage.getItem("apiKey");

  //   if (!this.apiKey) {
  //     this.apiKey = prompt("Enter API Key:");
  //     this.apiKey = localStorage.setItem("apiKey", this.apiKey);
  //   }
  //   // END Setup apiKey for development --------------//
  //   console.warn(this.apiKey);

  // },
  async mounted() {
    //------------------------------------------------------//
    // Google spreadsheet API logic
    //------------------------------------------------------//
    const spreadsheetID = "1xUEByyIty6q7dIv_hysJ4534u696e2HVWnTD4-YGxLk";
    const apiKey = "";
    const tab = "main";
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values/${tab}?alt=json&key=${apiKey}`).

      then(response => response.json()).
      then(response => {
        console.warn(response);
        const columns = response.values[0];
        const values = response.values.slice(1).map((val) =>
          columns.reduce((arg, key, idx) => {
            arg[key] = val[idx];
            return arg;
          }, {}));


        // Update the formated data to the schools array
        this.values = values;
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;
        this.addAxisX();
        this.addAxisY();
      }).
      catch(function (error) {
        console.log(error);
      });
  },

};


createApp(App).mount("#app");