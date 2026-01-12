import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface SocialProofProps {
  count: number
}

export function SocialProof({ count }: SocialProofProps) {
  const avatarColors = [
    "bg-gray-100 text-gray-300",
    "bg-gray-200 text-gray-400", 
    "bg-gray-300 text-gray-500",
    "bg-gray-400 text-gray-600",
    "bg-fitness-gray text-white",
  ]

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex -space-x-3">
        {avatarColors.map((colors, index) => (
          <Avatar key={index} className={`size-10 border-2 border-white shadow-sm ${colors.split(" ")[0]}`}>
            <AvatarFallback className={colors}>
              {index === avatarColors.length - 1 ? (
                <span className="text-xs font-bold">+</span>
              ) : (
                <User className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-sm font-medium text-fitness-gray">
        Loved by <span className="font-bold text-fitness-dark-gray">{count}+</span> athletes
      </div>
    </div>
  )
}
