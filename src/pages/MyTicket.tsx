import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import './myTicket.css'
import Ticket from '../components/Ticket.tsx'
import type { Order } from '../types.ts'
import { useToast } from '../context/ToastContext.tsx'

const MyTicket = () => {
    const [active, setActive] = useState('upcoming')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const { showToast } = useToast()

    useEffect(() => {
        window.scrollTo(0, 0)
        const fetchOrders = async () => {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            try {
                const res = await fetch("http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/orders", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    const data: Order[] = await res.json()
                    // Start from newest
                    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    setOrders(data)
                } else {
                    showToast("Failed to fetch tickets", "error")
                }
            } catch (err) {
                console.error("Failed to fetch orders", err)
                showToast("Something went wrong while loading tickets", "error")
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [showToast])

    const now = new Date()

    const completedOrders = orders.filter(order => order.status !== 'PENDING')
    const upcomingOrders = completedOrders.filter(order => new Date(order.showtime.startTime) > now)
    const historyOrders = completedOrders.filter(order => new Date(order.showtime.startTime) <= now)

    return (
        <>
            <Navbar page="tsk" />

            <div className='container'>
                <h1>My Tickets</h1>
                <div className='categoryBtn'>
                    <button
                        className={active === 'upcoming' ? 'active' : ''}
                        onClick={() => setActive('upcoming')}
                    >
                        Upcoming
                    </button>

                    <button
                        className={active === 'history' ? 'active' : ''}
                        onClick={() => setActive('history')}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className={`ticketList ${active !== 'upcoming' ? 'hidden' : ''}`}>
                {upcomingOrders.length === 0 && !loading && <p className="no-ticket">No upcoming tickets</p>}
                {upcomingOrders.map(order => (
                    <Ticket key={order.id} order={order} />
                ))}
            </div>

            <div className={`ticketList ${active !== 'history' ? 'hidden' : ''}`}>
                {historyOrders.length === 0 && !loading && <p className="no-ticket">No booking history</p>}
                {historyOrders.map(order => (
                    <Ticket key={order.id} order={order} />
                ))}
            </div>
        </>
    )
}

export default MyTicket
