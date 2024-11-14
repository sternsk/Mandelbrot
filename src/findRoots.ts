function findRootsComplexPolynomial(epsilon: number = 0.1, range: number = 2, step: number = 0.001): Array<[number, number]> | string{
    const solutions: Array<[number, number]> = [];

    function polynomial(x: number, y: number): number {
        const term1 = Math.pow((Math.pow(x, 2) - Math.pow(y, 2) + x), 2) - Math.pow((2 * x * y + y), 2) + x;
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

// Beispielaufruf
console.log(findRootsComplexPolynomial());
