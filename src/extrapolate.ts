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

