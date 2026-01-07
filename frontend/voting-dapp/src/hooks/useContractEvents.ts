import { useEffect, useRef, useState } from 'react'
import {
    usePublicClient,
    useWatchContractEvent,
} from 'wagmi'
import type { Abi, Address, Log } from 'viem'
import { CONTRACT_ABI } from '@/abi/voting';

type Params = {
    address: Address
    abi: Abi
    eventName: string
    fromBlock?: bigint
}

export function useContractEvents({
    address,
    abi,
    eventName,
    fromBlock = 0n,
}: Params) {
    const publicClient = usePublicClient()

    const [events, setEvents] = useState<Log[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // évite les doublons
    const seen = useRef<Set<string>>(new Set())

    /* ========= 1️⃣ Charger l’historique ========= */
    useEffect(() => {
        let cancelled = false

        async function loadPastEvents() {
            setIsLoading(true)

            const logs = await publicClient.getLogs({
                address,
                abi,
                eventName,
                fromBlock,
                toBlock: 'latest',
            })

            if (cancelled) return

            logs.forEach(log =>
                seen.current.add(`${log.transactionHash}-${log.logIndex}`)
            )

            setEvents(logs)
            setIsLoading(false)
        }

        loadPastEvents()

        return () => {
            cancelled = true
        }
    }, [address, abi, eventName, fromBlock, publicClient])

    /* ========= 2️⃣ Watch les nouveaux ========= */
    useWatchContractEvent({
        address,
        abi,
        eventName,
        onLogs(logs) {
            setEvents(prev => {
                const newLogs = logs.filter(log => {
                    const key = `${log.transactionHash}-${log.logIndex}`
                    if (seen.current.has(key)) return false
                    seen.current.add(key)
                    return true
                })

                return newLogs.length ? [...prev, ...newLogs] : prev
            })
        },
    })

    return {
        events,
        isLoading,
    }
}
