import { bsv, TestWallet, DefaultProvider } from 'scrypt-ts'
import { BroadcastService } from './broadcast'

let wallet: TestWallet | null = null

export function getWallet(): TestWallet {
  if (!wallet) {
    const provider = new DefaultProvider({
      network: process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
    })
    
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required')
    }
    
    wallet = new TestWallet(privateKey, provider)
  }
  
  return wallet
}

export async function initWallet(): Promise<TestWallet> {
  const wallet = getWallet()
  const broadcaster = BroadcastService.getInstance()
  
  // Initialize wallet with UTXOs
  const address = await wallet.getDefaultAddress()
  const utxos = await broadcaster.fetchUtxos(address)
  await wallet.updateUtxos(utxos)
  
  return wallet
}

export async function fundWallet(amount: number): Promise<TestWallet> {
  const wallet = getWallet()
  const currentBalance = await wallet.getBalance()
  
  if (currentBalance < amount) {
    throw new Error('Insufficient funds in wallet')
  }
  
  return wallet
} 