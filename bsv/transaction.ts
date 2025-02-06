import { bsv, TestWallet, toHex } from 'scrypt-ts'
import { Locker } from '../../../contracts/locker'
import { validateAmount, validateContent, calculateFee } from './utils'

export async function createPost(content: string, wallet: TestWallet): Promise<string> {
    validateContent(content)

    const tx = new bsv.Transaction()
        .addOutput(new bsv.Transaction.Output({
            script: bsv.Script.fromASM(
                `OP_FALSE OP_RETURN ${Buffer.from('HODL').toString('hex')} ${Buffer.from(content).toString('hex')}`
            ),
            satoshis: 1
        }))

    await wallet.signTransaction(tx)
    const txid = await wallet.sendTransaction(tx)
    return txid
}

export async function createLock(
    postId: string, 
    amount: number,
    wallet: TestWallet
): Promise<{ lockTxId: string; unlockTxId: string }> {
    validateAmount(amount)
    
    const pubKey = wallet.pubKey
    const lockTime = Math.floor(Date.now() / 1000) + 600 // 10 min
    const locker = new Locker(pubKey, postId, lockTime)
    
    // Calculate fee
    const fee = calculateFee(amount)
    const lockAmount = amount - fee
    
    // Deploy contract
    const deployTx = await locker.deploy(lockAmount)
    
    // Create unlock transaction
    const unlockTx = new bsv.Transaction()
        .from(deployTx.getOutput(0))
        .setLockTime(lockTime)
        
    // Add change output back to wallet
    const changeAddress = await wallet.getDefaultAddress()
    unlockTx.addOutput(new bsv.Transaction.Output({
        script: bsv.Script.buildPublicKeyHashOut(changeAddress),
        satoshis: lockAmount - fee
    }))
        
    // Sign unlock transaction
    const sig = await wallet.signMessage(
        toHex(unlockTx.getPreimage(0))
    )
    unlockTx.addInput(
        deployTx.getOutput(0),
        deployTx.getScript(0),
        lockAmount,
        undefined,
        sig
    )
    
    return {
        lockTxId: deployTx.id,
        unlockTxId: unlockTx.id
    }
}

export async function unlock(lockId: string, wallet: TestWallet): Promise<string> {
    // Get lock details from database
    // This would need to be implemented with your database connection
    
    // Create and broadcast unlock transaction
    const tx = new bsv.Transaction()
    // Add unlock logic here
    
    return tx.id
}

export async function createReply(
    postId: string,
    content: string,
    wallet: TestWallet
): Promise<string> {
    validateContent(content)
    
    const tx = new bsv.Transaction()
        .addOutput(new bsv.Transaction.Output({
            script: bsv.Script.fromASM(
                `OP_FALSE OP_RETURN ${Buffer.from('HODL_REPLY').toString('hex')} ${Buffer.from(postId).toString('hex')} ${Buffer.from(content).toString('hex')}`
            ),
            satoshis: 1
        }))

    await wallet.signTransaction(tx)
    const txid = await wallet.sendTransaction(tx)
    return txid
} 