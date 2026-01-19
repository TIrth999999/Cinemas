import { createContext, useContext, useCallback, type ReactNode } from 'react'
import toast from 'react-hot-toast'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        switch (type) {
            case 'success':
                toast.success(message, { duration })
                break
            case 'error':
                toast.error(message, { duration })
                break
            case 'warning':

                toast(message, {
                    icon: '⚠️',
                    duration
                })
                break
            case 'info':
            default:
                toast(message, {
                    icon: 'ℹ️',
                    duration
                })
                break
        }
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    )
}
