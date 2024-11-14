"use strict";
(() => {
  // src/findRoots.ts
  function findRootsComplexPolynomial(epsilon = 0.1, range = 2, step = 1e-3) {
    const solutions = [];
    function polynomial(x, y) {
      const term1 = Math.pow(Math.pow(x, 2) - Math.pow(y, 2) + x, 2) - Math.pow(2 * x * y + y, 2) + x;
      const term2 = 2 * (Math.pow(x, 2) - Math.pow(y, 2) + x) * (2 * x * y + y) + y;
      return Math.pow(term1, 2) + Math.pow(term2, 2) - 2;
    }
    for (let x = -range; x <= range; x += step) {
      for (let y = -range; y <= range; y += step) {
        const result = polynomial(x, y);
        if (Math.abs(result) < epsilon) {
          solutions.push([parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
        }
      }
    }
    return solutions.length > 0 ? solutions : "Keine reellen Nullstellen gefunden";
  }
  console.log(findRootsComplexPolynomial());
})();
//# sourceMappingURL=findRoots.js.map
