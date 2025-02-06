import { Locker } from '../../../contracts/locker'
import { DefaultProvider, bsv } from 'scrypt-ts'

export async function compileContract() {
    try {
        const provider = new DefaultProvider({
            network: process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
        })
        
        await Locker.compile()
        
        console.log('Contract compiled successfully')
    } catch (error) {
        console.error('Failed to compile contract:', error)
        throw error
    }
}

export function initContractLibrary() {
    bsv.init({
        network: process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
        feeb: 0.5,
    })
} 