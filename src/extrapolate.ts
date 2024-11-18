export function extrapolateReal(points: {real: number, imag: number}[]): {i: number, real: number}[]{

    const restructuredPoints = points.map((point, index) =>({
        i: index,
        real: point.real
    }))
    
    
    return restructuredPoints
}

export function extrapolateImag(points: {real: number, imag: number}[]): {i: number, imag: number}[]{

    const restructuredPoints = points.map((point, index) =>({
        i: index,
        imag: point.imag
    }))
    
    return restructuredPoints
}

export function extrapolate(
    points: {real: number, imag: number}[], 
    part: "real" | "imag"
): {index: number, value: number}[]{
        return points.map((complex,index)=>({
            index,
            value: complex[part]

        }))
    }