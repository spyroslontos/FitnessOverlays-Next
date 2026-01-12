import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface SocialProofProps {
  count: number
}

export function SocialProof({ count }: SocialProofProps) {
const avatarColors = [
  "bg-foreground/90 text-background",
  "bg-foreground/75 text-background",
  "bg-foreground/60 text-background",
  "bg-foreground/45 text-background",
  "bg-muted text-muted-foreground",
]

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex -space-x-3">
        {avatarColors.map((colors, index) => (
          <Avatar key={index} className="size-10 border border-border shadow-sm">
            <AvatarFallback className={`${colors} font-medium`}>
              {index === avatarColors.length - 1 ? (
                <span className="text-xs font-bold">+</span>
              ) : (
                <User className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
        Loved by <span className="font-bold text-primary text-base md:text-lg"> {count}+ </span> athletes
      </div>
    </div>
  )
}
