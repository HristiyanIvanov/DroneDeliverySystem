export class City {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cityMap = [];
  }

  setCooridnates(x, y) {
    this.x = x;
    this.y = y;
  }

  printCity() {
    console.log(this.cityMap);
    const cityString = this.cityMap.map((row) => row.join(" ")).join("\n");
    console.log(cityString);
  }

  importMap(jsonData) {
    const mapCoordValues = Object.values(jsonData["map-top-right-coordinate"]);
    this.setCooridnates(mapCoordValues[0], mapCoordValues[1]);
    for (let x = 0; x < this.x; x++) {
      this.cityMap[x] = [];
      for (let y = 0; y < this.y; y++) {
        this.cityMap[x][y] = 0;
      }
    }
  }

  getCityMap() {
    return this.cityMap;
  }
}
