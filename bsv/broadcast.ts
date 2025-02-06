import { bsv } from 'scrypt-ts'

export class BroadcastService {
    private static instance: BroadcastService
    private provider: any

    private constructor() {
        this.provider = new bsv.DefaultProvider({
            network: process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
        })
    }

    static getInstance(): BroadcastService {
        if (!BroadcastService.instance) {
            BroadcastService.instance = new BroadcastService()
        }
        return BroadcastService.instance
    }

    async broadcastTx(tx: bsv.Transaction): Promise<string> {
        try {
            const txid = await this.provider.sendTransaction(tx)
            return txid
        } catch (error) {
            console.error('Failed to broadcast transaction:', error)
            throw error
        }
    }

    async fetchUtxos(address: string): Promise<any[]> {
        try {
            const utxos = await this.provider.getUtxos(address)
            return utxos
        } catch (error) {
            console.error('Failed to fetch UTXOs:', error)
            throw error
        }
    }
} 