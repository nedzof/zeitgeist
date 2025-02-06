import { bsv } from 'scrypt-ts'

export function calculateFee(amount: number): number {
    return Math.floor(amount * 0.000001) // 0.0001%
}

export function createDataScript(content: string): bsv.Script {
    return bsv.Script.buildDataOut(['Z_POST', content])
}

export function getLockTime(minutes: number = 10): number {
    return Math.floor(Date.now() / 1000) + (minutes * 60)
}

export function validateAmount(amount: number): void {
    if (amount < 1000) { // 1000 satoshis minimum
        throw new Error('Amount too small')
    }
    if (amount > 100000000000) { // 1000 BSV maximum
        throw new Error('Amount too large')
    }
}

export function validateContent(content: string): void {
    if (!content || content.length < 1) {
        throw new Error('Content required')
    }
    if (content.length > 1000) {
        throw new Error('Content too long')
    }
} 