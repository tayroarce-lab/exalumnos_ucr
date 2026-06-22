import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react'
import { ApplicationStatus, STATUS_MESSAGES, STATUS_COLORS } from '@/types/applications'

interface BadgeProps {
  status: ApplicationStatus
  className?: string
  showIcon?: boolean
}

export default function ApplicationStatusBadge({ status, className = '', showIcon = true }: BadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  const message = STATUS_MESSAGES[status] || status

  const getIcon = () => {
    switch (status) {
      case 'enviada': return <Clock size={14} className="mr-1.5" />
      case 'en_revision': return <Eye size={14} className="mr-1.5" />
      case 'seleccionado': return <CheckCircle size={14} className="mr-1.5" />
      case 'descartado': return <XCircle size={14} className="mr-1.5" />
      default: return null
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {showIcon && getIcon()}
      {message}
    </span>
  )
}
